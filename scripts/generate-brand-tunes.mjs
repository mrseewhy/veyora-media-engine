#!/usr/bin/env node
/**
 * Generates short instrumental brand tunes for ToolPilot intro/outro.
 * Uses FFmpeg's sine source filter to create original, license-free melodic
 * audio. No external dependencies or paid services.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const ffmpeg = resolve(root, 'node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe = resolve(root, 'node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const outDir = resolve(root, 'public/generated');
mkdirSync(outDir, { recursive: true });

const SR = 48000;

// Musical note frequencies (Hz)
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
};

// Generate a sine tone for a given note and duration with a short fade to avoid clicks
function toneFile(freq, durationSec) {
  const safeName = `note_${String(freq).replace('.', 'p')}_${String(durationSec).replace('.', 'p')}`;
  const file = resolve(outDir, `${safeName}.wav`);
  // Apply a very short fade-in/fade-out (10ms) to avoid clicks between segments
  const fade = 0.01;
  execFileSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i',
    `sine=frequency=${freq}:duration=${durationSec}:sample_rate=${SR}`,
    '-af', `afade=t=in:st=0:d=${fade},afade=t=out:st=${durationSec - fade}:d=${fade}`,
    '-c:a', 'pcm_s16le', '-ar', String(SR), '-ac', '1', '-y', file,
  ]);
  return file;
}

// Generate a tune from a sequence of [note, durationSeconds]
function generateTune(name, sequence) {
  const parts = sequence.map(([note, dur]) => {
    const f = NOTE[note];
    if (!f) throw new Error(`Unknown note: ${note}`);
    return toneFile(f, dur);
  });
  const listFile = resolve(outDir, `${name}-list.txt`);
  writeFileSync(
    listFile,
    parts.map((p) => `file '${p}'`).join('\n') + '\n',
  );
  const output = resolve(outDir, `${name}.wav`);
  execFileSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-c:a', 'pcm_s16le', '-ar', String(SR), '-ac', '1', output,
  ]);
  return output;
}

// Intro tune: exactly 5 seconds, upbeat arpeggio
const introSequence = [
  ['C4', 0.45], ['E4', 0.45], ['G4', 0.45], ['C5', 0.45],
  ['E4', 0.45], ['G4', 0.45], ['C4', 0.45],
  ['D4', 0.35], ['F4', 0.35], ['A4', 0.35], ['C5', 0.35],
  ['G4', 0.45],
];
const introOut = generateTune('toolpilot-intro-tune', introSequence);

// Outro tune: exactly 8 seconds, complementary, resolving downward
const outroSequence = [
  ['C5', 0.7], ['A4', 0.7], ['G4', 0.7], ['F4', 0.7],
  ['E4', 0.7], ['D4', 0.7], ['C4', 0.7],
  ['G3', 0.7], ['C4', 2.4],
];
const outroOut = generateTune('toolpilot-outro-tune', outroSequence);

for (const f of [introOut, outroOut]) {
  const dur = Number(
    execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f], { encoding: 'utf8' }),
  );
  console.log(`${f}: ${dur.toFixed(2)}s`);
}

console.log('Intro tune:', introOut);
console.log('Outro tune:', outroOut);
