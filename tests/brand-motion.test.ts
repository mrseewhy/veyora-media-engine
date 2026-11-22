import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {
  toolpilotBrandMotion,
  platformFor,
  ctaFor,
  bumperDurationMs,
} from '../remotion/agents/brand-motion.js';

test('brand motion config exposes the approved ToolPilot identity', () => {
  assert.equal(toolpilotBrandMotion.channelId, 'toolpilot');
  assert.equal(toolpilotBrandMotion.channelHandle, '@mytoolpilot');
  assert.equal(toolpilotBrandMotion.logoPath, 'toolpilot-icon.png');
  assert.equal(toolpilotBrandMotion.enabled, true);
});

test('brand asset exists at the expected public path', () => {
  assert.ok(existsSync(join('public', toolpilotBrandMotion.logoPath)), 'brand logo must exist');
});

test('intro and outro durations are within the approved ranges and fit the 100s budget', () => {
  assert.ok(bumperDurationMs('intro') >= 2000 && bumperDurationMs('intro') <= 3000);
  assert.ok(bumperDurationMs('outro') >= 3000 && bumperDurationMs('outro') <= 4000);
  const content = 100000 - bumperDurationMs('intro') - bumperDurationMs('outro');
  assert.ok(content > 0, 'content must remain after bumpers');
});

test('platform CTA selection returns the correct wording', () => {
  assert.equal(ctaFor('youtube').line1, 'Subscribe for more AI tools');
  assert.equal(ctaFor('youtube').line2, '@mytoolpilot');
  assert.equal(ctaFor('vertical').line1, 'Follow @mytoolpilot');
  assert.equal(ctaFor('square').line1, 'Follow @mytoolpilot');
});

test('platformFor selects youtube for landscape, vertical for portrait, square for 1:1', () => {
  assert.equal(platformFor(1920, 1080), 'youtube');
  assert.equal(platformFor(1080, 1920), 'vertical');
  assert.equal(platformFor(1080, 1080), 'square');
});

test('safe area placement is configured for on-screen text', () => {
  const {safeArea} = toolpilotBrandMotion;
  assert.ok(safeArea.left > 0 && safeArea.right > 0);
  assert.ok(safeArea.top > 0 && safeArea.bottom > 0);
});

test('fixture storyboard covers the full 100 seconds with bumper scenes', () => {
  const fixture = JSON.parse(readFileSync('fixtures/storyboards/toolpilot-agents-100s.json', 'utf8'));
  const intro = fixture.scenes.find((s: {type: string}) => s.type === 'BrandIntro');
  const outro = fixture.scenes.find((s: {type: string}) => s.type === 'BrandOutro');
  assert.ok(intro, 'BrandIntro scene must be declared');
  assert.ok(outro, 'BrandOutro scene must be declared');
  assert.equal(intro.startMs, 0);
  assert.equal(intro.durationMs, toolpilotBrandMotion.introDurationMs);
  assert.equal(outro.startMs, 100000 - toolpilotBrandMotion.outroDurationMs);
  assert.equal(outro.startMs + outro.durationMs, 100000);
});
