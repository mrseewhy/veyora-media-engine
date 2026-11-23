import {writeFile} from 'node:fs/promises';
import type {ExecutableShot} from '../../shared/src/shot-plan.js';

/** Deterministic original underscore and sparse action cues. No external music or SFX rights. */
export async function generateSoundscape(path: string, shots: ExecutableShot[], contentFrames: number) {
  const sampleRate = 48000;
  const count = Math.ceil(contentFrames / 30 * sampleRate);
  const wav = Buffer.alloc(44 + count * 2);
  wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
  const actStarts = shots.filter((s,i)=>i===0 || s.actId!==shots[i-1].actId).map(s=>s.startFrame-shots[0].startFrame);
  actStarts.push(contentFrames);
  const chords = [[110,164.81,220],[98,146.83,196],[123.47,185,246.94],[130.81,196,261.63],[92.5,138.59,185],[110,164.81,220]];
  const cues = shots.map(s => (s.startFrame - 150) / 30).filter(t => t >= 0);
  let act = 0;
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate;
    while (act < actStarts.length-2 && t >= actStarts[act + 1] / 30) act++;
    const local = t - actStarts[act] / 30;
    const envelope = Math.min(1, local / 1.4, (actStarts[act + 1] / 30 - t) / 1.4);
    const [a,b,c] = chords[act % chords.length];
    const pad = (Math.sin(2*Math.PI*a*t) + .55*Math.sin(2*Math.PI*b*t) + .35*Math.sin(2*Math.PI*c*t)) * .045 * Math.max(0,envelope);
    let cue = 0;
    for (const at of cues) {
      const d = t - at;
      if (d >= 0 && d < .11) cue += Math.sin(2*Math.PI*(820-490*d/.11)*d) * Math.exp(-d*42) * .22;
    }
    const sample = Math.max(-1, Math.min(1, pad + cue));
    wav.writeInt16LE(Math.round(sample * 32767), 44 + i*2);
  }
  await writeFile(path, wav);
}
