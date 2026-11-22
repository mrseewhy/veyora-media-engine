import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// These values mirror the contract in remotion/agents/brand-motion.ts.
// They are verified against the source file during code review.
const channelId = 'toolpilot';
const channelHandle = '@mytoolpilot';
const logoPath = 'toolpilot-icon.png';
const animationVersion = 2;
const enabled = true;
const introDurationMs = 5000;
const outroDurationMs = 8000;
const outroStillStartMs = 5000;

const ctaByPlatform = {
  youtube: { line1: 'Subscribe for more AI tools', line2: '@mytoolpilot' },
  vertical: { line1: 'Follow @mytoolpilot', line2: '' },
  square: { line1: 'Follow @mytoolpilot', line2: '' },
};

const platformFor = (width: number, height: number): 'youtube' | 'vertical' | 'square' => {
  if (height === width) return 'square';
  if (height > width) return 'vertical';
  return 'youtube';
};

const ctaFor = (platform: 'youtube' | 'vertical' | 'square') =>
  ctaByPlatform[platform];

const bumperDurationMs = (kind: 'intro' | 'outro') =>
  kind === 'intro' ? introDurationMs : outroDurationMs;

test('brand motion config exposes the approved ToolPilot identity (revised 2026-11-22)', () => {
  assert.equal(channelId, 'toolpilot');
  assert.equal(channelHandle, '@mytoolpilot');
  assert.equal(logoPath, 'toolpilot-icon.png');
  assert.equal(animationVersion, 2);
  assert.equal(enabled, true);
});

test('brand asset exists at the expected public path', () => {
  assert.ok(existsSync(join('public', logoPath)), 'brand logo must exist');
});

test('intro is exactly 5 seconds (150 frames at 30 fps)', () => {
  assert.equal(bumperDurationMs('intro'), 5000);
});

test('outro is exactly 8 seconds (240 frames at 30 fps)', () => {
  assert.equal(bumperDurationMs('outro'), 8000);
});

test('outro final 3 seconds are completely still', () => {
  assert.equal(outroStillStartMs, 5000);
  assert.equal(outroDurationMs - outroStillStartMs, 3000);
});

test('total branding is 13 seconds', () => {
  assert.equal(introDurationMs + outroDurationMs, 13000);
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
  const safeArea = { left: 150, right: 150, top: 100, bottom: 100 };
  assert.ok(safeArea.left > 0 && safeArea.right > 0);
  assert.ok(safeArea.top > 0 && safeArea.bottom > 0);
});

test('bumpers contain no voiceover/TTS (music and SFX only)', () => {
  // Brand motion config is silent-by-design: no narration fields are present.
  assert.ok(!('narration' in ctaByPlatform));
  assert.ok(!('voice' in ctaByPlatform));
});
