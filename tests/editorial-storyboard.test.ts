import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {validateEditorialStoryboard} from '../packages/shared/src/editorial-storyboard.js';

const fixture = JSON.parse(readFileSync('fixtures/storyboards/toolpilot-agents-100s.json', 'utf8'));
const copy = () => structuredClone(fixture);

test('100-second episode covers every beat and scene', () => {
  const s = validateEditorialStoryboard(copy());
  assert.equal(s.scenes.filter(scene => scene.status === 'implemented').reduce((n, scene) => n + scene.durationMs, 0), 100000);
  assert.equal(s.scenes.at(-1)!.startMs + s.scenes.at(-1)!.durationMs, 100000);
});

test('editorial storyboard rejects a missing scene', () => {
  const s = copy();
  s.scenes.splice(2, 1);
  assert.throws(() => validateEditorialStoryboard(s), /gap, overlap/);
});

test('editorial storyboard rejects undeclared assets', () => {
  const s = copy();
  s.scenes[0].assetIds.push('unknown');
  assert.throws(() => validateEditorialStoryboard(s), /undeclared asset/);
});

test('editorial storyboard rejects unmatched captions', () => {
  const s = copy();
  s.narration.captions[0].text = 'Something else';
  assert.throws(() => validateEditorialStoryboard(s), /Captions do not cover narration/);
});
