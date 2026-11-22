import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {and, desc, eq, inArray, or, sql} from 'drizzle-orm';
import {validateStoryboard} from '../../shared/src/storyboard.js';
import {validateEditorialStoryboard} from '../../shared/src/editorial-storyboard.js';
import type {IntelligenceDb} from './db.js';
import {buildLessonContext,extractLessonCandidates,technicalFromQa,validateCreativeScores,validateFeedback} from './logic.js';
import {episodes,evaluationRuns,lessonApplications,productionLessons,renderVersions,sceneFeedback,type QaSnapshot} from './schema.js';

const required=(value:string|undefined,name:string)=>{if(!value?.trim())throw new Error(`${name} is required`);return value.trim()};
const loadJson=async(path:string)=>JSON.parse(await readFile(resolve(path),'utf8')) as unknown;
const currentEpisode=async(db:IntelligenceDb,id:string)=>{
  const row=await db.query.episodes.findFirst({where:eq(episodes.id,id)});
  if(!row)throw new Error(`Episode not found: ${id}`);
  return row;
};
const currentRender=async(db:IntelligenceDb,id:string)=>{
  const row=await db.query.renderVersions.findFirst({where:eq(renderVersions.id,id)});
  if(!row)throw new Error(`Render not found: ${id}`);
  return row;
};

export async function registerEpisode(db:IntelligenceDb,storyboardPath:string,title:string){
  const data=await loadJson(storyboardPath) as Record<string,unknown>;
  const valid=('evidence' in data)?validateStoryboard(data):validateEditorialStoryboard(data);
  const id=valid.episodeId;
  const existing=await db.query.episodes.findFirst({where:eq(episodes.id,id)});
  await db.insert(episodes).values({id,title:required(title,'title'),journeyTemplate:valid.journeyTemplate,storyboardPath:storyboardPath,storyboardVersion:valid.storyboardVersion,lifecycleStatus:'draft'}).onConflictDoUpdate({target:episodes.id,set:{title:required(title,'title'),journeyTemplate:valid.journeyTemplate,storyboardPath,storyboardVersion:valid.storyboardVersion,lifecycleStatus:existing?.storyboardVersion===valid.storyboardVersion?(existing.lifecycleStatus):'draft',updatedAt:new Date()}});
  return await currentEpisode(db,id);
}

export async function registerRender(db:IntelligenceDb,input:{episodeId:string;artifactPath:string;qaPath:string;version?:number}){
  const episode=await currentEpisode(db,required(input.episodeId,'episodeId'));
  const bytes=await readFile(resolve(input.artifactPath));
  const hash=createHash('sha256').update(bytes).digest('hex');
  const qa=await loadJson(input.qaPath) as QaSnapshot & {sha256?:string};
  if(!qa.sha256||qa.sha256!==hash)throw new Error('QA SHA-256 is missing or does not match artifact');
  const technical=technicalFromQa(qa);
  const previous=await db.select({version:sql<number>`coalesce(max(${renderVersions.version}),0)`}).from(renderVersions).where(eq(renderVersions.episodeId,episode.id));
  const version=input.version??Number(previous[0]?.version??0)+1;
  if(!Number.isInteger(version)||version<1)throw new Error('Version must be a positive integer');
  const durationMs=Number((qa as {probe?:{format?:{duration?:string}}}).probe?.format?.duration)*1000;
  const durationFallback=Number((qa as {format?:{durationMs?:number}}).format?.durationMs);
  const duration=Math.round(Number.isFinite(durationMs)&&durationMs>0?durationMs:durationFallback);
  if(!Number.isFinite(duration)||duration<=0)throw new Error('QA snapshot has no valid duration');
  const [render]=await db.insert(renderVersions).values({episodeId:episode.id,version,storyboardVersion:episode.storyboardVersion,artifactPath:input.artifactPath,artifactSha256:hash,durationMs:duration,qaResult:qa,status:'proposed'}).returning();
  await db.insert(evaluationRuns).values({renderVersionId:render.id,evaluator:'ffmpeg-qa',evaluatorType:'automated',criteriaVersion:'v1',creativeScores:{},technicalResult:technical,result:technical.passed?'pass':'fail'});
  await db.update(episodes).set({lifecycleStatus:'needs_qa',updatedAt:new Date()}).where(eq(episodes.id,episode.id));
  return render;
}

export async function listRenders(db:IntelligenceDb,episodeId:string){
  await currentEpisode(db,episodeId);
  return db.select().from(renderVersions).where(eq(renderVersions.episodeId,episodeId)).orderBy(desc(renderVersions.version));
}

export async function addFeedback(db:IntelligenceDb,input:{renderId:string;sceneId?:string|null;rating:number;problemCode?:string|null;comment:string;requestedCorrection?:string|null;reviewer:string}){
  const render=await currentRender(db,input.renderId);
  const feedback=validateFeedback(input);
  if(feedback.sceneId){
    const episode=await currentEpisode(db,render.episodeId);
    const storyboard=await loadJson(episode.storyboardPath) as {scenes?:Array<{id:string}>};
    if(!storyboard.scenes?.some(scene=>scene.id===feedback.sceneId))throw new Error(`Scene ${feedback.sceneId} is not in the storyboard`);
  }
  const [row]=await db.insert(sceneFeedback).values({renderVersionId:render.id,sceneId:feedback.sceneId??null,rating:feedback.rating,problemCode:feedback.problemCode??null,comment:feedback.comment,requestedCorrection:feedback.requestedCorrection??null,reviewer:feedback.reviewer}).returning();
  return row;
}
export async function listFeedback(db:IntelligenceDb,renderId:string){
  await currentRender(db,renderId);
  return db.select().from(sceneFeedback).where(eq(sceneFeedback.renderVersionId,renderId)).orderBy(desc(sceneFeedback.createdAt));
}

export async function setRenderStatus(db:IntelligenceDb,renderId:string,status:'approved'|'needs_changes',actor:string,reason:string){
  const render=await currentRender(db,renderId);
  if(status==='approved'&&!technicalFromQa(render.qaResult).passed)throw new Error('Cannot approve a render with failed technical QA');
  if(status==='approved'&&!reason.trim())throw new Error('Approval reason is required');
  if(status==='approved'){
    const older=await db.select({id:renderVersions.id}).from(renderVersions).where(and(eq(renderVersions.episodeId,render.episodeId),sql`${renderVersions.version} > ${render.version}`));
    if(older.length)throw new Error('Cannot approve an older render while newer versions exist');
  }
  const [updated]=await db.update(renderVersions).set({status,approvalActor:required(actor,'actor'),approvalReason:required(reason,'reason'),approvedAt:status==='approved'?new Date():null}).where(eq(renderVersions.id,renderId)).returning();
  await db.update(episodes).set({lifecycleStatus:status==='approved'?'render_approved':'needs_changes',updatedAt:new Date()}).where(eq(episodes.id,render.episodeId));
  return updated;
}

export async function compareRenders(db:IntelligenceDb,leftId:string,rightId:string){
  const left=await currentRender(db,leftId),right=await currentRender(db,rightId);
  if(left.episodeId!==right.episodeId)throw new Error('Render comparison requires the same episode');
  const leftFeedback=await listFeedback(db,leftId),rightFeedback=await listFeedback(db,rightId);
  const leftEvaluations=await evaluationHistory(db,leftId),rightEvaluations=await evaluationHistory(db,rightId);
  const byId=(qa:QaSnapshot)=>new Map((qa.checks??[]).map(c=>[c.id,c.passed]));
  const a=byId(left.qaResult),b=byId(right.qaResult);
  const changedChecks=[...new Set([...a.keys(),...b.keys()])].filter(id=>a.get(id)!==b.get(id)).map(id=>({id,before:a.get(id)??null,after:b.get(id)??null}));
  return {episodeId:left.episodeId,left:{version:left.version,id:left.id,status:left.status,sha256:left.artifactSha256,durationMs:left.durationMs,feedback:leftFeedback,evaluations:leftEvaluations},right:{version:right.version,id:right.id,status:right.status,sha256:right.artifactSha256,durationMs:right.durationMs,feedback:rightFeedback,evaluations:rightEvaluations},changedChecks};
}

export async function extractCandidates(db:IntelligenceDb,minOccurrences=2){
  const rows=await db.select({id:sceneFeedback.id,problemCode:sceneFeedback.problemCode,requestedCorrection:sceneFeedback.requestedCorrection,rating:sceneFeedback.rating,journeyTemplate:episodes.journeyTemplate}).from(sceneFeedback).innerJoin(renderVersions,eq(sceneFeedback.renderVersionId,renderVersions.id)).innerJoin(episodes,eq(renderVersions.episodeId,episodes.id));
  const candidates=extractLessonCandidates(rows,minOccurrences);
  const output=[];
  for(const candidate of candidates){
    const existing=await db.query.productionLessons.findFirst({where:eq(productionLessons.fingerprint,candidate.fingerprint)});
    if(existing?.status==='approved'||existing?.status==='rejected'){output.push(existing);continue;}
    const [row]=await db.insert(productionLessons).values(candidate).onConflictDoUpdate({target:productionLessons.fingerprint,set:{statement:candidate.statement,sourceFeedbackIds:candidate.sourceFeedbackIds,occurrenceCount:candidate.occurrenceCount,updatedAt:new Date()}}).returning();
    output.push(row);
  }
  return output;
}
export async function listLessons(db:IntelligenceDb,status?:string){
  return db.select().from(productionLessons).where(status?eq(productionLessons.status,status):undefined).orderBy(desc(productionLessons.createdAt));
}
export async function proposeLesson(db:IntelligenceDb,input:{category:string;scope:string;statement:string;sourceFeedbackIds?:string[]}){
  const category=required(input.category,'category');
  const scope=required(input.scope,'scope');
  const statement=required(input.statement,'statement');
  if(!['global','concept-explainer','tool-review','comparison','tutorial'].includes(scope))throw new Error('Invalid lesson scope');
  if(!/^[a-z][a-z0-9_]*$/.test(category))throw new Error('Category must be lower_snake_case');
  const sourceFeedbackIds=input.sourceFeedbackIds??[];
  if(!Array.isArray(sourceFeedbackIds)||sourceFeedbackIds.some(id=>typeof id!=='string'))throw new Error('sourceFeedbackIds must be an array of ids');
  if(sourceFeedbackIds.length){
    const found=await db.select({id:sceneFeedback.id}).from(sceneFeedback).where(inArray(sceneFeedback.id,sourceFeedbackIds));
    if(found.length!==new Set(sourceFeedbackIds).size)throw new Error('One or more source feedback ids do not exist');
  }
  const fingerprint=createHash('sha256').update(`${scope}:${category}:${statement.toLowerCase()}`).digest('hex');
  const [row]=await db.insert(productionLessons).values({fingerprint,category,scope,statement,status:'candidate',sourceFeedbackIds,occurrenceCount:Math.max(1,sourceFeedbackIds.length)}).onConflictDoNothing().returning();
  return row??await db.query.productionLessons.findFirst({where:eq(productionLessons.fingerprint,fingerprint)});
}
export async function reviewLesson(db:IntelligenceDb,id:string,status:'approved'|'rejected',actor:string){
  const existing=await db.query.productionLessons.findFirst({where:eq(productionLessons.id,id)});
  if(!existing)throw new Error(`Lesson not found: ${id}`);
  if(existing.status!=='candidate')throw new Error('Only candidate lessons can be reviewed');
  const [row]=await db.update(productionLessons).set({status,approvedBy:required(actor,'actor'),approvedAt:status==='approved'?new Date():null,updatedAt:new Date()}).where(eq(productionLessons.id,id)).returning();
  return row;
}
export async function lessonContext(db:IntelligenceDb,episodeId:string,kind:'storyboard'|'script',applyBy?:string){
  const episode=await currentEpisode(db,episodeId);
  const lessons=await db.select().from(productionLessons).where(and(eq(productionLessons.status,'approved'),or(eq(productionLessons.scope,'global'),eq(productionLessons.scope,episode.journeyTemplate)))).orderBy(desc(productionLessons.occurrenceCount)).limit(20);
  const context=buildLessonContext(lessons,kind);
  if(applyBy){
    for(const lesson of lessons)await db.insert(lessonApplications).values({lessonId:lesson.id,episodeId,storyboardVersion:episode.storyboardVersion,contextKind:kind,appliedBy:required(applyBy,'applyBy')}).onConflictDoNothing();
  }
  return context;
}
export async function lessonUsage(db:IntelligenceDb,episodeId:string){
  await currentEpisode(db,episodeId);
  return db.select().from(lessonApplications).where(eq(lessonApplications.episodeId,episodeId)).orderBy(desc(lessonApplications.appliedAt));
}

export async function recordHumanEvaluation(db:IntelligenceDb,input:{renderId:string;evaluator:string;scores:unknown;factualNotes?:string;modelVersion?:string}){
  const render=await currentRender(db,input.renderId);
  const creativeScores=validateCreativeScores(input.scores);
  if(Object.keys(creativeScores).length!==6)throw new Error('Human evaluation needs all six creative criteria');
  const technicalResult=technicalFromQa(render.qaResult);
  const low=Object.values(creativeScores).some(score=>score!==undefined&&score<=2);
  const [row]=await db.insert(evaluationRuns).values({renderVersionId:render.id,evaluator:required(input.evaluator,'evaluator'),evaluatorType:'human',modelVersion:input.modelVersion??null,criteriaVersion:'v1',creativeScores,technicalResult,factualNotes:input.factualNotes??null,result:!technicalResult.passed?'fail':low?'needs_review':'pass'}).returning();
  return row;
}
export async function evaluationHistory(db:IntelligenceDb,renderId:string){
  await currentRender(db,renderId);
  return db.select().from(evaluationRuns).where(eq(evaluationRuns.renderVersionId,renderId)).orderBy(desc(evaluationRuns.createdAt));
}
