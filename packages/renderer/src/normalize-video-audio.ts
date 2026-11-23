import {rename} from 'node:fs/promises';
import {ffmpegPath, run} from './media-tools.js';

/** Two-pass loudness normalization without re-encoding the H.264 picture. */
export async function normalizeVideoAudio(path: string): Promise<void> {
  const pass1 = await run(ffmpegPath, ['-hide_banner', '-nostats', '-i', path, '-map', '0:a:0', '-af', 'loudnorm=I=-16:TP=-2.0:LRA=11:print_format=json', '-f', 'null', '-']);
  const match = pass1.stderr.match(/\{\s*"input_i"[\s\S]*?\}/);
  if (!match) throw new Error(`Loudness measurement missing for ${path}`);
  const m = JSON.parse(match[0]) as {input_i: string; input_lra: string; input_tp: string; input_thresh: string; target_offset: string};
  const temp = path.replace(/\.mp4$/, '.normalized.mp4');
  await run(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', '-i', path, '-map', '0:v:0', '-map', '0:a:0', '-c:v', 'copy', '-af', `loudnorm=I=-16:TP=-2.0:LRA=11:measured_I=${m.input_i}:measured_LRA=${m.input_lra}:measured_TP=${m.input_tp}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', temp]);
  await rename(temp, path);
}
