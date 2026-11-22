import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {
  buildSrt,
  framesToMs,
  getStoryboardErrors,
  msToFrame,
  validateStoryboard,
} from '../packages/shared/src/storyboard.js';

const fixture = JSON.parse(
  readFileSync('fixtures/storyboards/toolpilot-latency-10s.json', 'utf8'),
) as Record<string, any>;

const clone = () => structuredClone(fixture);

test('latency storyboard satisfies the strict contract', () => {
  const storyboard = validateStoryboard(clone());
  assert.equal(storyboard.format.durationMs, 10_000);
  assert.equal(storyboard.scenes.length, 3);
  assert.deepEqual(
    storyboard.scenes.map((scene) => scene.type),
    ['ScreenDemo', 'MetricTimeline', 'Callout'],
  );
  assert.equal(storyboard.evidence[0].runs, 5);
  assert.equal(storyboard.evidence[0].simulated, false);
  assert.equal(storyboard.evidence[0].uiSimulated, true);
});

test('timeline gaps are rejected', () => {
  const invalid = clone();
  invalid.scenes[1].startMs = 3800;
  assert.match(getStoryboardErrors(invalid).join('\n'), /gap or overlap/);
});

test('caption text must cover the narration exactly', () => {
  const invalid = clone();
  invalid.narration.captions[0].text = 'A slick AI demo.';
  assert.match(
    getStoryboardErrors(invalid).join('\n'),
    /caption text must cover the narration exactly/,
  );
});

test('a scene cannot escape its beat', () => {
  const invalid = clone();
  invalid.scenes[0].beatId = 'proof';
  assert.match(getStoryboardErrors(invalid).join('\n'), /must sit inside its beat/);
});

test('a scene must reference declared measurement evidence', () => {
  const invalid = clone();
  invalid.scenes[0].visual.measurementId = 'missing-trace';
  assert.match(
    getStoryboardErrors(invalid).join('\n'),
    /must reference declared evidence/,
  );
});

test('simulated evidence must disclose that it is simulated', () => {
  const invalid = clone();
  invalid.evidence[0].simulated = true;
  invalid.evidence[0].disclosure = 'Timing is real.';
  assert.match(
    getStoryboardErrors(invalid).join('\n'),
    /disclosure must say "simulated"/,
  );
});

test('emphasis phrases must occur in their caption', () => {
  const invalid = clone();
  invalid.narration.captions[0].emphasis = ['first paint'];
  assert.match(
    getStoryboardErrors(invalid).join('\n'),
    /emphasis phrase "first paint" does not occur/,
  );
});

test('SRT preserves measured cue timing and text', () => {
  const storyboard = validateStoryboard(clone());
  const srt = buildSrt(storyboard);
  assert.match(srt, /1\n00:00:00,260 --> 00:00:03,610/);
  assert.match(srt, /2\n00:00:03,730 --> 00:00:06,370/);
  assert.match(srt, /Measure the API call, not just the animation\./);
  assert.equal(srt.trim().split(/\n\n/).length, 2);
});

test('millisecond/frame conversion is explicit and lossless at boundaries', () => {
  assert.equal(msToFrame(0, 30), 0);
  assert.equal(msToFrame(3720, 30), 112);
  assert.equal(msToFrame(10_000, 30), 300);
  assert.equal(framesToMs(112, 30), 3733);
  assert.equal(framesToMs(300, 30), 10_000);
});
