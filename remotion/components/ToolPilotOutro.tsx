import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { toolpilotBrandMotion, ctaFor, platformFor } from '../agents/brand-motion';
import { theme } from '../theme';

const OUTRO_FRAMES = 240; // 8 seconds at 30 fps
const OUTRO_STILL_START_FRAME = 150; // final 3 seconds (90 frames) are static
const LOGO_SIZE = 360;
const TEXT_SIZE = 64;
const CTA_SIZE = 40;

/**
 * ToolPilot reusable outro — exactly 8 seconds.
 * First 5 seconds: animated logo, ToolPilot text, and platform CTA.
 * Final 3 seconds: completely still end card (no motion, fades, or animations).
 * Instrumental tune only; no voiceover.
 *
 * Versioned (animationVersion: 2). Not regenerated per episode.
 */
export const ToolPilotOutro: React.FC<{
  width: number;
  height: number;
}> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const platform = platformFor(width, height);
  const cta = ctaFor(platform);

  // During the final 3 seconds (frame >= 150), everything is completely static.
  // All interpolations clamp at their final values so nothing moves.
  const clampedFrame = Math.min(frame, OUTRO_STILL_START_FRAME - 1);

  // Logo: spring in from 0, settle at full scale
  const logoScale = spring({ frame: clampedFrame, fps: 30, config: { damping: 18, stiffness: 200 } });
  const logoOpacity = interpolate(clampedFrame, [0, 15, 45, OUTRO_STILL_START_FRAME - 1], [
    0,
    1,
    1,
    1,
  ]);

  // Text: appears after logo starts settling
  const textStart = 45;
  const textOpacity = interpolate(clampedFrame, [textStart, textStart + 12, OUTRO_STILL_START_FRAME - 1], [
    0,
    1,
    1,
  ]);
  const textSlide = interpolate(clampedFrame, [textStart, textStart + 12], [20, 0]);

  // CTA: appears after text
  const ctaStart = 90;
  const ctaOpacity = interpolate(clampedFrame, [ctaStart, ctaStart + 15, OUTRO_STILL_START_FRAME - 1], [
    0,
    1,
    1,
  ]);
  const ctaSlide = interpolate(clampedFrame, [ctaStart, ctaStart + 15], [20, 0]);

  const centerY = height / 2 - 40;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <Audio src={staticFile('generated/toolpilot-outro-tune.wav')} volume={0.7} />
      <AbsoluteFill
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Official ToolPilot icon */}
        <img
          src={staticFile(toolpilotBrandMotion.logoPath)}
          alt="ToolPilot"
          style={{
            width: LOGO_SIZE * logoScale,
            height: LOGO_SIZE * logoScale,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            transformOrigin: 'center',
            filter: logoOpacity > 0 ? 'drop-shadow(0 24px 60px rgba(0,0,0,0.6))' : 'none',
            pointerEvents: 'none',
          }}
        />
        {/* ToolPilot name */}
        <div
          style={{
            position: 'absolute',
            top: centerY + LOGO_SIZE / 2 + 24,
            opacity: textOpacity,
            transform: `translateY(${textSlide}px)`,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.sans,
              fontSize: TEXT_SIZE,
              fontWeight: 900,
              letterSpacing: -2,
              color: theme.colors.text,
              whiteSpace: 'nowrap',
            }}
          >
            ToolPilot
          </span>
        </div>
        {/* CTA card */}
        <div
          style={{
            position: 'absolute',
            top: centerY + LOGO_SIZE / 2 + 96,
            opacity: ctaOpacity,
            transform: `translateY(${ctaSlide}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.sans,
              fontSize: CTA_SIZE,
              fontWeight: 700,
              letterSpacing: -0.5,
              color: theme.colors.lime,
              textAlign: 'center',
            }}
          >
            {cta.line1}
          </span>
          {cta.line2 ? (
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: Math.max(20, CTA_SIZE * 0.6),
                fontWeight: 600,
                letterSpacing: 1,
                color: theme.colors.textMuted,
                textAlign: 'center',
              }}
            >
              {cta.line2}
            </span>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const OUTRO_DURATION_FRAMES = OUTRO_FRAMES;
