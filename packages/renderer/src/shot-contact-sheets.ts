import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import sharp from 'sharp';
import {ffmpegPath, run} from './media-tools.js';
import type {ExecutableShot} from '../../shared/src/shot-plan.js';

/** Full-episode visual coverage sampling. Every editorial beat gets a frame. */
export async function makeShotContactSheet(videoPath: string, shots: ExecutableShot[], outputDir: string, name: string) {
  await mkdir(outputDir, {recursive: true});
  const thumbs: Buffer[] = [];
  const centralPixels: Buffer[] = [];
  const samples: Array<{shotId: string; atSeconds: number; entropy: number; mean: number; perceptualHash: string}> = [];
  const beats=shots.flatMap(shot=>{
    const offsets=[0,...(shot.editorialCuts ?? []).map(c=>c.offsetFrames),shot.endFrame-shot.startFrame];
    return offsets.slice(0,-1).map((start,i)=>({id:`${shot.shotId}-beat-${i+1}`,atFrame:shot.startFrame+(start+offsets[i+1])/2}));
  });
  for (const beat of beats) {
    const atSeconds = beat.atFrame / 30;
    const framePath = resolve(outputDir, `${name}-${beat.id}.png`);
    await run(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', atSeconds.toFixed(3), '-i', videoPath, '-frames:v', '1', framePath]);
    const image = sharp(await readFile(framePath));
    const stats = await image.stats();
    const metadata = await image.metadata();
    const width = metadata.width ?? 1, height = metadata.height ?? 1;
    centralPixels.push(await image.clone().extract({left: Math.floor(width*.2), top: Math.floor(height*.15), width: Math.floor(width*.6), height: Math.floor(height*.7)}).resize(32,32,{fit:'fill'}).removeAlpha().raw().toBuffer());
    const raw = await image.clone().resize(8,8,{fit:'fill'}).grayscale().raw().toBuffer();
    const mean8 = raw.reduce((a,b)=>a+b,0)/raw.length;
    let hash = 0n;
    for (const value of raw) hash = (hash << 1n) | BigInt(value >= mean8 ? 1 : 0);
    samples.push({shotId: beat.id, atSeconds, entropy: stats.entropy, mean: stats.channels.slice(0, 3).reduce((a, c) => a + c.mean, 0) / 3, perceptualHash: hash.toString(16).padStart(16,'0')});
    const thumb = await image.clone().resize({width: 320}).png().toBuffer();
    const label = Buffer.from(`<svg width="320" height="30"><rect width="320" height="30" fill="#000b"/><text x="8" y="21" fill="white" font-family="Arial" font-size="15" font-weight="bold">${beat.id}</text></svg>`);
    thumbs.push(await sharp(thumb).composite([{input: label, left: 0, top: 0}]).png().toBuffer());
  }
  const meta = await sharp(thumbs[0]).metadata();
  const h = meta.height ?? 180;
  const columns = 4;
  const sheetPath = resolve(outputDir, `${name}-all-shots.png`);
  await sharp({create: {width: columns * 320, height: Math.ceil(thumbs.length / columns) * h, channels: 4, background: '#161616'}})
    .composite(thumbs.map((input, i) => ({input, left: i % columns * 320, top: Math.floor(i / columns) * h}))).png().toFile(sheetPath);
  const flags = samples.filter(s => s.entropy < 1 || s.mean < 7 || s.mean > 248).map(s => `${s.shotId}: possible blank or flat frame`);
  for(let i=1;i<samples.length;i++) {
    let xor=BigInt('0x'+samples[i-1].perceptualHash)^BigInt('0x'+samples[i].perceptualHash);
    let distance=0;
    while(xor){distance++;xor&=xor-1n;}
    const a=centralPixels[i-1], b=centralPixels[i];
    const pixelDifference=a.reduce((sum,v,index)=>sum+Math.abs(v-b[index]),0)/a.length;
    if(distance<=2 && pixelDifference<7) flags.push(`${samples[i-1].shotId} and ${samples[i].shotId}: near-identical sampled compositions`);
  }
  for(let i=0;i<samples.length;i++) for(let j=i+2;j<samples.length;j++) {
    let xor=BigInt('0x'+samples[i].perceptualHash)^BigInt('0x'+samples[j].perceptualHash);
    let distance=0;
    while(xor){distance++;xor&=xor-1n;}
    if(distance>1) continue;
    const a=centralPixels[i], b=centralPixels[j];
    const difference=a.reduce((sum,v,index)=>sum+Math.abs(v-b[index]),0)/a.length;
    if(difference<4) flags.push(`${samples[i].shotId} and ${samples[j].shotId}: repeated composition across the episode`);
  }
  const reportPath = resolve(outputDir, `${name}-shot-coverage.json`);
  await writeFile(reportPath, JSON.stringify({videoPath, sheetPath, samples, flags, humanReview: 'pending'}, null, 2));
  return {sheetPath, reportPath, flags};
}

if (process.argv[1]?.endsWith('shot-contact-sheets.js')) {
  const root = resolve('data/episodes/toolpilot/singularity-explained');
  const plan = JSON.parse(await readFile('episodes/toolpilot/singularity-explained/shot-list.json', 'utf8')) as {shots: ExecutableShot[]};
  for (const format of ['landscape', 'vertical', 'square']) {
    const result = await makeShotContactSheet(resolve(root, 'final', `singularity-explained-${format}.mp4`), plan.shots, resolve(root, 'qa'), format);
    process.stdout.write(`${format}: ${result.sheetPath}; ${result.flags.length} frame flags\n`);
  }
}
