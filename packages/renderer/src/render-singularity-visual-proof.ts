import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import sharp from 'sharp';
import {ffmpegPath,probe,run} from './media-tools.js';
import {validateVideoQa} from './video-qa.js';

const base=resolve('public/generated/singularity-visual');
const out=resolve('data/visual-director/singularity-visual-15s');
const files=['elon-editorial.png','recursive-workshop.png','claim.wav','feedback.wav'];
const originalHashes={claim:'58183072240647057102aabeb9169d4536a4b84b236c3b5b263540753126f2ea',feedback:'618cf14013d2a9d020e327a4cb68350113ce54d5fead9a6a58248d0c04c4d3d2'};
const assets=[];
for(const name of files){
 const path=join(base,name);
 try{if(!(await stat(path)).isFile())throw Error('not a file');}catch{throw Error(`Missing required local approved/review asset: ${path}`);}
 const sha256=createHash('sha256').update(await readFile(path)).digest('hex');
 if(name==='claim.wav'&&sha256!==originalHashes.claim||name==='feedback.wav'&&sha256!==originalHashes.feedback)throw Error(`Narration changed: ${name}`);
 assets.push({name,path,sha256,source:name.endsWith('.wav')?'existing Gemini Flash TTS / Puck narration':'original generated editorial illustration',rightsStatus:name.endsWith('.wav')?'existing voice take':'operator review pending'});
}
await mkdir(out,{recursive:true});
const video=join(out,'singularity-visual-proof.mp4');
await new Promise<void>((ok,fail)=>{
 const cli=resolve('node_modules/@remotion/cli/remotion-cli.js');
 const child=spawn(process.execPath,[cli,'render','remotion/index.ts','SingularityVisualProof15s',video,'--codec=h264','--crf=18','--pixel-format=yuv420p','--concurrency=4','--overwrite'],{stdio:'inherit'});
 child.on('error',fail);child.on('close',code=>code===0?ok():fail(Error(`Remotion exited ${code}`)));
});
const info=await probe(video);
const qa=validateVideoQa(info,{durationMs:15000,width:1920,height:1080,fps:30,minAudioChannels:1});
const times=[1,3,5,8,11,14];
const thumbs=[];
for(const t of times){
 const frame=join(out,`frame-${t}.png`);
 await run(ffmpegPath,['-hide_banner','-loglevel','error','-y','-ss',String(t),'-i',video,'-frames:v','1',frame]);
 thumbs.push(await sharp(frame).resize(640,360).png().toBuffer());
}
const sheet=join(out,'contact-sheet.png');
await sharp({create:{width:1920,height:720,channels:4,background:'#101016'}}).composite(thumbs.map((input,i)=>({input,left:i%3*640,top:Math.floor(i/3)*360}))).png().toFile(sheet);
const captions=[
 ['00:00:00,000','00:00:03,267','Elon Musk posted, “We have entered the Singularity.”'],
 ['00:00:03,267','00:00:04,100','Big words.'],
 ['00:00:04,100','00:00:08,033','That successor could help design another, even more capable system.'],
 ['00:00:08,033','00:00:11,567','Each generation might shorten the time to the next.'],
 ['00:00:11,567','00:00:13,933','This is called recursive self improvement.'],
];
const srt=join(out,'captions.srt');
await writeFile(srt,captions.map((c,i)=>`${i+1}\n${c[0]} --> ${c[1]}\n${c[2]}\n`).join('\n'));
const manifest={channelId:'toolpilot',seriesId:'ai-tools-in-100-seconds',episodeId:'singularity-visual-15s',format:'1920x1080-30',configVersion:1,video,contactSheet:sheet,captions:srt,assets,technicalQa:qa,humanVisualReview:'pending',generatedLikenessRightsReview:'pending',captionSyncReview:'pending'};
await writeFile(join(out,'artifact-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({video,contactSheet:sheet,technicalQa:qa},null,2));
if(!qa.passed)process.exitCode=1;
