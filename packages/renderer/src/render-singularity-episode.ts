import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import sharp from 'sharp';
import {ffmpegPath, probe, run} from './media-tools.js';
import {validateVideoQa} from './video-qa.js';
import {validateShotPlan} from '../../shared/src/shot-plan.js';
import {normalizeVideoAudio} from './normalize-video-audio.js';

const root = resolve('data/episodes/toolpilot/singularity-explained');
const episode = JSON.parse(await readFile('episodes/toolpilot/singularity-explained/script.json', 'utf8')) as {
  channelId: string; seriesId: string; episodeId: string; configVersion: number;
  title: string; sources: Array<{claim: string; url: string}>;
  segments: Array<{id: string; text: string}>;
};
const narration = JSON.parse(await readFile(resolve(root, 'narration-manifest.json'), 'utf8')) as {
  contentFrames: number; items: Array<{id: string; durationFrames: number; audioPath: string; sha256: string}>;
};
if (narration.items.length !== episode.segments.length || narration.contentFrames < 3000 || narration.contentFrames > 3600) throw new Error('Narration preflight failed');
const shotPlan = JSON.parse(await readFile('episodes/toolpilot/singularity-explained/shot-list.json', 'utf8')) as {shots: import('../../shared/src/shot-plan.js').ExecutableShot[]};
const planQa = validateShotPlan(shotPlan.shots, episode.segments.map(s => s.id), narration.items.map(i => i.durationFrames));
for (const item of narration.items) {
  const audio = await readFile(resolve('public', item.audioPath));
  const actual = createHash('sha256').update(audio).digest('hex');
  if (actual !== item.sha256) throw new Error(`Locked narration mismatch: ${item.id}`);
}
const segmentFrames = narration.items.map((item) => item.durationFrames);
const totalFrames = 150 + narration.contentFrames + 240;
const formats = [
  {name: 'landscape', id: 'ToolPilotSingularityLandscape', width: 1920, height: 1080},
  {name: 'vertical', id: 'ToolPilotSingularityVertical', width: 1080, height: 1920},
  {name: 'square', id: 'ToolPilotSingularitySquare', width: 1080, height: 1080},
] as const;
const paths = {final: resolve(root, 'final'), captions: resolve(root, 'captions'), qa: resolve(root, 'qa'), metadata: resolve(root, 'metadata')};
await Promise.all(Object.values(paths).map((dir) => mkdir(dir, {recursive: true})));
await writeFile(resolve(paths.qa, 'shot-plan-qa.json'), JSON.stringify({passed: planQa.errors.length === 0, ...planQa, humanReview: 'pending'}, null, 2));
if (planQa.errors.length) throw new Error(`Shot plan preflight failed: ${planQa.errors.length} errors; see ${resolve(paths.qa, 'shot-plan-qa.json')}`);
const propsPath = resolve(paths.metadata, 'render-props.json');
await writeFile(propsPath, JSON.stringify({segmentFrames}));

const stamp = (frame: number) => {
  const ms = Math.round(frame * 1000 / 30);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, part = ms % 1000;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(part).padStart(3, '0')}`;
};
let cursor = 150;
const captions: Array<{startFrame: number; endFrame: number; text: string}> = [];
for (let i = 0; i < episode.segments.length; i++) {
  const segment = episode.segments[i];
  const duration = segmentFrames[i];
  const sentences = segment.text.match(/[^.!?]+[.!?]+[’'”"]?/g)?.map((s) => s.trim()) ?? [segment.text];
  const weights = sentences.map((s) => s.split(/\s+/).length);
  const totalWords = weights.reduce((a, b) => a + b, 0);
  let local = 0;
  sentences.forEach((text, n) => {
    const startFrame = cursor + local;
    local += n === sentences.length - 1 ? duration - local : Math.round(duration * weights[n] / totalWords);
    captions.push({startFrame, endFrame: cursor + local, text});
  });
  cursor += duration;
}
const srt = captions.map((cue, i) => `${i + 1}\n${stamp(cue.startFrame)} --> ${stamp(cue.endFrame)}\n${cue.text}\n`).join('\n');
await writeFile(resolve(paths.captions, 'singularity-explained.srt'), srt);

const render = (args: string[]) => new Promise<void>((ok, fail) => {
  const child = spawn(process.execPath, [resolve('node_modules/@remotion/cli/remotion-cli.js'), ...args], {stdio: 'inherit'});
  child.once('error', fail);
  child.once('close', (code) => code === 0 ? ok() : fail(new Error(`Remotion exited ${code}`)));
});
const artifacts = [];
for (const format of formats) {
  const videoPath = resolve(paths.final, `singularity-explained-${format.name}.mp4`);
  await render(['render', 'remotion/index.ts', format.id, videoPath, `--props=${propsPath}`, '--codec=h264', '--crf=18', '--pixel-format=yuv420p', '--concurrency=4', '--overwrite']);
  await normalizeVideoAudio(videoPath);
  const info = await probe(videoPath);
  const qa = validateVideoQa(info, {durationMs: totalFrames * 1000 / 30, width: format.width, height: format.height, fps: 30, minAudioChannels: 1});
  const loudnessResult = await run(ffmpegPath, ['-hide_banner', '-nostats', '-i', videoPath, '-map', '0:a:0', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']);
  const loudness = loudnessResult.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0];
  const audioStats = loudness ? JSON.parse(loudness) as {input_i: string; input_tp: string} : null;
  const loudnessPassed = audioStats !== null && Number(audioStats.input_i) > -24 && Number(audioStats.input_i) < -12 && Number(audioStats.input_tp) <= -1;
  const checks = [...qa.checks, {id: 'loudness', label: 'Integrated loudness / true peak', passed: loudnessPassed, detail: audioStats ? `${audioStats.input_i} LUFS / ${audioStats.input_tp} dBTP` : 'missing'}];
  const thumbs = [];
  for (let n = 0; n < 8; n++) {
    const at = (5 + (n + 0.5) * (narration.contentFrames / 30) / 8).toFixed(2);
    const framePath = resolve(paths.qa, `${format.name}-frame-${n}.png`);
    await run(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', at, '-i', videoPath, '-frames:v', '1', framePath]);
    thumbs.push(await sharp(framePath).resize({width: 400}).png().toBuffer());
  }
  const thumbMeta = await sharp(thumbs[0]).metadata();
  const sheet = resolve(paths.qa, `${format.name}-contact-sheet.png`);
  await sharp({create: {width: 1600, height: (thumbMeta.height ?? 225) * 2, channels: 4, background: '#030612'}}).composite(thumbs.map((input, i) => ({input, left: (i % 4) * 400, top: Math.floor(i / 4) * (thumbMeta.height ?? 225)}))).png().toFile(sheet);
  const hash = createHash('sha256').update(await readFile(videoPath)).digest('hex');
  const result = {format: format.name, videoPath, contactSheet: sheet, sha256: hash, qaPassed: checks.every((c) => c.passed), checks, loudness: audioStats, probe: info};
  await writeFile(resolve(paths.qa, `${format.name}-qa.json`), JSON.stringify(result, null, 2));
  artifacts.push(result);
  if (!result.qaPassed) console.error(`QA failed: ${format.name}`);
}
const report = {channelId: episode.channelId, seriesId: episode.seriesId, episodeId: episode.episodeId, format: 'three-native-formats', configVersion: episode.configVersion, title: episode.title, durationFrames: totalFrames, contentFrames: narration.contentFrames, sources: episode.sources, narration, captionsPath: resolve(paths.captions, 'singularity-explained.srt'), captionsTiming: 'sentence timing estimated from word proportions within measured narration segments; human sync review required', artifacts, humanReviewStatus: 'proposed'};
await writeFile(resolve(paths.metadata, 'artifact-manifest.json'), JSON.stringify(report, null, 2));
await writeFile(resolve(paths.metadata, 'production-report.md'), `# ${episode.title}\n\nTotal: ${(totalFrames / 30).toFixed(2)} seconds; content: ${(narration.contentFrames / 30).toFixed(2)} seconds.\n\nNarrator: Gemini Flash TTS / Puck, operator-approved sample.\n\nQA: ${artifacts.filter((a) => a.qaPassed).length}/3 format checks passed. Caption sentence timing is estimated and requires human sync review. Visual and factual approval remain pending.\n\nSources:\n${episode.sources.map((s) => `- ${s.claim}: ${s.url}`).join('\n')}\n`);
if (artifacts.some((a) => !a.qaPassed)) process.exitCode = 1;
