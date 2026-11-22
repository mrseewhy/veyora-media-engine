import {test} from 'node:test';import {strict as assert} from 'node:assert';import {readFileSync} from 'node:fs';import {validateEpisode} from '../packages/shared/src/schema.js';
const fixture=JSON.parse(readFileSync('fixtures/toolpilot-chatgpt.json','utf8'));
test('valid 100-second fixture',()=>assert.equal(validateEpisode(fixture).scenes.length,10));
test('timeline gaps rejected',()=>{const x=structuredClone(fixture);x.scenes[1].startMs=10001;assert.throws(()=>validateEpisode(x),/gap or overlap/)});
test('missing license rejected',()=>{const x=structuredClone(fixture);x.scenes[0].assets=[{path:'x'}];assert.throws(()=>validateEpisode(x),/license/)});
test('wrong total rejected',()=>{const x=structuredClone(fixture);x.scenes.at(-1).durationMs=9000;assert.throws(()=>validateEpisode(x),/Expected/)});
