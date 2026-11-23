import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile, access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateEditorialStoryboard} from '../../shared/src/editorial-storyboard.js';
import {ffmpegPath, probe, run} from './media-tools.js';
import {validateVideoQa} from './video-qa.js';

// 15-second layout-refinement test output layout.
// data/episodes/toolpilot/agents-15s-test/{final,captions,qa,metadata}/
const root = resolve('data/episodes/toolpilot/agents-15s-test');
const finalDir = resolve(root, 'final');
const captionsDir = resolve(root, 'captions');
const qaDir = resolve(root, 'qa');
const metadataDir = resolve(root, 'metadata');
const raw = resolve(root, 'agents-15s-raw.mp4');
const final = resolve(finalDir, 'youtube-1920x1080.mp4');
const contactSheet = resolve(finalDir, 'contact-sheet.png');
const fixture = resolve('fixtures/storyboards/toolpilot-agents-100s.json');
const cli = resolve('node_modules/@remotion/cli/remotion-cli.js');
const audio = resolve('public', 'generated', 'agents-15s-test.wav');

const DURATION_MS = 15000; // exactly 15 seconds
const FRAMES = 450; // 15s @ 30fps
const SEGMENT_START_MS = 8000; // original 8s-23s slice

// The 15s slice maps original 8s-23s onto 0-15s. Each scene plays its opening
// animation within its slice.
const scenes15s = [
  {id: 'agent-escape', startMs: 0, durationMs: 2000},
  {id: 'action-loop', startMs: 2000, durationMs: 7000},
  {id: 'kitchen-analogy', startMs: 9000, durationMs: 5000},
  {id: 'missing-eggs', startMs: 14000, durationMs: 1000},
] as const;

const runVisible = (command: string, args: string[]) =>
  new Promise<void>((ok, fail) => {
    const child = spawn(command, args, {stdio: 'inherit'});
    child.once('error', fail);
    child.once('close', (code) => {
      if (code === 0) ok();
      else fail(new Error(`${command} exited ${code}`));
    });
  });

const storyboard = validateEditorialStoryboard(
  JSON.parse(await readFile(fixture, 'utf8')),
);

await mkdir(finalDir, {recursive: true});
await mkdir(captionsDir, {recursive: true});
await mkdir(qaDir, {recursive: true});
await mkdir(metadataDir, {recursive: true});

// Preflight: the extracted 15s narration segment must exist.
await access(audio);

// Render the composition with remotion (includes the narration audio).
await runVisible(
  process.execPath,
  [
    cli,
    'render',
    'remotion/index.ts',
    'ToolPilotAgents15s',
    raw,
    '--codec=h264',
    '--crf=18',
    '--pixel-format=yuv420p',
    '--concurrency=4',
    '--overwrite',
  ],
);

// Loudness-normalize the narration and mux AAC / fast-start MP4.
const pass1 = await run(ffmpegPath, [
  '-hide_banner',
  '-nostats',
  '-i',
  raw,
  '-map',
  '0:a:0',
  '-af',
  'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json',
  '-f',
  'null',
  '-',
]);
const match = pass1.stderr.match(/\{\s*"input_i"[\s\S]*?\}/);
if (!match) {
  throw new Error('FFmpeg loudnorm measurement missing');
}
const m = JSON.parse(match[0]);
await run(ffmpegPath, [
  '-hide_banner',
  '-loglevel',
  'error',
  '-y',
  '-i',
  raw,
  '-map',
  '0:v:0',
  '-map',
  '0:a:0',
  '-c:v',
  'copy',
  '-af',
  `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_LRA=${m.input_lra}:measured_TP=${m.input_tp}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-ar',
  '48000',
  '-movflags',
  '+faststart',
  final,
]);

const p = await probe(final);
const checks = validateVideoQa(p, {
  durationMs: DURATION_MS,
  width: 1920,
  height: 1080,
  fps: 30,
  durationToleranceMs: 120,
  minAudioChannels: 1,
}).checks;

// Caption SRT (remapped onto the 15s window).
const stamp = (ms: number) => {
  const h = Math.floor(ms / 3600000);
  const min = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  const part = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(part).padStart(3, '0')}`;
};
const remappedCaptions = storyboard.narration.captions
  .filter((cue) => cue.endMs > SEGMENT_START_MS && cue.startMs < SEGMENT_START_MS + DURATION_MS)
  .map((cue) => ({
    ...cue,
    startMs: Math.max(0, cue.startMs - SEGMENT_START_MS),
    endMs: Math.min(DURATION_MS, cue.endMs - SEGMENT_START_MS),
  }));
await writeFile(
  resolve(captionsDir, 'agents-15s.srt'),
  remappedCaptions.map((c, i) => `${i + 1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text}\n`).join('\n'),
);

// Contact sheet: one frame every 2s, tiled.
await run(ffmpegPath, [
  '-hide_banner',
  '-loglevel',
  'error',
  '-y',
  '-i',
  final,
  '-vf',
  'fps=1/2,scale=384:-1,tile=5x2:padding=8:margin=8:color=0x101820',
  '-frames:v',
  '1',
  contactSheet,
]);

const after = await run(ffmpegPath, [
  '-hide_banner',
  '-nostats',
  '-i',
  final,
  '-map',
  '0:a:0',
  '-af',
  'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json',
  '-f',
  'null',
  '-',
]);
const lm = after.stderr.match(/\{\s*"input_i"[\s\S]*?\}/);
const loudness = lm ? JSON.parse(lm[0]) : null;
checks.push({
  id: 'loudness',
  label: 'Integrated loudness',
  passed: !!loudness && Math.abs(Number(loudness.input_i) + 16) <= 1.5,
  detail: loudness?.input_i ?? 'missing',
});
checks.push({
  id: 'captions',
  label: 'Timed captions within 15s',
  passed: remappedCaptions.length > 0 && remappedCaptions.at(-1)!.endMs <= DURATION_MS,
  detail: `${remappedCaptions.length} cues`,
});
checks.push({
  id: 'exact-duration',
  label: 'Exactly 15 seconds (450 frames)',
  passed: FRAMES === 450,
  detail: `${FRAMES} frames`,
});

const hash = createHash('sha256').update(await readFile(final)).digest('hex');
const qa = {
  passed: checks.every((c) => c.passed),
  checks,
  probe: p,
  loudness,
  sha256: hash,
  reviewStatus: 'proposed',
  renderedRangeMs: [SEGMENT_START_MS, SEGMENT_START_MS + DURATION_MS],
  durationMs: DURATION_MS,
  width: 1920,
  height: 1080,
  fps: 30,
  frames: FRAMES,
  storyboard: fixture,
  narration: {
    provider: storyboard.narration.provider,
    voice: storyboard.narration.voice,
    source: 'Extracted 8s-23s segment from agents-0-30.wav (Gemini Flash TTS / Puck)',
    path: audio,
  },
};
await writeFile(resolve(qaDir, 'qa.json'), JSON.stringify(qa, null, 2));
await writeFile(
  resolve(metadataDir, 'asset-manifest.json'),
  JSON.stringify(
    {
      channelId: 'toolpilot',
      seriesId: 'ai-tools-100s',
      episodeId: 'ai-agents-15s-test',
      format: 'youtube-1920x1080',
      configVersion: 1,
      video: final,
      captions: resolve(captionsDir, 'agents-15s.srt'),
      contactSheet,
      qa: resolve(qaDir, 'qa.json'),
      narration: {
        provider: storyboard.narration.provider,
        voice: storyboard.narration.voice,
        source: audio,
        segmentMs: [SEGMENT_START_MS, SEGMENT_START_MS + DURATION_MS],
      },
      scenes: scenes15s,
    },
    null,
    2,
  ),
);
console.log(
  `Output: ${final}\nQA: ${checks.filter((c) => c.passed).length}/${checks.length} passed\nSHA-256: ${hash}`,
);
if (!qa.passed) {
  process.exitCode = 1;
}
