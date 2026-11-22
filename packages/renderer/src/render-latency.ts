import {createHash} from 'node:crypto';
import {access, mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {type Storyboard} from '../../shared/src/storyboard.js';
import {
  ffmpegPath,
  ffprobePath,
  probe,
  run,
} from './media-tools.js';
import {
  DEFAULT_STORYBOARD_PATH,
  loadAndPreflight,
} from './validate-storyboard.js';
import {validateVideoQa, type VideoQaCheck} from './video-qa.js';

const COMPOSITION_ID = 'ToolPilotLatency10s';
const OUTPUT_DIR = resolve('data/renderer10');
const RAW_VIDEO = resolve(OUTPUT_DIR, 'toolpilot-latency-10s-raw.mp4');
const FINAL_VIDEO = resolve(OUTPUT_DIR, 'toolpilot-latency-10s.mp4');
const SRT_PATH = resolve(OUTPUT_DIR, 'toolpilot-latency-10s.srt');
const TRANSCRIPT_PATH = resolve(OUTPUT_DIR, 'transcript.txt');
const QA_PATH = resolve(OUTPUT_DIR, 'qa.json');
const METADATA_PATH = resolve(OUTPUT_DIR, 'render-metadata.json');
const CONTACT_SHEET_PATH = resolve(OUTPUT_DIR, 'contact-sheet.png');
const ASSET_MANIFEST_PATH = resolve(OUTPUT_DIR, 'asset-manifest.json');
const REMOTION_CLI = resolve('node_modules/@remotion/cli/remotion-cli.js');

const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function runVisible(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
    });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`${command} exited with code ${code ?? 'unknown'}`));
      }
    });
  });
}

interface LoudnormMeasurement {
  input_i: string;
  input_tp: string;
  input_lra: string;
  input_thresh: string;
  target_offset: string;
}

function parseLoudnorm(stderr: string): LoudnormMeasurement {
  const start = stderr.lastIndexOf('{');
  const end = stderr.lastIndexOf('}');
  if (start === -1 || end <= start) {
    throw new Error('Could not find loudnorm JSON in FFmpeg output');
  }
  const parsed = JSON.parse(stderr.slice(start, end + 1)) as Partial<LoudnormMeasurement>;
  const required: Array<keyof LoudnormMeasurement> = [
    'input_i',
    'input_tp',
    'input_lra',
    'input_thresh',
    'target_offset',
  ];
  for (const key of required) {
    if (typeof parsed[key] !== 'string') {
      throw new Error(`loudnorm output is missing ${key}`);
    }
  }
  return parsed as LoudnormMeasurement;
}

async function measureLoudnorm(file: string): Promise<LoudnormMeasurement> {
  const {stderr} = await run(ffmpegPath, [
    '-hide_banner',
    '-nostats',
    '-i',
    file,
    '-map',
    '0:a:0',
    '-af',
    'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json',
    '-f',
    'null',
    '-',
  ]);
  return parseLoudnorm(stderr);
}

async function renderWithRemotion(): Promise<void> {
  console.log('\nRendering composition with Remotion...');
  await runVisible(process.execPath, [
    REMOTION_CLI,
    'render',
    'remotion/index.ts',
    COMPOSITION_ID,
    RAW_VIDEO,
    '--codec=h264',
    '--crf=18',
    '--pixel-format=yuv420p',
    '--concurrency=4',
    '--overwrite',
  ]);
}

async function normalizeAudio(): Promise<void> {
  console.log('\nNormalizing the final mix with FFmpeg (two-pass loudnorm)...');
  const measured = await measureLoudnorm(RAW_VIDEO);
  console.log(
    `Raw mix: ${measured.input_i} LUFS, true peak ${measured.input_tp} dBTP, LRA ${measured.input_lra} LU`,
  );
  await run(ffmpegPath, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    RAW_VIDEO,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0',
    '-c:v',
    'copy',
    '-af',
    `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${measured.input_i}:measured_LRA=${measured.input_lra}:measured_TP=${measured.input_tp}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`,
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-ar',
    '48000',
    '-movflags',
    '+faststart',
    FINAL_VIDEO,
  ]);
}

async function writeContactSheet(): Promise<void> {
  console.log('Building contact sheet...');
  await run(ffmpegPath, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    FINAL_VIDEO,
    '-vf',
    'fps=1,scale=384:-1,tile=5x2:padding=8:margin=8:color=0x070D14',
    '-frames:v',
    '1',
    CONTACT_SHEET_PATH,
  ]);
}

function captionChecks(storyboard: Storyboard): VideoQaCheck[] {
  const durationMs = storyboard.format.durationMs;
  const captions = storyboard.narration.captions;
  const inRange = captions.every(
    (cue) => cue.startMs >= 0 && cue.endMs <= durationMs && cue.endMs > cue.startMs,
  );
  const ordered = captions.every(
    (cue, index) => index === 0 || cue.startMs >= captions[index - 1].endMs,
  );
  return [
    {
      id: 'captions-present',
      label: 'Caption track has cues',
      passed: captions.length > 0,
      detail: `${captions.length} cue(s)`,
    },
    {
      id: 'captions-in-range',
      label: 'Captions sit inside the video',
      passed: inRange,
      detail: captions
        .map((cue) => `${cue.id} ${cue.startMs}-${cue.endMs} ms`)
        .join(', '),
    },
    {
      id: 'captions-ordered',
      label: 'Captions do not overlap',
      passed: ordered,
      detail: ordered ? 'ordered' : 'overlap found',
    },
  ];
}

async function main() {
  const skipRender = process.argv.includes('--skip-render');
  const storyboardPath = process.argv.find(
    (argument) => argument.endsWith('.json') && !argument.startsWith('--'),
  ) ?? DEFAULT_STORYBOARD_PATH;

  const preflight = await loadAndPreflight(storyboardPath, {
    requireProofSceneTypes: true,
  });
  const {storyboard} = preflight;
  for (const warning of preflight.warnings) console.warn(`WARN  ${warning}`);
  if (preflight.issues.length > 0) {
    throw new Error(
      `Storyboard preflight failed:\n- ${preflight.issues.join('\n- ')}`,
    );
  }

  await mkdir(OUTPUT_DIR, {recursive: true});

  if (!skipRender) {
    await renderWithRemotion();
  } else if (!(await exists(RAW_VIDEO))) {
    throw new Error(`--skip-render was passed but ${RAW_VIDEO} does not exist`);
  }

  await normalizeAudio();
  await writeContactSheet();

  await writeFile(SRT_PATH, preflight.srt);
  const transcript = [
    'TOOLPILOT — LATENCY / 10 SEC',
    '',
    `Narration (${storyboard.narration.provider} / ${storyboard.narration.voice}):`,
    storyboard.narration.text,
    '',
    'Captions:',
    preflight.srt.trim(),
    '',
    `Disclosure: ${storyboard.evidence[0]?.disclosure ?? ''}`,
    '',
  ].join('\n');
  await writeFile(TRANSCRIPT_PATH, transcript);

  const finalProbe = await probe(FINAL_VIDEO);
  const machineQa = validateVideoQa(finalProbe, {
    durationMs: storyboard.format.durationMs,
    width: storyboard.format.width,
    height: storyboard.format.height,
    fps: storyboard.format.fps,
    minAudioChannels: 1,
  });
  const outputLoudness = await measureLoudnorm(FINAL_VIDEO);
  const outputLoudnessValue = Number(outputLoudness.input_i);
  const outputTruePeak = Number(outputLoudness.input_tp);
  const loudnessChecks: VideoQaCheck[] = [
    {
      id: 'loudness-integrated',
      label: 'Integrated loudness is -16 LUFS (±1.5)',
      passed:
        Number.isFinite(outputLoudnessValue) &&
        Math.abs(outputLoudnessValue + 16) <= 1.5,
      detail: `${outputLoudness.input_i} LUFS`,
    },
    {
      id: 'loudness-true-peak',
      label: 'True peak is at or below -1.0 dBTP',
      passed: Number.isFinite(outputTruePeak) && outputTruePeak <= -1.0,
      detail: `${outputLoudness.input_tp} dBTP`,
    },
  ];

  const checks = [...machineQa.checks, ...loudnessChecks, ...captionChecks(storyboard)];
  const passed = checks.every((check) => check.passed);
  const finalBytes = await readFile(FINAL_VIDEO);
  const finalStat = await stat(FINAL_VIDEO);
  const storyboardBytes = await readFile(resolve(storyboardPath));
  const remotionPackage = JSON.parse(
    await readFile(resolve('node_modules/remotion/package.json'), 'utf8'),
  ) as {version: string};
  const ffmpegVersion = (
    await run(ffmpegPath, ['-hide_banner', '-version'])
  ).stdout.split(/\r?\n/)[0];
  const assetManifest = (await exists(ASSET_MANIFEST_PATH))
    ? (JSON.parse(await readFile(ASSET_MANIFEST_PATH, 'utf8')) as unknown)
    : null;

  const qa = {
    generatedAt: new Date().toISOString(),
    passed,
    output: FINAL_VIDEO,
    sizeBytes: finalStat.size,
    sha256: sha256(finalBytes),
    format: {
      width: machineQa.video.width,
      height: machineQa.video.height,
      fps: machineQa.video.fps,
      frames: machineQa.video.frames,
      durationMs: machineQa.video.durationMs,
    },
    video: machineQa.video,
    audio: machineQa.audio,
    loudness: {
      integratedLufs: outputLoudnessValue,
      truePeakDbtp: outputTruePeak,
      loudnessRangeLu: Number(outputLoudness.input_lra),
    },
    captions: storyboard.narration.captions.map((cue) => ({
      id: cue.id,
      startMs: cue.startMs,
      endMs: cue.endMs,
      text: cue.text,
    })),
    checks,
    narration: {
      assetId: storyboard.narration.assetId,
      provider: storyboard.narration.provider,
      voice: storyboard.narration.voice,
      audioPath: storyboard.narration.audioPath,
      startMs: storyboard.narration.startMs,
      durationMs: storyboard.narration.durationMs,
      measured: storyboard.narration.measured,
    },
    evidence: storyboard.evidence,
    disclosure: storyboard.evidence[0]?.disclosure ?? '',
    reviewStatus: storyboard.review.status,
    storyboard: {
      path: storyboardPath,
      sha256: sha256(storyboardBytes),
    },
    assetManifest,
  };
  await writeFile(QA_PATH, `${JSON.stringify(qa, null, 2)}\n`);

  const metadata = {
    generatedAt: qa.generatedAt,
    compositionId: COMPOSITION_ID,
    storyboard: storyboardPath,
    storyboardSha256: qa.storyboard.sha256,
    output: FINAL_VIDEO,
    rawOutput: RAW_VIDEO,
    srt: SRT_PATH,
    transcript: TRANSCRIPT_PATH,
    qa: QA_PATH,
    contactSheet: CONTACT_SHEET_PATH,
    commands: {
      render: [
        process.execPath,
        REMOTION_CLI,
        'render',
        'remotion/index.ts',
        COMPOSITION_ID,
        RAW_VIDEO,
        '--codec=h264',
        '--crf=18',
        '--pixel-format=yuv420p',
        '--concurrency=4',
        '--overwrite',
      ],
      normalize:
        'ffmpeg -i raw -map 0:v:0 -map 0:a:0 -c:v copy -af loudnorm=... -c:a aac -b:a 192k -movflags +faststart',
      contactSheet:
        'ffmpeg -i final -vf "fps=1,scale=384:-1,tile=5x2" -frames:v 1 contact-sheet.png',
    },
    toolchain: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      remotion: remotionPackage.version,
      ffmpeg: ffmpegVersion,
      ffmpegPath,
      ffprobePath,
    },
  };
  await writeFile(METADATA_PATH, `${JSON.stringify(metadata, null, 2)}\n`);

  console.log('\nMachine QA');
  for (const check of checks) {
    console.log(`${check.passed ? 'PASS' : 'FAIL'}  ${check.label} — ${check.detail}`);
  }
  console.log(`\nOutput: ${FINAL_VIDEO}`);
  console.log(`SRT: ${SRT_PATH}`);
  console.log(`QA: ${QA_PATH}`);
  console.log(`Contact sheet: ${CONTACT_SHEET_PATH}`);
  console.log(`Size: ${(finalStat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Loudness: ${outputLoudness.input_i} LUFS, ${outputLoudness.input_tp} dBTP`);

  if (!passed) {
    throw new Error('Machine QA failed; inspect the failing checks above.');
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
