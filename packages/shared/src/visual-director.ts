/** Shot-level editorial contract. This does not replace existing storyboards. */
export type VisualMode = 'licensed_photo'|'licensed_footage'|'original_recording'|'screenshot'|'original_illustration'|'ai_image'|'ai_video'|'motion_graphic'|'data_diagram'|'kinetic_type';
export type AssetStatus = 'ready'|'needs_asset'|'needs_rights_review'|'needs_cost_approval'|'needs_fact_review';
export interface VisualAsset {
 id:string; mode:VisualMode; status:AssetStatus; path?:string;
 sourceUrl?:string; creator?:string; license?:string; attribution?:string;
 rightsReviewed?:boolean; costUsd?:number; generated?:boolean; disclosure?:string;
}
export interface VisualShot {
 id:string; beatId:string; startMs:number; endMs:number; narration:string;
 intent:string; subject:string; mode:VisualMode; assetIds:string[];
 palette:string[]; composition:string; motion:string;
 syntheticDisclosure?:string; review:'proposed'|'approved'|'rejected';
}
export interface VisualPlan {
 schemaVersion:1; channelId:string; episodeId:string; format:{width:number;height:number;fps:number};
 audio:{path:string;durationMs:number;locked:boolean};
 shots:VisualShot[]; assets:VisualAsset[];
}
const modes=new Set<VisualMode>(['licensed_photo','licensed_footage','original_recording','screenshot','original_illustration','ai_image','ai_video','motion_graphic','data_diagram','kinetic_type']);
const assert=(ok:unknown,msg:string):void=>{if(!ok)throw new Error(msg);};
export function validateVisualPlan(raw:unknown):VisualPlan {
 assert(raw&&typeof raw==='object','Plan must be an object');
 const p=raw as VisualPlan;
 assert(p.schemaVersion===1&&!!p.channelId&&!!p.episodeId,'Invalid plan identity');
 assert(p.format&&p.format.width>0&&p.format.height>0&&p.format.fps>0,'Invalid format');
 assert(p.audio&&p.audio.locked===true&&Number.isInteger(p.audio.durationMs)&&p.audio.durationMs>0&&!!p.audio.path,'Approved audio path/duration/lock required');
 assert(Array.isArray(p.shots)&&p.shots.length>0&&Array.isArray(p.assets),'Shots and assets required');
 const ids=new Set<string>();
 for(const a of p.assets){
  assert(a.id&&!ids.has(a.id),'Missing or duplicate asset id');
  ids.add(a.id);assert(modes.has(a.mode),'Invalid asset mode '+a.id);
  assert(['ready','needs_asset','needs_rights_review','needs_cost_approval','needs_fact_review'].includes(a.status),'Invalid asset status');
  if(a.status==='ready'){
   assert(a.path,'Ready asset missing local path: '+a.id);
   assert(a.rightsReviewed===true&&!!a.license&&!!a.creator,'Ready asset lacks rights/provenance: '+a.id);
  }
  if(a.costUsd!==undefined)assert(Number.isFinite(a.costUsd)&&a.costUsd>=0,'Invalid cost');
  if(a.generated)assert(!!a.disclosure,'Generated asset missing disclosure decision: '+a.id);
 }
 let end=0;const shotIds=new Set<string>();
 for(const s of p.shots){
  assert(s.id&&!shotIds.has(s.id),'Missing or duplicate shot id');shotIds.add(s.id);
  assert(Number.isInteger(s.startMs)&&Number.isInteger(s.endMs)&&s.startMs===end&&s.endMs>s.startMs,'Gap/overlap/invalid shot timing: '+s.id);
  end=s.endMs;
  assert(s.beatId&&s.narration&&s.intent&&s.subject&&s.composition&&s.motion,'Incomplete shot: '+s.id);
  assert(modes.has(s.mode)&&Array.isArray(s.palette)&&s.palette.length>0,'Missing visual mode/palette: '+s.id);
  assert(Array.isArray(s.assetIds)&&s.assetIds.length>0,'Shot has no assets: '+s.id);
  for(const id of s.assetIds)assert(ids.has(id),'Unknown asset '+id+' in '+s.id);
  assert(['proposed','approved','rejected'].includes(s.review),'Invalid shot review');
 }
 assert(end===p.audio.durationMs,'Shots must cover approved audio exactly');
 return p;
}
export function inspectVisualPlan(plan:VisualPlan){
 const issues:string[]=[];const assetMap=new Map(plan.assets.map(a=>[a.id,a]));
 for(const a of plan.assets)if(a.status!=='ready')issues.push('Asset '+a.id+': '+a.status);
 for(const s of plan.shots){
  if(s.review!=='approved')issues.push('Shot '+s.id+': human review '+s.review);
  if(s.assetIds.some(id=>assetMap.get(id)?.status!=='ready'))issues.push('Shot '+s.id+': unresolved assets');
 }
 const textOnly=plan.shots.filter(s=>s.mode==='kinetic_type'||s.mode==='data_diagram').reduce((n,s)=>n+s.endMs-s.startMs,0);
 if(textOnly/plan.audio.durationMs>0.4)issues.push('Creative warning: over 40% text/diagram-only shots; review for slideshow appearance');
 if(new Set(plan.shots.map(s=>s.palette.join(','))).size===1&&plan.shots.length>2)issues.push('Creative warning: every shot uses the same palette; check deliberate colour variation');
 return {readyForHumanReview:!issues.some(i=>i.startsWith('Asset ')||i.includes('unresolved assets')),issues,stats:{shots:plan.shots.length,assets:plan.assets.length,textOnlyRatio:+(textOnly/plan.audio.durationMs).toFixed(3)}};
}
