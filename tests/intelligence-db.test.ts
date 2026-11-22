import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import {connectDatabase,type IntelligenceDb} from '../packages/intelligence/src/db.js';
import {addFeedback,compareRenders,evaluationHistory,extractCandidates,lessonContext,lessonUsage,listFeedback,proposeLesson,recordHumanEvaluation,registerEpisode,registerRender,reviewLesson,setRenderStatus} from '../packages/intelligence/src/service.js';

const enabled=process.env.RUN_DB_TESTS==='1';
class RollbackOnly extends Error{}
test('PostgreSQL feedback, lesson approval, context application and evaluation history', {skip:!enabled},async()=>{
  const {db,pool}=connectDatabase();
  const temp=await mkdtemp(join(tmpdir(),'veyora-intelligence-'));
  try{
    const base=JSON.parse(await readFile('fixtures/storyboards/toolpilot-agents-100s.json','utf8'));
    base.episodeId=`intelligence-test-${randomUUID()}`;
    const path=join(temp,'storyboard.json');await writeFile(path,JSON.stringify(base));
    const nextStoryboard={...base,episodeId:`intelligence-next-${randomUUID()}`};
    const nextPath=join(temp,'next-storyboard.json');await writeFile(nextPath,JSON.stringify(nextStoryboard));
    const artifact=join(temp,'artifact.bin');
    const bytes=Buffer.from('isolated production-intelligence integration artifact');
    await writeFile(artifact,bytes);
    const qa=join(temp,'qa.json');
    await writeFile(qa,JSON.stringify({passed:true,sha256:createHash('sha256').update(bytes).digest('hex'),checks:[{id:'integration-check',passed:true}],probe:{format:{duration:'1.000'}}}));
    await assert.rejects(db.transaction(async tx=>{
      const testDb=tx as unknown as IntelligenceDb;
      const episode=await registerEpisode(testDb,path,'AI Agents test');
      const nextEpisode=await registerEpisode(testDb,nextPath,'Next concept explainer');
      const first=await registerRender(testDb,{episodeId:episode.id,artifactPath:artifact,qaPath:qa});
      const second=await registerRender(testDb,{episodeId:episode.id,artifactPath:artifact,qaPath:qa});
      await addFeedback(testDb,{renderId:first.id,sceneId:'agent-loop',rating:2,problemCode:'scene_variety',comment:'Repeated panel layout',requestedCorrection:'Use a distinct visual metaphor',reviewer:'tester'});
      await addFeedback(testDb,{renderId:second.id,sceneId:'missing-eggs',rating:2,problemCode:'scene_variety',comment:'Another repeated panel',requestedCorrection:'Use a distinct visual metaphor',reviewer:'tester'});
      assert.equal((await listFeedback(testDb,first.id)).length,1);
      assert.equal((await compareRenders(testDb,first.id,second.id)).right.version,2);
      const candidates=await extractCandidates(testDb);
      const lesson=candidates.find(x=>x.category==='scene_variety'&&x.scope==='concept-explainer');
      assert.equal(lesson?.status,'candidate');
      await reviewLesson(testDb,lesson!.id,'approved','tester');
      const success=await proposeLesson(testDb,{category:'successful_pattern',scope:'concept-explainer',statement:'Use a comic reaction to clarify the distinction'});
      assert.equal(success?.status,'candidate');
      await reviewLesson(testDb,success!.id,'approved','tester');
      const context=await lessonContext(testDb,nextEpisode.id,'storyboard','tester');
      assert.ok(context.lessonIds.includes(lesson!.id));
      assert.match(context.text,/distinct visual metaphor/);
      assert.match(context.text,/comic reaction/);
      assert.equal((await lessonUsage(testDb,nextEpisode.id)).length,2);
      await recordHumanEvaluation(testDb,{renderId:second.id,evaluator:'tester',scores:{visualStorytelling:4,sceneVariety:2,narrationQuality:4,pacing:4,readability:4,factualAccuracy:4}});
      assert.equal((await evaluationHistory(testDb,second.id)).length,2);
      await setRenderStatus(testDb,second.id,'needs_changes','tester','Scene variety is weak');
      throw new RollbackOnly();
    }),RollbackOnly);
  }finally{await rm(temp,{recursive:true,force:true});await pool.end()}
});
