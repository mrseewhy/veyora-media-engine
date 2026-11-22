export type SceneKind = 'title'|'comparison'|'diagram'|'screenshot-zoom'|'outro';
export interface Scene {id:string; kind:SceneKind; startMs:number; durationMs:number; narration:string; headline:string; detail?:string; assets:{path:string; license:string}[]; sources:string[]}
export interface Episode {schemaVersion:1; slug:string; title:string; format:{width:number;height:number;fps:number;targetSeconds:number}; voice:{engine:'say'|'kokoro'|'gemini-flash';name:string;rate:number}; scenes:Scene[]}
export function validateEpisode(value:unknown): Episode {
 const e=value as Episode;
 if(!e||e.schemaVersion!==1||!e.slug||!e.title||!e.format||!e.voice||!Array.isArray(e.scenes)||!e.scenes.length) throw Error('Invalid episode structure');
 if(e.format.width!==1920||e.format.height!==1080||e.format.fps!==30||e.format.targetSeconds!==100) throw Error('Phase 1 requires 1920x1080, 30 fps, 100 seconds');
 if(!['say','kokoro','gemini-flash'].includes(e.voice.engine)||!e.voice.name||!Number.isFinite(e.voice.rate)) throw Error('Invalid voice');
 let end=0; const ids=new Set<string>();
 for(const s of e.scenes){
  if(!s.id||ids.has(s.id)||!['title','comparison','diagram','screenshot-zoom','outro'].includes(s.kind)||!s.narration||!s.headline||!Array.isArray(s.assets)||!Array.isArray(s.sources)) throw Error(`Invalid scene ${s.id}`);
  if(s.startMs!==end||!Number.isInteger(s.durationMs)||s.durationMs<=0) throw Error(`Timeline gap or overlap at ${s.id}`);
  if(s.assets.some(a=>!a.path||!a.license)) throw Error(`Missing asset license at ${s.id}`);
  if(s.headline.length>72||(s.detail?.length??0)>130) throw Error(`Text too long at ${s.id}`);
  ids.add(s.id);end+=s.durationMs;
 }
 if(end!==100000) throw Error(`Expected 100000 ms, got ${end}`);
 return e;
}
