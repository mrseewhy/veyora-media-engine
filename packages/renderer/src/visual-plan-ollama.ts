import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {validateVisualPlan} from '../../shared/src/visual-director.js';
/**
 * Local Ollama-assisted visual direction. No paid API, no asset acquisition, no audio changes.
 * Input JSON: {channelId,episodeId,audio:{path,durationMs,locked:true},
 *   beats:[{id,startMs,endMs,narration}],format?}.
 * Exact time boundaries are supplied by caller, never guessed by the LLM.
 */
async function main(){
 const input=process.argv[2],output=process.argv[3];
 if(!input||!output)throw Error('Usage: npm run visual:plan -- beats.json proposed-plan.json');
 const source=JSON.parse(await readFile(resolve(input),'utf8'));
 if(!source.audio?.locked||!source.audio?.path||!Number.isInteger(source.audio.durationMs))throw Error('Approved audio must be locked with measured duration');
 if(!Array.isArray(source.beats)||!source.beats.length)throw Error('Timed beats required');
 let at=0;for(const b of source.beats){if(b.startMs!==at||!Number.isInteger(b.endMs)||b.endMs<=at||!b.narration||!b.id)throw Error('Invalid timed beats');at=b.endMs;}
 if(at!==source.audio.durationMs)throw Error('Beats do not cover approved audio');
 const model=process.env.VEYORA_OLLAMA_MODEL??'qwen3.5:4b';
 const host=process.env.VEYORA_OLLAMA_URL??'http://127.0.0.1:11434';
 const instruction=`You are an editorial visual director for documentary-style video. Produce ONLY a JSON object with a "directions" array, exactly one item per beat, same order. Each item: { "subject":string, "intent":string, "mode": one of ["licensed_photo","licensed_footage","original_recording","screenshot","original_illustration","ai_image","ai_video","motion_graphic","data_diagram","kinetic_type"], "palette": string[2..4], "composition":string, "motion":string, "searchOrGenerationBrief":string }. Depict named people concretely (a correctly identified licensed photograph or recognizable editorial caricature), not text cards. No mandatory blue. Favor photographic/illustrative cinematic storytelling over cards, boxes, slides. Never invent factual footage, licenses, quotes or endorsements. The output is only a proposal; actual assets and rights are unresolved. Beats: ${JSON.stringify(source.beats)}`;
 const url=new URL('/api/generate',host);
 if(!['127.0.0.1','localhost','::1','[::1]'].includes(url.hostname))throw Error('Only loopback Ollama is supported by default');
 const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,prompt:instruction,stream:false,format:'json',options:{temperature:0.3,num_ctx:8192}}),signal:AbortSignal.timeout(180000)});
 if(!response.ok)throw Error('Ollama request failed: '+response.status+' '+(await response.text()).slice(0,300));
 const payload=await response.json() as {response?:string};
 const result=JSON.parse(payload.response??'{}');
 if(!Array.isArray(result.directions)||result.directions.length!==source.beats.length)throw Error('Model did not return one visual direction per timed beat');
 const assets=source.beats.map((b:{id:string},i:number)=>({id:'visual-'+b.id,mode:result.directions[i].mode,status:'needs_asset' as const}));
 const shots=source.beats.map((b:{id:string;startMs:number;endMs:number;narration:string},i:number)=>{
  const d=result.directions[i];
  return {id:'shot-'+b.id,beatId:b.id,startMs:b.startMs,endMs:b.endMs,narration:b.narration,intent:d.intent,subject:d.subject,mode:d.mode,assetIds:[assets[i].id],palette:d.palette,composition:d.composition,motion:d.motion,review:'proposed' as const};
 });
 const plan=validateVisualPlan({schemaVersion:1,channelId:source.channelId,episodeId:source.episodeId,format:source.format??{width:1920,height:1080,fps:30},audio:source.audio,shots,assets});
 const out=resolve(output);await mkdir(dirname(out),{recursive:true});await writeFile(out,JSON.stringify({...plan,assetBriefs:Object.fromEntries(source.beats.map((b:{id:string},i:number)=>[assets[i].id,result.directions[i].searchOrGenerationBrief]))},null,2));
 console.log('Visual proposal written to '+out+'; assets and creative approval are NOT complete.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
