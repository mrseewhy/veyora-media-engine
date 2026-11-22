import {createHash} from 'node:crypto';
import {access, mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateStoryboard, type Storyboard} from '../../shared/src/storyboard.js';
import {
  detectSilence,
  ffmpegPath,
  ffprobePath,
  probe,
  trimAudio,
} from './media-tools.js';

const STORYBOARD_PATH = resolve('fixtures/storyboards/toolpilot-latency-10s.json');
const RAW_AUDIO_PATH = resolve('data/renderer10/narration-raw.wav');
const PUBLIC_AUDIO_PATH = resolve('public/generated/latency-narration.wav');
const TIMING_PATH = resolve('data/renderer10/narration-timing.json');
const SFX_PATH = resolve('public/generated/latency-sfx.wav');
const MANIFEST_PATH = resolve('data/renderer10/asset-manifest.json');
const AUDIO_START_MS = 300;
const TOLERANCE_MS = 120;

const round10 = (value: number) => Math.round(value / 10) * 10;
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

interface Timing {
  source: string;
  output: string;
  sourceDurationMs: number;
  trimmedDurationMs: number;
  audioStartMs: number;
  speechStartMs: number;
  pauseStartMs: number;
  pauseEndMs: number;
  speechEndMs: number;
  captions: Array<{id: string; startMs: number; endMs: number}>;
  measuredAt: string;
  sourceSha256: string;
  outputSha256: string;
}

function buildSfx(): Buffer {
  const rate = 48_000;
  const seconds = 10;
  const samples = rate * seconds;
  const data = new Float64Array(samples);

  const addTone = (
    startSeconds: number,
    durationSeconds: number,
    frequency: (t: number) => number,
    amplitude: (t: number) => number,
  ) => {
    const start = Math.floor(startSeconds * rate);
    const length = Math.floor(durationSeconds * rate);
    for (let i = 0; i < length; i += 1) {
      const index = start + i;
      if (index < 0 || index >= samples) continue;
      const t = i / rate;
      data[index] += amplitude(t) * Math.sin(2 * Math.PI * frequency(t) * t);
    }
  };

  // Network panel reveal: a small, dry interface click.
  addTone(1.5, 0.05, (t) => 1500 - 300 * t, (t) => 0.11 * Math.exp(-70 * t));
  addTone(1.5, 0.16, (t) => 180, (t) => 0.045 * Math.exp(-24 * t));

  // Cut into the measured trace: a quiet low riser, not a cinematic whoosh.
  addTone(
    3.72,
    0.38,
    (t) => 170 + 640 * (t / 0.38),
    (t) => 0.06 * Math.sin((Math.PI * t) / 0.38) ** 2,
  );
  addTone(3.78, 0.22, (t) => 96, (t) => 0.05 * Math.exp(-18 * t));

  // Verdict: a restrained low impact and a short high tick.
  addTone(8.2, 0.6, (t) => 68, (t) => 0.13 * Math.exp(-9 * t));
  addTone(8.2, 0.045, (t) => 1900, (t) => 0.08 * Math.exp(-80 * t));

  const buffer = Buffer.alloc(44 + samples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i += 1) {
    const value = Math.max(-1, Math.min(1, data[i]));
    buffer.writeInt16LE(Math.round(value * 32_767), 44 + i * 2);
  }
  return buffer;
}

async function buildTiming(): Promise<{
  timing: Timing;
  sourceBytes: Buffer;
  outputBytes: Buffer;
}> {
  if (!(await exists(RAW_AUDIO_PATH))) {
    throw new Error(
      `Missing narration source ${RAW_AUDIO_PATH}. Run "npm run voice:latency" first (requires GEMINI_API_KEY).`,
    );
  }

  const sourceBytes = await readFile(RAW_AUDIO_PATH);
  const rawProbe = await probe(RAW_AUDIO_PATH);
  const rawDuration = Number(rawProbe.format.duration ?? 0);
  if (!Number.isFinite(rawDuration) || rawDuration <= 0) {
    throw new Error('Could not read narration duration');
  }

  const rawSilence = await detectSilence(RAW_AUDIO_PATH, {noiseDb: -40, minDuration: 0.12});
  const leading = rawSilence.intervals.find((interval) => interval.start <= 0.01);
  const trailing = rawSilence.intervals.find(
    (interval) => interval.end >= rawDuration - 0.02,
  );
  const speechStart = leading?.end ?? 0;
  const speechEnd = trailing?.start ?? rawDuration;
  const internal = rawSilence.intervals
    .filter(
      (interval) =>
        interval.start > speechStart + 0.05 && interval.end < speechEnd - 0.05,
    )
    .sort((a, b) => b.duration - a.duration)[0];
  if (!internal) {
    throw new Error('No sentence pause found in narration; cannot align two captions');
  }

  const trimStart = Math.max(0, speechStart - 0.08);
  const trimEnd = Math.min(rawDuration, speechEnd + 0.12);
  const trimDuration = trimEnd - trimStart;
  await mkdir(resolve('public/generated'), {recursive: true});
  await trimAudio(RAW_AUDIO_PATH, PUBLIC_AUDIO_PATH, trimStart, trimDuration);

  const outputBytes = await readFile(PUBLIC_AUDIO_PATH);
  const outputProbe = await probe(PUBLIC_AUDIO_PATH);
  const outputDuration = Number(outputProbe.format.duration ?? 0);
  const outputSilence = await detectSilence(PUBLIC_AUDIO_PATH, {
    noiseDb: -40,
    minDuration: 0.12,
  });
  const outputLeading = outputSilence.intervals.find((interval) => interval.start <= 0.01);
  const outputTrailing = outputSilence.intervals.find(
    (interval) => interval.end >= outputDuration - 0.02,
  );
  const outputSpeechStart = outputLeading?.end ?? 0;
  const outputSpeechEnd = outputTrailing?.start ?? outputDuration;
  const outputPause = outputSilence.intervals
    .filter(
      (interval) =>
        interval.start > outputSpeechStart + 0.05 &&
        interval.end < outputSpeechEnd - 0.05,
    )
    .sort((a, b) => b.duration - a.duration)[0];
  if (!outputPause) {
    throw new Error('No sentence pause found in trimmed narration');
  }

  const captions = [
    {
      id: 'c1',
      startMs: round10(AUDIO_START_MS + outputSpeechStart * 1000 - 40),
      endMs: round10(AUDIO_START_MS + outputPause.start * 1000 + 70),
    },
    {
      id: 'c2',
      startMs: round10(AUDIO_START_MS + outputPause.end * 1000 - 40),
      endMs: round10(AUDIO_START_MS + outputSpeechEnd * 1000 + 90),
    },
  ];

  const timing: Timing = {
    source: 'data/renderer10/narration-raw.wav',
    output: 'public/generated/latency-narration.wav',
    sourceDurationMs: Math.round(rawDuration * 1000),
    trimmedDurationMs: Math.round(outputDuration * 1000),
    audioStartMs: AUDIO_START_MS,
    speechStartMs: round10(AUDIO_START_MS + outputSpeechStart * 1000),
    pauseStartMs: round10(AUDIO_START_MS + outputPause.start * 1000),
    pauseEndMs: round10(AUDIO_START_MS + outputPause.end * 1000),
    speechEndMs: round10(AUDIO_START_MS + outputSpeechEnd * 1000),
    captions,
    measuredAt: new Date().toISOString(),
    sourceSha256: sha256(sourceBytes),
    outputSha256: sha256(outputBytes),
  };

  return {timing, sourceBytes, outputBytes};
}

function applyTiming(storyboard: Storyboard, timing: Timing): Storyboard {
  const updated = structuredClone(storyboard);
  updated.narration.durationMs = timing.trimmedDurationMs;
  updated.narration.startMs = timing.audioStartMs;
  updated.narration.measured = true;
  for (const expected of timing.captions) {
    const cue = updated.narration.captions.find((item) => item.id === expected.id);
    if (!cue) throw new Error(`Storyboard is missing caption ${expected.id}`);
    cue.startMs = expected.startMs;
    cue.endMs = expected.endMs;
  }
  for (const beat of updated.beats) {
    if (!beat.narration || beat.narration.captionIds.length === 0) continue;
    const cues = beat.narration.captionIds
      .map((id) => updated.narration.captions.find((cue) => cue.id === id))
      .filter((cue): cue is NonNullable<typeof cue> => Boolean(cue));
    if (cues.length === 0) continue;
    beat.narration.startMs = Math.min(...cues.map((cue) => cue.startMs));
    beat.narration.endMs = Math.max(...cues.map((cue) => cue.endMs));
  }
  return updated;
}

function compareTiming(storyboard: Storyboard, timing: Timing): string[] {
  const issues: string[] = [];
  if (Math.abs(storyboard.narration.durationMs - timing.trimmedDurationMs) > TOLERANCE_MS) {
    issues.push(
      `narration.durationMs is ${storyboard.narration.durationMs}, measured ${timing.trimmedDurationMs}`,
    );
  }
  if (storyboard.narration.startMs !== timing.audioStartMs) {
    issues.push(
      `narration.startMs is ${storyboard.narration.startMs}, expected ${timing.audioStartMs}`,
    );
  }
  for (const expected of timing.captions) {
    const cue = storyboard.narration.captions.find((item) => item.id === expected.id);
    if (!cue) {
      issues.push(`missing caption ${expected.id}`);
      continue;
    }
    if (Math.abs(cue.startMs - expected.startMs) > TOLERANCE_MS) {
      issues.push(`${cue.id}.startMs is ${cue.startMs}, measured ${expected.startMs}`);
    }
    if (Math.abs(cue.endMs - expected.endMs) > TOLERANCE_MS) {
      issues.push(`${cue.id}.endMs is ${cue.endMs}, measured ${expected.endMs}`);
    }
  }
  return issues;
}

async function main() {
  const sync = process.argv.includes('--sync');
  const rawStoryboard = JSON.parse(await readFile(STORYBOARD_PATH, 'utf8')) as unknown;
  const storyboard = validateStoryboard(rawStoryboard);
  const {timing, sourceBytes, outputBytes} = await buildTiming();

  if (sync) {
    const updated = applyTiming(storyboard, timing);
    validateStoryboard(updated);
    await writeFile(STORYBOARD_PATH, `${JSON.stringify(updated, null, 2)}\n`);
    console.log(`Updated ${STORYBOARD_PATH}`);
  } else {
    const issues = compareTiming(storyboard, timing);
    if (issues.length > 0) {
      throw new Error(
        `Narration timings do not match the storyboard:\n- ${issues.join(
          '\n- ',
        )}\nRun "npm run latency:sync" to update the fixture, then review the diff.`,
      );
    }
  }

  const sfxBytes = buildSfx();
  await writeFile(SFX_PATH, sfxBytes);
  await mkdir(resolve('data/renderer10'), {recursive: true});
  await writeFile(TIMING_PATH, `${JSON.stringify(timing, null, 2)}\n`);

  const manifest = {
    generatedAt: new Date().toISOString(),
    storyboard: 'fixtures/storyboards/toolpilot-latency-10s.json',
    storyboardSha256: sha256(await readFile(STORYBOARD_PATH)),
    ffmpeg: ffmpegPath,
    ffprobe: ffprobePath,
    narration: {
      source: timing.source,
      output: timing.output,
      provider: storyboard.narration.provider,
      voice: storyboard.narration.voice,
      sourceDurationMs: timing.sourceDurationMs,
      trimmedDurationMs: timing.trimmedDurationMs,
      startMs: timing.audioStartMs,
      sourceSha256: timing.sourceSha256,
      outputSha256: sha256(outputBytes),
      sourceBytes: sourceBytes.length,
    },
    sfx: {
      output: 'public/generated/latency-sfx.wav',
      durationMs: 10_000,
      sha256: sha256(sfxBytes),
      description: 'Original synthesized click, riser and low impact; no third-party audio.',
    },
    captions: timing.captions,
    disclosure: storyboard.evidence[0]?.disclosure ?? '',
  };
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `Narration: ${timing.sourceDurationMs} ms raw -> ${timing.trimmedDurationMs} ms trimmed, starts at ${timing.audioStartMs} ms`,
  );
  console.log(
    `Captions: ${timing.captions
      .map((cue) => `${cue.id} ${cue.startMs}-${cue.endMs} ms`)
      .join(', ')}`,
  );
  console.log(`Assets: ${PUBLIC_AUDIO_PATH}`);
  console.log(`SFX: ${SFX_PATH}`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
