import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDirectedEpisode, type DirectedEpisode} from '../packages/shared/src/visual-director.js';
const valid = (): DirectedEpisode => ({
  schemaVersion:1, channelId:'toolpilot', seriesId:'ai-tools-100s', episodeId:'sample', configVersion:'1',
  narrationAssetId:'approved-voice', narrationLocked:true, durationMs:4000, humanReview:'approved',
  assets:[{id:'original',uri:'data/episodes/sample/asset.png',creator:'Veyora',license:'owned',rights:'cleared',synthetic:false,factualReview:'approved',costApproved:true}],
  shots:[{id:'shot-1',beatId:'beat-1',startMs:0,endMs:4000,narrationQuote:'The machine builds another machine',intent:'show_process',modes:['original_illustration'],subject:'machine assembly',action:'robot arm installs a new component',composition:'foreground arm and assembly line',camera:'tracking push',transition:'match cut',assetIds:['original'],landscape:'wide factory',portrait:'vertical robot arm',square:'center assembly',truthfulnessNote:'conceptual illustration',review:'approved'}]
});
test('cleared, directed edit can render and publish',()=>assert.deepEqual(validateDirectedEpisode(valid()),{readyToRender:true,readyToPublish:true,blockers:[],warnings:[]}));
test('unknown rights block rendering',()=>{const x=valid();x.assets[0].rights='pending_review';assert.equal(validateDirectedEpisode(x).readyToRender,false)});
test('missing portrait design blocks rendering',()=>{const x=valid();x.shots[0].portrait='';assert.equal(validateDirectedEpisode(x).readyToRender,false)});
test('narration lock is mandatory',()=>{const x=valid();(x as {narrationLocked:boolean}).narrationLocked=false;assert.equal(validateDirectedEpisode(x).readyToRender,false)});
test('unreviewed edit cannot publish',()=>{const x=valid();x.humanReview='pending';assert.equal(validateDirectedEpisode(x).readyToPublish,false)});
test('diagram-only video is rejected',()=>{const x=valid();x.shots[0].modes=['data_diagram'];assert.equal(validateDirectedEpisode(x).readyToRender,false)});
test('gaps in shot coverage block rendering',()=>{const x=valid();x.shots[0].endMs=3000;assert.equal(validateDirectedEpisode(x).readyToRender,false)});
