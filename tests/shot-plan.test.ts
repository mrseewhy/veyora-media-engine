import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateShotPlan, type ExecutableShot} from '../packages/shared/src/shot-plan.js';

const shot = (startFrame: number, endFrame: number): ExecutableShot => ({
  shotId: 'one', actId: 'act', startFrame, endFrame, subject: 'machine',
  visualIntent: 'Show the machine assembling its successor', startState: 'parts separate',
  action: 'arm mounts processor', endState: 'successor starts', assetIds: ['machine-layers'],
  sourceAndRights: 'original illustration',
});

test('accepts a complete shot aligned to locked narration', () => {
  assert.deepEqual(validateShotPlan([shot(150, 450)], ['act'], [300]).errors, []);
});

test('rejects gaps and truncated narration coverage', () => {
  assert.ok(validateShotPlan([shot(151, 449)], ['act'], [300]).errors.length > 0);
});

test('rejects generic visual state before rendering', () => {
  const generic = shot(150, 450);
  generic.startState = 'unrevealed shot-specific subject';
  assert.ok(validateShotPlan([generic], ['act'], [300]).errors.some(w => w.includes('generic state')));
});

test('Singularity full edit covers the locked narration with concrete actions', () => {
  const plan = JSON.parse(readFileSync('episodes/toolpilot/singularity-explained/shot-list.json', 'utf8')) as {shots: ExecutableShot[]};
  const manifest = JSON.parse(readFileSync('episodes/toolpilot/singularity-explained/visual-assets.json', 'utf8')) as {assets: Array<{id: string; rights: string}>};
  const report = validateShotPlan(plan.shots, ['claim','definition','feedback','today','interpretation','takeaway'], [528,561,588,600,552,738]);
  assert.deepEqual(report.errors, []);
  assert.equal(plan.shots.length, 26);
  const assets = new Map(manifest.assets.map(a=>[a.id,a]));
  for(const shot of plan.shots) for(const id of shot.assetIds) assert.ok(assets.get(id)?.rights.startsWith('cleared'), `${shot.shotId}: ${id}`);
});
