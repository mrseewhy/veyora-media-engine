import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {generateGeminiVoice, GEMINI_TTS_MODEL} from './gemini-voice.js';
import {ffmpegPath, probe, run} from './media-tools.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const episode = JSON.parse(await readFile('episodes/toolpilot/singularity-explained/script.json', 'utf8')) as {
  channelId: string; seriesId: string; episodeId: string; configVersion: number;
  voice: {provider: string; name: string; style: string};
  segments: Array<{id: string; text: string}>;
};
if (episode.voice.name !== 'Puck' || episode.voice.provider !== GEMINI_TTS_MODEL) throw new Error('ToolPilot voice identity mismatch');
const dir = resolve('data/episodes/toolpilot/singularity-explained');
const publicDir = resolve('public/generated/singularity-explained');
await mkdir(dir, {recursive: true});
await mkdir(publicDir, {recursive: true});
const items = [];
for (const segment of episode.segments) {
  const raw = resolve(dir, `${segment.id}-raw.wav`);
  const output = resolve(publicDir, `${segment.id}.wav`);
  if (!existsSync(raw)) {
    await generateGeminiVoice(segment.text, raw, 'Puck', [{text: segment.text, style: episode.voice.style}]);
  }
  if (!existsSync(output)) await run(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-ar', '48000', '-ac', '1', output]);
  const info = await probe(output);
  const durationFrames = Math.ceil(Number(info.format.duration) * 30);
  const sha256 = createHash('sha256').update(await readFile(output)).digest('hex');
  items.push({id: segment.id, durationFrames, durationMs: Number(info.format.duration) * 1000, audioPath: `generated/singularity-explained/${segment.id}.wav`, sha256});
  console.log(`${segment.id}: ${info.format.duration}s`);
}
const contentFrames = items.reduce((sum, item) => sum + item.durationFrames, 0);
const manifest = {channelId: episode.channelId, seriesId: episode.seriesId, episodeId: episode.episodeId, format: 'shared-narration', configVersion: episode.configVersion, provider: GEMINI_TTS_MODEL, voice: 'Puck', style: episode.voice.style, contentFrames, contentSeconds: contentFrames / 30, items};
await writeFile(resolve(dir, 'narration-manifest.json'), JSON.stringify(manifest, null, 2));
if (contentFrames < 3000 || contentFrames > 3600) throw new Error(`Narration is ${contentFrames / 30}s; required 100–120s. Adjust script before rendering.`);
console.log(`Content: ${contentFrames / 30}s`);
