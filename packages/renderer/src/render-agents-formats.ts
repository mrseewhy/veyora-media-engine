import {spawn} from 'node:child_process';
import {mkdir, access, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {probe} from './media-tools.js';
import {validateVideoQa} from './video-qa.js';

// Preview-only pipeline: the repository currently implements 0–30 seconds.
// A full 100-second export requires complete scenes and narration first.
const root = resolve('data/agents100');
const cli = resolve('node_modules/@remotion/cli/remotion-cli.js');
const formats = [
  {name:'landscape', id:'ToolPilotAgents30s', width:1920, height:1080},
  {name:'vertical', id:'ToolPilotAgents30sVertical', width:1080, height:1920},
  {name:'square', id:'ToolPilotAgents30sSquare', width:1080, height:1080},
] as const;
const exec = (command:string,args:string[]) => new Promise<void>((ok,fail)=>{
  const child=spawn(command,args,{stdio:'inherit'});
  child.once('error',fail);
  child.once('close',code=>code===0?ok():fail(new Error(`${command} exited ${code}`)));
});
await mkdir(root,{recursive:true});
await access(resolve('public/generated/agents-tick.wav'));
const storyboard=JSON.parse(await readFile(resolve('fixtures/storyboards/toolpilot-agents-100s.json'),'utf8'));
await access(resolve('public',storyboard.narration.previewAudioPath));
for(const format of formats){
  const dir=resolve(root,format.name);
  await mkdir(dir,{recursive:true});
  const video=resolve(dir,'agents-0-30.mp4');
  await exec(process.execPath,[cli,'render','remotion/index.ts',format.id,video,'--codec=h264','--crf=18','--pixel-format=yuv420p','--concurrency=4','--overwrite']);
  const info=await probe(video);
  const checks=validateVideoQa(info,{durationMs:30000,width:format.width,height:format.height,fps:30,minAudioChannels:1}).checks;
  const qa={format:format.name,passed:checks.every(c=>c.passed),checks,reviewStatus:'proposed',note:'Preview only; alternate formats currently fit the 16:9 artwork without cropping. Responsive scene redesign and human review still required.'};
  await writeFile(resolve(dir,'qa.json'),JSON.stringify(qa,null,2));
  if(!qa.passed)throw new Error(`QA failed for ${format.name}`);
  console.log(`Rendered ${format.name}: ${video}`);
}
