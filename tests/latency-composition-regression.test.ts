import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {msToFrame, validateStoryboard} from '../packages/shared/src/storyboard.js';

test('existing latency composition retains its 300-frame evidence story', () => {
  const fixture = JSON.parse(readFileSync('fixtures/storyboards/toolpilot-latency-10s.json', 'utf8'));
  const storyboard = validateStoryboard(fixture);
  assert.equal(msToFrame(storyboard.format.durationMs, storyboard.format.fps), 300);
  assert.deepEqual(storyboard.scenes.map(scene => scene.type), ['ScreenDemo', 'MetricTimeline', 'Callout']);
  assert.equal(storyboard.evidence[0]?.simulated, false);
  assert.equal(storyboard.evidence[0]?.uiSimulated, true);
  assert.equal(storyboard.narration.captions.length, 2);
});
