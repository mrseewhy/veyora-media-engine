/**
 * ToolPilot brand-motion configuration (single source of truth).
 *
 * Centralises the reusable intro/outro bumper contract so every episode and
 * platform reuses the same approved motion instead of regenerating artwork.
 *
 * Revised 2026-11-22:
 *  - Intro: exactly 5000 ms (150 frames at 30 fps)
 *  - Outro: exactly 8000 ms (240 frames at 30 fps)
 *    - First 5000 ms animated, final 3000 ms completely still
 *  - Total branding: 13 seconds
 *  - Content: 100-120 seconds (narration only, no voiceover on bumpers)
 */
import { videoLayout } from '../theme';

export const toolpilotBrandMotion = {
  channelId: 'toolpilot',
  channelHandle: '@mytoolpilot',
  logoPath: 'toolpilot-icon.png',
  animationVersion: 2,
  enabled: true,
  introDurationMs: 5000,
  outroDurationMs: 8000,
  outroStillStartMs: 5000, // final 3 seconds are completely static
  ctaByPlatform: {
    youtube: { line1: 'Subscribe for more AI tools', line2: '@mytoolpilot' },
    vertical: { line1: 'Follow @mytoolpilot', line2: '' },
    square: { line1: 'Follow @mytoolpilot', line2: '' },
  },
  safeArea: videoLayout.safeArea,
} as const;

export const platformFor = (width: number, height: number): 'youtube' | 'vertical' | 'square' => {
  if (height === width) return 'square';
  if (height > width) return 'vertical';
  return 'youtube';
};

export const ctaFor = (platform: 'youtube' | 'vertical' | 'square') =>
  toolpilotBrandMotion.ctaByPlatform[platform];

export const bumperDurationMs = (kind: 'intro' | 'outro') =>
  kind === 'intro'
    ? toolpilotBrandMotion.introDurationMs
    : toolpilotBrandMotion.outroDurationMs;

export const contentDurationMs = () =>
  toolpilotBrandMotion.introDurationMs + toolpilotBrandMotion.outroDurationMs;
