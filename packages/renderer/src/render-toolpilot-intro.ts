import {spawn} from 'node:child_process';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {probe} from './media-tools.js';

const generated = resolve('public/generated');
const output = resolve('data/episodes/toolpilot/ai-agents-100s/qa/intro-v1');
const montageDir = resolve('montages/intro');
await mkdir(generated, {recursive: true});
await mkdir(output, {recursive: true});
await mkdir(montageDir, {recursive: true});
await copyFile(resolve('toolpilot-icon.png'), resolve(generated, 'toolpilot-icon.png'));

// Original five-second instrumental signature: soft sub, bright bell tones,
// and a filtered shimmer. Deterministic PCM keeps preview renders repeatable.
const rate = 48000;
const seconds = 5;
const samples = Buffer.alloc(rate * seconds * 4);
const notes = [
  {t: 0.15, f: 196, d: 1.2, a: 0.13},
  {t: 0.51, f: 293.66, d: 1.15, a: 0.16},
  {t: 0.93, f: 392, d: 1.35, a: 0.18},
  {t: 1.48, f: 587.33, d: 1.65, a: 0.14},
  {t: 2.11, f: 783.99, d: 2.3, a: 0.13},
  {t: 2.3, f: 392, d: 2.3, a: 0.09},
];
for (let i = 0; i < rate * seconds; i++) {
  const t = i / rate;
  let x = 0;
  for (const n of notes) {
    const v = t - n.t;
    if (v < 0 || v > n.d) continue;
    const env = Math.min(1, v * 30) * Math.exp(-v * (n.f < 300 ? 2.1 : 1.5)) * Math.min(1, (n.d - v) * 6);
    x += n.a * env * (Math.sin(2 * Math.PI * n.f * v) + 0.27 * Math.sin(2 * Math.PI * n.f * 2.003 * v));
  }
  const swish = Math.exp(-Math.pow((t - 0.56) / 0.31, 2)) * 0.025 * (Math.sin(2 * Math.PI * (600 * t + 300 * t * t)));
  const fade = Math.min(1, (seconds - t) / 0.35);
  const value = Math.max(-1, Math.min(1, (x + swish) * fade));
  samples.writeInt16LE(Math.round(value * 32767), i * 4);
  samples.writeInt16LE(Math.round(value * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write('RIFF', 0); header.writeUInt32LE(36 + samples.length, 4); header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 4, 28); header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(samples.length, 40);
const audioPath = resolve(generated, 'toolpilot-intro-v1.wav');
await writeFile(audioPath, Buffer.concat([header, samples]));

const run = (args: string[]) => new Promise<void>((ok, fail) => {
  const child = spawn(process.execPath, [resolve('node_modules/@remotion/cli/remotion-cli.js'), ...args], {stdio: 'inherit'});
  child.once('error', fail);
  child.once('close', (code) => code === 0 ? ok() : fail(new Error(`Remotion exited ${code}`)));
});
const formats = [
  {name: 'landscape', id: 'ToolPilotIntroV1', width: 1920, height: 1080, file: 'toolpilot-intro-v1.mp4'},
  {name: 'vertical', id: 'ToolPilotIntroV1Vertical', width: 1080, height: 1920, file: 'toolpilot-intro-v1-vertical.mp4'},
  {name: 'square', id: 'ToolPilotIntroV1Square', width: 1080, height: 1080, file: 'toolpilot-intro-v1-square.mp4'},
] as const;
const previews = [];
for (const format of formats) {
  const videoPath = resolve(output, format.file);
  await run(['render', 'remotion/index.ts', format.id, videoPath, '--codec=h264', '--crf=18', '--pixel-format=yuv420p', '--concurrency=4', '--overwrite']);
  const info = await probe(videoPath);
  const video = info.streams.find((stream) => stream.codec_type === 'video');
  const audio = info.streams.find((stream) => stream.codec_type === 'audio');
  if (video?.width !== format.width || video.height !== format.height || video.r_frame_rate !== '30/1' || Math.abs(Number(info.format.duration) - 5) > 0.05 || !audio) {
    throw new Error(`Technical QA failed for ${format.name}: ${JSON.stringify(info)}`);
  }
  const hash = createHash('sha256').update(await readFile(videoPath)).digest('hex');
  await copyFile(videoPath, resolve(montageDir, format.file));
  previews.push({format: format.name, composition: format.id, width: format.width, height: format.height, frames: 150, output: videoPath, sha256: hash, probe: info});
  console.log(`Preview: ${videoPath}`);
}
await writeFile(resolve(output, 'manifest.json'), JSON.stringify({version: 1, sourceIcon: 'toolpilot-icon.png', sourceAudio: audioPath, reviewStatus: 'proposed', previews}, null, 2));
