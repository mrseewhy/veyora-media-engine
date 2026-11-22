/**
 * ToolPilot brand-motion configuration (single source of truth).
 *
 * Centralises the reusable intro/outro bumper contract so every episode and
 * platform reuses the same approved motion instead of regenerating artwork.
 */
import {videoLayout} from '../theme.js';

export interface PlatformCta {
  line1: string;
  line2: string;
}

export interface BrandMotionConfig {
  channelId: string;
  channelHandle: string;
  logoPath: string;
  animationVersion: number;
  enabled: boolean;
  /** Intro bumper duration in milliseconds (target 2-3s). */
  introDurationMs: number;
  /** Outro bumper duration in milliseconds (target 3-4s). */
  outroDurationMs: number;
  /** Per-platform call to action. */
  ctaByPlatform: Record<'youtube' | 'vertical' | 'square', PlatformCta>;
  safeArea: {left: number; right: number; top: number; bottom: number};
}

export const toolpilotBrandMotion: BrandMotionConfig = {
  channelId: 'toolpilot',
  channelHandle: '@mytoolpilot',
  logoPath: 'toolpilot-icon.png',
  animationVersion: 1,
  enabled: true,
  introDurationMs: 3000,
  outroDurationMs: 4000,
  ctaByPlatform: {
    youtube: {line1: 'Subscribe for more AI tools', line2: '@mytoolpilot'},
    vertical: {line1: 'Follow @mytoolpilot', line2: ''},
    square: {line1: 'Follow @mytoolpilot', line2: ''},
  },
  safeArea: videoLayout.safeArea,
} as const;

export const platformFor = (width: number, height: number): 'youtube' | 'vertical' | 'square' => {
  if (height === width) return 'square';
  if (height > width) return 'vertical';
  return 'youtube';
};

export const ctaFor = (platform: 'youtube' | 'vertical' | 'square'): PlatformCta =>
  toolpilotBrandMotion.ctaByPlatform[platform];

export const bumperDurationMs = (kind: 'intro' | 'outro'): number =>
  kind === 'intro' ? toolpilotBrandMotion.introDurationMs : toolpilotBrandMotion.outroDurationMs;

export const contentDurationMs = (): number =>
  toolpilotBrandMotion.introDurationMs +
  toolpilotBrandMotion.outroDurationMs;
