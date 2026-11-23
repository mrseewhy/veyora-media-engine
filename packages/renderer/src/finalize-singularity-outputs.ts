import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {ffmpegPath, probe, run} from './media-tools.js';
import {normalizeVideoAudio} from './normalize-video-audio.js';
import {validateVideoQa} from './video-qa.js';

const root = resolve('data/episodes/toolpilot/singularity-explained');
const manifestPath = resolve(root, 'metadata/artifact-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
  durationFrames: number;
  artifacts: Array<{format: string; videoPath: string; contactSheet: string; sha256: string; qaPassed: boolean; checks: unknown[]; loudness: unknown; probe: unknown}>;
};
const sizes: Record<string, [number, number]> = {landscape: [1920, 1080], vertical: [1080, 1920], square: [1080, 1080]};
for (const artifact of manifest.artifacts) {
  await normalizeVideoAudio(artifact.videoPath);
  const info = await probe(artifact.videoPath);
  const [width, height] = sizes[artifact.format];
  const qa = validateVideoQa(info, {durationMs: manifest.durationFrames * 1000 / 30, width, height, fps: 30, minAudioChannels: 1});
  const result = await run(ffmpegPath, ['-hide_banner', '-nostats', '-i', artifact.videoPath, '-map', '0:a:0', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
  const match = result.stderr.match(/\{\s*"input_i"[\s\S]*?\}/);
  const loudness = match ? JSON.parse(match[0]) as {input_i: string; input_tp: string} : null;
  const loudnessPassed = loudness !== null && Math.abs(Number(loudness.input_i) + 16) <= 1.5 && Number(loudness.input_tp) <= -1.5;
  artifact.checks = [...qa.checks, {id: 'loudness', label: 'Integrated loudness / true peak', passed: loudnessPassed, detail: loudness ? `${loudness.input_i} LUFS / ${loudness.input_tp} dBTP` : 'missing'}];
  artifact.qaPassed = qa.passed && loudnessPassed;
  artifact.loudness = loudness;
  artifact.probe = info;
  artifact.sha256 = createHash('sha256').update(await readFile(artifact.videoPath)).digest('hex');
  await writeFile(resolve(root, 'qa', `${artifact.format}-qa.json`), JSON.stringify(artifact, null, 2));
  console.log(`${artifact.format}: ${loudness?.input_i ?? '?'} LUFS, ${loudness?.input_tp ?? '?'} dBTP, QA ${artifact.qaPassed ? 'pass' : 'fail'}`);
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
if (manifest.artifacts.some((a) => !a.qaPassed)) process.exitCode = 1;
