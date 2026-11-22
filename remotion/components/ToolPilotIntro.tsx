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
import { toolpilotBrandMotion } from '../agents/brand-motion';
import { theme } from '../theme';

const INTRO_FRAMES = 150; // 5 seconds at 30 fps
const LOGO_SIZE = 420;
const TEXT_SIZE = 72;

/**
 * ToolPilot reusable intro — exactly 5 seconds.
 * Animated logo reveal with the official toolpilot-icon.png and ToolPilot text.
 * Instrumental tune only; no voiceover, no spoken words, no TTS.
 *
 * Versioned (animationVersion: 2). Not regenerated per episode.
 */
export const ToolPilotIntro: React.FC<{ platform?: 'youtube' | 'vertical' | 'square' }> = ({
  platform,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Logo scale: spring in from 0, settle, slight pulse, fade out at end
  const logoScale = spring({ frame, fps: 30, config: { damping: 18, stiffness: 200 } });
  const logoOpacity = interpolate(frame, [0, 15, 135, 150], [0, 1, 1, 0]);

  // Text appears after logo starts settling
  const textStart = 45; // 1.5s
  const textOpacity = interpolate(frame, [textStart, textStart + 12, 135, 150], [0, 1, 1, 0]);
  const textSlide = interpolate(frame, [textStart, textStart + 12], [20, 0]);

  const centerX = width / 2;
  const centerY = height / 2 - 60;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.bg }}>
      <Audio src={staticFile('generated/toolpilot-intro-tune.wav')} volume={0.7} />
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
            top: centerY + LOGO_SIZE / 2 + 30,
            opacity: textOpacity,
            transform: `translateY(${textSlide}px)`,
            transition: 'none',
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
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const INTRO_DURATION_FRAMES = INTRO_FRAMES;
