import {existsSync} from 'node:fs';
if(existsSync('.env'))process.loadEnvFile('.env');
import {readFile,writeFile,mkdir,access,rm,rename} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {validateEpisode,type Scene} from '../../shared/src/schema.js';
import {sceneGraphic} from './graphics.js';
import {KokoroTTS} from 'kokoro-js';
import {generateGeminiVoice} from './gemini-voice.js';
const root=resolve(process.cwd());
function run(cmd:string,args:string[]):Promise<string>{return new Promise((ok,bad)=>{const executable=cmd==='ffmpeg'?join(root,'node_modules','@ffmpeg-installer','darwin-arm64','ffmpeg'):cmd==='ffprobe'?join(root,'node_modules','@ffprobe-installer','darwin-arm64','ffprobe'):cmd;const p=spawn(executable,args,{stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('error',bad);p.on('close',c=>c===0?ok(out):bad(Error(`${cmd} exited ${c}: ${err.slice(-1500)}`)));});}
function stamp(ms:number){const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;}
function safeText(s:string){return s.replace(/\\/g,'\\\\').replace(/:/g,'\\:').replace(/'/g,"\\'").replace(/%/g,'\\%');}
async function longSilences(path:string):Promise<number>{return new Promise((ok,bad)=>{const p=spawn(join(root,'node_modules','@ffmpeg-installer','darwin-arm64','ffmpeg'),['-v','info','-i',path,'-af','silencedetect=noise=-40dB:d=2','-f','null','-'],{stdio:['ignore','ignore','pipe']});let log='';p.stderr.on('data',d=>log+=d);p.on('error',bad);p.on('close',code=>code===0?ok((log.match(/silence_start:/g)||[]).length):bad(Error('Silence analysis failed')));});}
async function probe(path:string){return JSON.parse(await run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',path]));}
async function render(input:string){
 const raw=await readFile(input,'utf8'),e=validateEpisode(JSON.parse(raw));
 for(const s of e.scenes)for(const a of s.assets)await access(resolve(dirname(input),a.path));
 const id=createHash('sha256').update(raw).digest('hex').slice(0,12),out=join(root,'data','episodes',e.slug,id);await mkdir(out,{recursive:true});
 const tts=e.voice.engine==='kokoro'?await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{dtype:'q8',device:'cpu'}):null;
 const srt:string[]=[],manifest:any={episode:e.slug,input:resolve(input),runId:id,voice:e.voice,assets:[],sources:[...new Set(e.scenes.flatMap(s=>s.sources))],segments:[]};
 for(let i=0;i<e.scenes.length;i++){
  const s:Scene=e.scenes[i],sec=s.durationMs/1000,base=join(out,`${String(i).padStart(2,'0')}-${s.id}`),aiff=base+(e.voice.engine==='say'?'.aiff':'.wav'),mp4=base+'.mp4',tmp=mp4+'.tmp',png=base+'.png';
  console.log(`scene ${i+1}/${e.scenes.length}: ${s.id}`);
  if(tts){const audio=await tts.generate(s.narration,{voice:e.voice.name as any,speed:e.voice.rate});audio.save(aiff);}else if(e.voice.engine==='gemini-flash')await generateGeminiVoice(s.narration,aiff,e.voice.name);else await run('say',['-v',e.voice.name,'-r',String(e.voice.rate),'-o',aiff,s.narration]);
  const audio=await probe(aiff),actual=Number(audio.format.duration);if(!Number.isFinite(actual)||actual<=0)throw Error(`Empty narration in ${s.id}`);if(actual>sec*1.4)throw Error(`Narration too long in ${s.id}: ${actual.toFixed(2)}s`);
  await sceneGraphic(s,i,png);
  await rm(tmp,{force:true});await run('ffmpeg',['-y','-loop','1','-framerate','30','-i',png,'-i',aiff,'-filter_complex',`[0:v]scale=2000:1125,crop=1920:1080:x='80*t/${sec}':y=20,fade=t=in:st=0:d=0.25[v];[1:a]atempo=${(actual/(sec-0.35)).toFixed(4)},apad=whole_dur=${sec},atrim=duration=${sec},aresample=48000,asetnsamples=n=1024:p=1[a]`,'-map','[v]','-map','[a]','-c:v','libx264','-preset','ultrafast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-ar','48000','-t',String(sec),'-movflags','+faststart','-f','mp4',tmp]);await rename(tmp,mp4);
  const words=s.narration.split(/\s+/);const chunks:string[]=[];for(let j=0;j<words.length;j+=8)chunks.push(words.slice(j,j+8).join(' '));const captionEnd=s.startMs+Math.min(s.durationMs,s.durationMs-350);for(let j=0;j<chunks.length;j++){const start=s.startMs+Math.floor((captionEnd-s.startMs)*j/chunks.length),end=s.startMs+Math.floor((captionEnd-s.startMs)*(j+1)/chunks.length);srt.push(`${srt.length+1}\n${stamp(start)} --> ${stamp(end)}\n${chunks[j]}\n`);}
  manifest.segments.push({id:s.id,startMs:s.startMs,durationMs:s.durationMs,narrationSeconds:actual,kind:s.kind,sources:s.sources});
 }
 const concat=join(out,'concat.txt');await writeFile(concat,e.scenes.map((s,i)=>`file '${String(i).padStart(2,'0')}-${s.id}.mp4'`).join('\n'));
 const final=join(out,'video.mp4'),finalTmp=join(out,'video.tmp.mp4');await run('ffmpeg',['-y','-f','concat','-safe','0','-i',concat,'-c','copy','-movflags','+faststart',finalTmp]);await rename(finalTmp,final);
 await writeFile(join(out,'captions.srt'),srt.join('\n'));await writeFile(join(out,'transcript.txt'),e.scenes.map(s=>s.narration).join('\n\n')+'\n');await writeFile(join(out,'manifest.json'),JSON.stringify(manifest,null,2));
 await run('ffmpeg',['-y','-ss','00:00:03','-i',final,'-frames:v','1',join(out,'thumbnail.png')]);
 const p=await probe(final),v=p.streams.find((x:any)=>x.codec_type==='video'),a=p.streams.find((x:any)=>x.codec_type==='audio'),duration=Number(p.format.duration),checks={duration:Math.abs(duration-100)<0.2,resolution:v?.width===1920&&v?.height===1080,videoCodec:v?.codec_name==='h264',audioCodec:a?.codec_name==='aac',fps:v?.r_frame_rate==='30/1',captions:e.scenes.at(-1)!.startMs+e.scenes.at(-1)!.durationMs===100000,assets:true,narration:manifest.segments.every((x:any)=>x.narrationSeconds>0),longSilence:(await longSilences(final))===0};
 const qa={passed:Object.values(checks).every(Boolean),checks,duration,videoFrames:v?.nb_frames,videoCodec:v?.codec_name,audioCodec:a?.codec_name,output:final,manualReview:'pending',versions:{node:process.version,ffmpeg:(await run('ffmpeg',['-version'])).split('\n')[0]}};await writeFile(join(out,'qa.json'),JSON.stringify(qa,null,2));console.log(JSON.stringify(qa,null,2));if(!qa.passed)process.exitCode=1;
}
render(resolve(process.argv[2]??'fixtures/toolpilot-chatgpt.json')).catch(e=>{console.error(e);process.exitCode=1});
