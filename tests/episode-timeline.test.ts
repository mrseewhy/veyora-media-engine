import test from 'node:test';
import assert from 'node:assert/strict';
import {buildEpisodeTimeline, contentFrameToEpisodeFrame} from '../packages/shared/src/episode-timeline.js';

test('thesis-first opening preserves narration order and total length', () => {
  const slices = buildEpisodeTimeline([528, 561], 150, 240, {mode: 'thesis-first', coldOpenFrames: 264});
  assert.deepEqual(slices.map(s => [s.kind, s.from, s.duration, s.segmentIndex, s.segmentOffset]), [
    ['content', 0, 264, 0, 0], ['intro', 264, 150, undefined, undefined],
    ['content', 414, 264, 0, 264], ['content', 678, 561, 1, 0],
    ['outro', 1239, 240, undefined, undefined],
  ]);
  assert.equal(contentFrameToEpisodeFrame(0, slices), 0);
  assert.equal(contentFrameToEpisodeFrame(263, slices), 263);
  assert.equal(contentFrameToEpisodeFrame(264, slices), 414);
  assert.equal(contentFrameToEpisodeFrame(528, slices), 678);
  assert.equal(slices.at(-1)!.from + slices.at(-1)!.duration, 1479);
});

test('intro-first remains available for channel-specific choices', () => {
  const slices = buildEpisodeTimeline([300], 150, 240, {mode: 'intro-first'});
  assert.deepEqual(slices.map(s => [s.kind, s.from]), [['intro', 0], ['content', 150], ['outro', 450]]);
  assert.equal(contentFrameToEpisodeFrame(0, slices), 150);
});

test('rejects a cold open extending past the first segment', () => {
  assert.throws(() => buildEpisodeTimeline([300], 150, 240, {mode: 'thesis-first', coldOpenFrames: 300}));
});
