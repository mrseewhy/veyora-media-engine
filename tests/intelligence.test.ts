import assert from 'node:assert/strict';
import test from 'node:test';
import {buildLessonContext,extractLessonCandidates,technicalFromQa,validateCreativeScores,validateFeedback} from '../packages/intelligence/src/logic.js';

test('feedback requires a reason for a rejected scene',()=>{
  assert.throws(()=>validateFeedback({rating:1,comment:'Hard to read',reviewer:'operator'}),/problem code/);
  assert.equal(validateFeedback({rating:2,problemCode:'readability',comment:'Tiny label',reviewer:'operator'}).rating,2);
});
test('repeated feedback becomes a candidate, never an approved rule',()=>{
  const rows=[
    {id:'a',problemCode:'scene_variety',requestedCorrection:'Use a new visual metaphor',rating:2,journeyTemplate:'concept-explainer'},
    {id:'b',problemCode:'scene_variety',requestedCorrection:'Vary the scene layout',rating:2,journeyTemplate:'concept-explainer'},
  ];
  const result=extractLessonCandidates(rows);
  assert.equal(result.length,1);
  assert.equal(result[0].occurrenceCount,2);
  assert.deepEqual(result[0].sourceFeedbackIds,['a','b']);
  assert.match(result[0].statement,/scene variety/);
});
test('lesson context contains only supplied approved lessons',()=>{
  const result=buildLessonContext([{id:'lesson-1',category:'pacing',scope:'global',statement:'Hold code long enough to read'}],'storyboard');
  assert.deepEqual(result.lessonIds,['lesson-1']);
  assert.match(result.text,/Hold code long enough to read/);
  assert.match(buildLessonContext([],'script').text,/No approved/);
});
test('technical QA does not invent subjective creative scores',()=>{
  const result=technicalFromQa({passed:true,checks:[{id:'fps',passed:true}]});
  assert.equal(result.passed,true);
  assert.deepEqual(validateCreativeScores({pacing:4,readability:5}),{pacing:4,readability:5});
  assert.throws(()=>validateCreativeScores({pacing:6}),/1 to 5/);
});
