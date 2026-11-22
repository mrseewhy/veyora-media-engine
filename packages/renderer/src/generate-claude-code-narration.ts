import {existsSync} from 'node:fs';
if(existsSync('.env'))process.loadEnvFile('.env');
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {generateGeminiVoice} from './gemini-voice.js';
import {run,ffmpegPath} from './media-tools.js';
import {execFileSync} from 'node:child_process';

const plan=JSON.parse(await readFile(resolve('data/claude-code-narration-plan.json'),'utf8'));
const segments=plan.narration as Array<{id:string;text:string}>;
const fullText=segments.map(s=>s.text).join(' ');
const style=plan.voice.style;
const output=resolve('data/claude-code-narration-raw.wav');
await mkdir(dirname(output),{recursive:true});
const bytes=await generateGeminiVoice(fullText,output,plan.voice.voice,[{text:fullText,style}]);
console.log(`Generated raw narration: ${output} (${bytes} bytes)`);

const final=resolve('public/generated/claude-code-100s.wav');
await mkdir(dirname(final),{recursive:true});
await run(ffmpegPath,['-hide_banner','-loglevel','error','-y','-i',output,'-ar','48000','-ac','1',final]);
console.log(`Final narration: ${final}`);

const probe=resolve('node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const durationMs=Number(execFileSync(probe,['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',final],{encoding:'utf8'}))*1000;
console.log(`Narration duration: ${(durationMs/1000).toFixed(2)}s`);

// Distribute timing proportionally by word count
const totalWords=segments.reduce((sum,s)=>sum+s.text.split(/\s+/).length,0);
let cursorMs=0;
const cues=segments.map(seg=>{
  const words=seg.text.split(/\s+/).length;
  const segMs=Math.round((words/totalWords)*durationMs);
  const cue={id:seg.id,text:seg.text,startMs:cursorMs,endMs:cursorMs+segMs};
  cursorMs+=segMs;
  return cue;
});
// Ensure last cue ends at full duration
cues[cues.length-1].endMs=Math.round(durationMs);

const INTRO_OFFSET_MS=5000;
function stamp(ms:number){const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;}
let srt='';
let index=1;
for(const cue of cues){
  srt+=`${index++}\n${stamp(cue.startMs+INTRO_OFFSET_MS)} --> ${stamp(cue.endMs+INTRO_OFFSET_MS)}\n${cue.text}\n\n`;
}
const srtPath=resolve('data/claude-code-captions.srt');
await writeFile(srtPath,srt);
console.log(`Captions: ${srtPath}`);

await writeFile(resolve('data/claude-code-captions.json'),JSON.stringify({
  captions:cues,
  narrationStartMs:0,
  narrationDurationMs:Math.round(durationMs),
  introOffsetMs:INTRO_OFFSET_MS,
  totalContentSeconds:Math.round(durationMs/1000),
},null,2));
console.log(`Caption cues: data/claude-code-captions.json`);
console.log(`Total content: ${(durationMs/1000).toFixed(2)}s`);
console.log(`Total video with intro/outro: ${(5 + durationMs/1000 + 8).toFixed(2)}s`);
