import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,rename,stat,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';

const root=resolve('data/episodes');
const arg=process.argv.slice(2).find(x=>!x.startsWith('--'))||'ai-agents-100s';
const force=process.argv.includes('--force');
const selectedFormat=process.argv.find(x=>x.startsWith('--format='))?.split('=')[1];
const fixture=arg==='ai-agents-100s'||arg==='toolpilot-ai-agents-100s'?resolve('fixtures/storyboards/toolpilot-agents-100s.json'):resolve(arg);
const storyboard=JSON.parse(await readFile(fixture,'utf8'));
if(storyboard.format?.durationMs!==100000||storyboard.scenes?.at(-1)?.startMs+storyboard.scenes.at(-1).durationMs!==100000)throw Error('Episode must cover 100 seconds');
const outputId=(arg==='ai-agents-100s'||arg==='toolpilot-ai-agents-100s')?'ai-agents-100s':String(storyboard.episodeId).replace(/[^a-z0-9-]/gi,'-');
const out=resolve(process.env.EPISODE_OUTPUT_DIR||join(root,outputId));
for(const dir of ['final','captions','qa','metadata','cache'])await mkdir(join(out,dir),{recursive:true});
const log=[];const report={episodeId:storyboard.episodeId,startedAt:new Date().toISOString(),stages:log,formats:{},reviewRequired:true};
if(selectedFormat){try{report.formats=JSON.parse(await readFile(join(out,'metadata','production-report.json'),'utf8')).formats||{}}catch{}}
const record=(stage,status,detail)=>{const item={stage,status,detail,time:new Date().toISOString()};log.push(item);console.log(JSON.stringify(item));};
const run=(cmd,args,quiet=false)=>new Promise((ok,fail)=>{const p=spawn(cmd,args,{stdio:quiet?['ignore','pipe','pipe']:'inherit'});let stdout='',stderr='';if(quiet){p.stdout.on('data',x=>stdout+=x);p.stderr.on('data',x=>stderr+=x);}p.on('error',fail);p.on('close',code=>code===0?ok({stdout,stderr}):fail(Error(`${cmd} exited ${code}: ${stderr.slice(-2000)}`)));});
const retry=async(task,label)=>{let last;for(let attempt=1;attempt<=2;attempt++){try{return await task()}catch(error){last=error;record(label,'retry',`attempt ${attempt}: ${error}`);}}throw last;};
const ffmpeg=process.env.FFMPEG_PATH||resolve('node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const ffprobe=process.env.FFPROBE_PATH||resolve('node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const probe=async path=>JSON.parse((await run(ffprobe,['-v','error','-show_streams','-show_format','-of','json',path],true)).stdout);
const exists=async path=>{try{return (await stat(path)).size>0}catch{return false}};
const hash=createHash('sha256').update(JSON.stringify(storyboard.beats)).digest('hex').slice(0,16);
const audio=join(out,'cache',`narration-${hash}.wav`);
try{
  if(!(await exists(audio))){
    record('narration','started','macOS local say voice');
    const parts=[];
    try{for(let i=0;i<storyboard.beats.length;i++){
      const beat=storyboard.beats[i],aiff=join(out,'cache',`beat-${hash}-${i}.aiff`),wav=join(out,'cache',`beat-${hash}-${i}.wav`);
      await run('say',['-v',process.env.EPISODE_SAY_VOICE||'Samantha','-r','200','-o',aiff,beat.script]);
      const p=await probe(aiff),actual=Number(p.format.duration),target=beat.durationMs/1000-.18;
      const tempo=actual/target;
      if(!Number.isFinite(tempo)||tempo<.5||tempo>2)throw Error(`Local speech unavailable or beat ${beat.id} needs unreasonable stretch`);
      await run(ffmpeg,['-y','-loglevel','error','-i',aiff,'-af',`atempo=${tempo.toFixed(5)},apad=pad_dur=.18,atrim=duration=${(beat.durationMs/1000).toFixed(3)},aresample=48000`,'-ac','1',wav]);
      parts.push(wav);await rm(aiff,{force:true});
    }}catch(error){
      record('narration','fallback',String(error));
      const cached=resolve('public/generated/agents-100s.wav');
      if(!(await exists(cached)))throw Error('Local speech failed and no verified cached narration exists');
      const cp=await probe(cached),duration=Number(cp.format.duration);
      if(!Number.isFinite(duration)||duration<50)throw Error('Cached narration is invalid');
      await run(ffmpeg,['-y','-loglevel','error','-i',cached,'-af',`atempo=${(duration/100).toFixed(6)},loudnorm=I=-16:TP=-1.5:LRA=11,apad,atrim=duration=100`,'-ar','48000','-ac','1',audio]);
      parts.length=0;
    }
    if(parts.length){const list=join(out,'cache',`concat-${hash}.txt`);
    await writeFile(list,parts.map(x=>`file '${x.replaceAll("'","'\\''")}'`).join('\n'));
    await run(ffmpeg,['-y','-loglevel','error','-f','concat','-safe','0','-i',list,'-af','loudnorm=I=-16:TP=-1.5:LRA=11,apad,atrim=duration=100','-ar','48000','-ac','1',audio]);
    await rm(list,{force:true});}record('narration','complete',audio);
  }else record('narration','cached',audio);
  const ap=await probe(audio);if(Math.abs(Number(ap.format.duration)-100)>.15)throw Error(`Narration duration ${ap.format.duration}`);
  const publicAudio=resolve('public/generated/agents-full.wav');await mkdir(resolve('public/generated'),{recursive:true});
  await writeFile(publicAudio,await readFile(audio));
  const tick=resolve('public/generated/agents-tick.wav');
  if(!(await exists(tick)))await run(ffmpeg,['-y','-loglevel','error','-f','lavfi','-i','sine=frequency=620:duration=0.25','-af','afade=t=out:st=0.02:d=0.22,volume=0.15','-ar','48000',tick]);
  const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const captions=[];
  for(const beat of storyboard.beats){
    const phrases=beat.script.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(x=>x.trim())||[];
    const words=phrases.map(x=>x.split(/\s+/).length),total=words.reduce((a,b)=>a+b,0);
    let at=beat.startMs;
    phrases.forEach((text,i)=>{const end=i===phrases.length-1?beat.startMs+beat.durationMs:Math.round(at+beat.durationMs*words[i]/total);captions.push({id:`c${captions.length+1}`,text,startMs:at,endMs:end,emphasis:[]});at=end;});
  }
  if(normalize(captions.map(x=>x.text).join(' '))!==normalize(storyboard.beats.map(x=>x.script).join(' ')))throw Error('Caption coverage mismatch');
  storyboard.narration.captions=captions;
  storyboard.scenes.forEach(x=>x.status='implemented');
  const stamp=ms=>{const h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60,tail=ms%1000;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(tail).padStart(3,'0')}`};
  await writeFile(join(out,'captions','episode.srt'),captions.map((c,i)=>`${i+1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text}\n`).join('\n'));
  await writeFile(join(out,'metadata','episode.json'),JSON.stringify(storyboard,null,2));
  const props=join(out,'cache','remotion-props.json');await writeFile(props,JSON.stringify({storyboard,audioPath:'generated/agents-full.wav'}));
  const formats=[['landscape','ToolPilotAgents100s',1920,1080,'youtube-1920x1080.mp4'],['vertical','ToolPilotAgents100sVertical',1080,1920,'vertical-1080x1920.mp4'],['square','ToolPilotAgents100sSquare',1080,1080,'square-1080x1080.mp4']];
  for(const [name,id,width,height,file] of formats){
    if(selectedFormat&&name!==selectedFormat)continue;
    const target=join(out,'final',file),sheet=join(out,'qa',`${name}-contact-sheet.png`);
    try{
      let valid=false;
      if(await exists(target)){const p=await probe(target);const v=p.streams.find(x=>x.codec_type==='video'),a=p.streams.find(x=>x.codec_type==='audio');valid=v?.width===width&&v?.height===height&&v?.codec_name==='h264'&&a?.codec_name==='aac'&&Math.abs(Number(p.format.duration)-100)<.25;}
      if(!valid||force){const temp=join(out,'cache',`${name}.mp4`);await rm(temp,{force:true});record(`render:${name}`,'started',id);await retry(()=>run(process.execPath,[resolve('node_modules/@remotion/cli/remotion-cli.js'),'render','remotion/index.ts',id,temp,'--props',props,'--codec','h264','--crf','20','--pixel-format','yuv420p','--concurrency','4','--overwrite']),`render:${name}`);await rename(temp,target);}
      const p=await probe(target),v=p.streams.find(x=>x.codec_type==='video'),a=p.streams.find(x=>x.codec_type==='audio');
      const checks={resolution:v?.width===width&&v?.height===height,videoCodec:v?.codec_name==='h264',audioCodec:a?.codec_name==='aac',duration:Math.abs(Number(p.format.duration)-100)<.25,fps:v?.avg_frame_rate==='30/1',captions:captions.at(-1)?.endMs===100000};
      const volume=(await run(ffmpeg,['-hide_banner','-nostats','-i',target,'-map','0:a:0','-af','volumedetect','-f','null','-'],true)).stderr;
      const maxDb=Number(volume.match(/max_volume:\s*(-?[\d.]+) dB/)?.[1]);
      const meanDb=Number(volume.match(/mean_volume:\s*(-?[\d.]+) dB/)?.[1]);
      checks.audioLevel=Number.isFinite(maxDb)&&maxDb<=0&&Number.isFinite(meanDb)&&meanDb>-35;
      const black=(await run(ffmpeg,['-hide_banner','-nostats','-i',target,'-an','-vf','blackdetect=d=0.25:pix_th=0.04','-f','null','-'],true)).stderr;
      checks.noBlackFrames=!black.includes('black_start:');
      await run(ffmpeg,['-y','-loglevel','error','-i',target,'-vf',`fps=1/10,scale=${name==='vertical'?180:320}:-1,tile=5x2:padding=6:margin=6:color=0x101820`,'-frames:v','1',sheet]);
      report.formats[name]={file:target,contactSheet:sheet,checks,passed:Object.values(checks).every(Boolean),bytes:(await stat(target)).size};record(`render:${name}`,report.formats[name].passed?'complete':'failed',checks);
    }catch(e){report.formats[name]={passed:false,error:String(e)};record(`render:${name}`,'failed',String(e));}
  }
  report.completedAt=new Date().toISOString();report.passed=Object.values(report.formats).every(x=>x.passed);
  await writeFile(join(out,'qa','qa-report.json'),JSON.stringify({formats:report.formats,machineVerified:true,visualReviewRequired:true},null,2));
  await writeFile(join(out,'metadata','production-report.json'),JSON.stringify(report,null,2));
  if(!report.passed)process.exitCode=1;
}catch(e){record('production','failed',String(e));report.error=String(e);await writeFile(join(out,'metadata','production-report.json'),JSON.stringify(report,null,2));process.exitCode=1;}
