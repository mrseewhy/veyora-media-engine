import {createHash} from 'node:crypto';
import type {CreativeScores, QaSnapshot, TechnicalResult} from './schema.js';

export const creativeCriteria=['visualStorytelling','sceneVariety','narrationQuality','pacing','readability','factualAccuracy'] as const;
export type ProblemCode='visual_storytelling'|'scene_variety'|'narration'|'pacing'|'readability'|'technical'|'factual_accuracy'|'other';
export const problemCodes:ProblemCode[]=['visual_storytelling','scene_variety','narration','pacing','readability','technical','factual_accuracy','other'];

export function validateFeedback(input:{rating:number;sceneId?:string|null;problemCode?:string|null;comment:string;requestedCorrection?:string|null;reviewer:string}) {
  if(!Number.isInteger(input.rating)||input.rating<1||input.rating>5) throw new Error('Rating must be an integer from 1 to 5');
  if(!input.comment?.trim()||!input.reviewer?.trim()) throw new Error('Comment and reviewer are required');
  if(input.problemCode&&!problemCodes.includes(input.problemCode as ProblemCode)) throw new Error(`Unknown problem code: ${input.problemCode}`);
  if(input.rating<=2&&!input.problemCode) throw new Error('A rejected or poor scene needs a problem code');
  if(input.sceneId!==undefined&&input.sceneId!==null&&!input.sceneId.trim()) throw new Error('sceneId cannot be blank');
  return {...input,comment:input.comment.trim(),reviewer:input.reviewer.trim()};
}

export function validateCreativeScores(value:unknown):CreativeScores {
  if(value===null||typeof value!=='object'||Array.isArray(value)) throw new Error('Creative scores must be an object');
  const out:CreativeScores={};
  for(const [key,score] of Object.entries(value)) {
    if(!creativeCriteria.includes(key as typeof creativeCriteria[number])) throw new Error(`Unknown creative criterion: ${key}`);
    if(!Number.isInteger(score)||Number(score)<1||Number(score)>5) throw new Error(`${key} must be an integer from 1 to 5`);
    out[key as keyof CreativeScores]=Number(score);
  }
  return out;
}

export function technicalFromQa(qa:QaSnapshot):TechnicalResult {
  const checks=Array.isArray(qa.checks)?qa.checks.filter(c=>c&&typeof c.id==='string'&&typeof c.passed==='boolean').map(c=>({id:c.id,passed:c.passed,detail:c.detail})):[];
  if(checks.length===0) throw new Error('QA snapshot has no valid technical checks');
  return {passed:qa.passed===true&&checks.every(c=>c.passed),checks};
}

export type FeedbackForLesson={id:string;problemCode:string|null;requestedCorrection:string|null;rating:number;journeyTemplate:string};
export type LessonCandidate={fingerprint:string;category:string;scope:string;statement:string;sourceFeedbackIds:string[];occurrenceCount:number};
export function extractLessonCandidates(feedback:FeedbackForLesson[],minOccurrences=2):LessonCandidate[] {
  if(!Number.isInteger(minOccurrences)||minOccurrences<2) throw new Error('minOccurrences must be at least 2');
  const groups=new Map<string,FeedbackForLesson[]>();
  for(const item of feedback){
    if(item.rating>3||!item.problemCode||!item.requestedCorrection?.trim()) continue;
    const key=`${item.journeyTemplate}:${item.problemCode}`;
    groups.set(key,[...(groups.get(key)??[]),item]);
  }
  return [...groups.entries()].filter(([,rows])=>rows.length>=minOccurrences).map(([key,rows])=>{
    const [scope,category]=key.split(':');
    const correction=rows.map(r=>r.requestedCorrection!.trim()).sort((a,b)=>a.length-b.length)[0];
    return {
      fingerprint:createHash('sha256').update(key).digest('hex'),
      category,scope,
      statement:`For ${scope} episodes, address ${category.replaceAll('_',' ')}: ${correction}`,
      sourceFeedbackIds:[...new Set(rows.map(r=>r.id))],
      occurrenceCount:rows.length,
    };
  });
}

export type ApprovedLesson={id:string;statement:string;category:string;scope:string};
export function buildLessonContext(lessons:ApprovedLesson[],kind:'storyboard'|'script') {
  return {
    contextKind:kind,
    lessonIds:lessons.map(l=>l.id),
    text:lessons.length?`Approved production lessons for ${kind} planning:\n${lessons.map((l,i)=>`${i+1}. [${l.category}] ${l.statement}`).join('\n')}\nThese are editorial preferences; verify all factual claims and do not rewrite prompts or code automatically.`:'No approved production lessons apply.',
  };
}
