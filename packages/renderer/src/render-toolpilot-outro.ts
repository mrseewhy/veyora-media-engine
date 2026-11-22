import {spawn} from 'node:child_process';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {probe} from './media-tools.js';

const generated = resolve('public/generated');
const output = resolve('data/episodes/toolpilot/ai-agents-100s/qa/outro-v1');
const montageDir = resolve('montages/outro');
await mkdir(generated, {recursive: true});
await mkdir(output, {recursive: true});
await mkdir(montageDir, {recursive: true});
await copyFile(resolve('toolpilot-icon.png'), resolve(generated, 'toolpilot-icon.png'));

// Eight-second original instrumental: an opening arpeggio resolves to a quiet
// sustained chord while the picture holds still for the last three seconds.
const rate = 48000;
const seconds = 8;
const samples = Buffer.alloc(rate * seconds * 4);
const notes = [
  {t: 0.08, f: 196, d: 1.4, a: 0.12},
  {t: 0.48, f: 293.66, d: 1.3, a: 0.15},
  {t: 0.93, f: 392, d: 1.55, a: 0.17},
  {t: 1.54, f: 587.33, d: 1.8, a: 0.15},
  {t: 2.22, f: 783.99, d: 2.5, a: 0.12},
  {t: 3.06, f: 392, d: 4.7, a: 0.065},
  {t: 3.06, f: 587.33, d: 4.7, a: 0.055},
];
for (let i = 0; i < rate * seconds; i++) {
  const t = i / rate;
  let x = 0;
  for (const n of notes) {
    const v = t - n.t;
    if (v < 0 || v > n.d) continue;
    const env = Math.min(1, v * 24) * Math.exp(-v * (n.d > 4 ? 0.42 : 1.35)) * Math.min(1, (n.d - v) * 4);
    x += n.a * env * (Math.sin(2 * Math.PI * n.f * v) + 0.23 * Math.sin(2 * Math.PI * n.f * 2.003 * v));
  }
  const fade = Math.min(1, (seconds - t) / 0.7);
  const value = Math.max(-1, Math.min(1, x * fade));
  samples.writeInt16LE(Math.round(value * 32767), i * 4);
  samples.writeInt16LE(Math.round(value * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write('RIFF', 0); header.writeUInt32LE(36 + samples.length, 4); header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 4, 28); header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(samples.length, 40);
const audioPath = resolve(generated, 'toolpilot-outro-v1.wav');
await writeFile(audioPath, Buffer.concat([header, samples]));

const run = (args: string[]) => new Promise<void>((ok, fail) => {
  const child = spawn(process.execPath, [resolve('node_modules/@remotion/cli/remotion-cli.js'), ...args], {stdio: 'inherit'});
  child.once('error', fail);
  child.once('close', (code) => code === 0 ? ok() : fail(new Error(`Remotion exited ${code}`)));
});
const formats = [
  {name: 'landscape', id: 'ToolPilotOutroV1', width: 1920, height: 1080, file: 'toolpilot-outro-v1.mp4'},
  {name: 'vertical', id: 'ToolPilotOutroV1Vertical', width: 1080, height: 1920, file: 'toolpilot-outro-v1-vertical.mp4'},
  {name: 'square', id: 'ToolPilotOutroV1Square', width: 1080, height: 1080, file: 'toolpilot-outro-v1-square.mp4'},
] as const;
const previews = [];
for (const format of formats) {
  const videoPath = resolve(output, format.file);
  await run(['render', 'remotion/index.ts', format.id, videoPath, '--codec=h264', '--crf=18', '--pixel-format=yuv420p', '--concurrency=4', '--overwrite']);
  const info = await probe(videoPath);
  const video = info.streams.find((stream) => stream.codec_type === 'video');
  const audio = info.streams.find((stream) => stream.codec_type === 'audio');
  if (video?.width !== format.width || video.height !== format.height || video.r_frame_rate !== '30/1' || Math.abs(Number(info.format.duration) - 8) > 0.05 || !audio) {
    throw new Error(`Technical QA failed for ${format.name}: ${JSON.stringify(info)}`);
  }
  const hash = createHash('sha256').update(await readFile(videoPath)).digest('hex');
  await copyFile(videoPath, resolve(montageDir, format.file));
  previews.push({format: format.name, composition: format.id, width: format.width, height: format.height, frames: 240, motionFrames: 150, stillFrames: 90, output: videoPath, sha256: hash, probe: info});
  console.log(`Preview: ${videoPath}`);
}
await writeFile(resolve(output, 'manifest.json'), JSON.stringify({version: 1, sourceIcon: 'toolpilot-icon.png', sourceAudio: audioPath, reviewStatus: 'proposed', previews}, null, 2));
