import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {staticFile} from 'remotion';
import {ctaFor, toolpilotBrandMotion} from './brand-motion';
import {theme} from '../theme';

const ink = '#101820';
const lime = theme.colors.lime;
const logoSrc = staticFile(toolpilotBrandMotion.logoPath);

type Platform = 'youtube' | 'vertical' | 'square';

interface BrandBumperProps {
  kind: 'intro' | 'outro';
  platform: Platform;
  startFrame: number;
  totalFrames: number;
}

/** Expanding signal-wave ring behind the logo. */
const SignalWave: React.FC<{frame: number; delay: number; color: string}>=({
  frame,
  delay,
  color,
}) => {
  const f = Math.max(0, frame - delay);
  const t = interpolate(f, [0, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const size = interpolate(t, [0, 1], [0, 560]);
  const opacity = interpolate(t, [0, 1], [0.5, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        marginTop: -size / 2,
        marginLeft: -size / 2,
        border: `2px solid ${color}`,
        borderRadius: '50%',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

const logoSize = (localFrame: number) => {
  const pop = spring({
    frame: Math.max(0, localFrame),
    fps: 30,
    config: {damping: 18, stiffness: 220},
  });
  return interpolate(pop, [0, 1], [0.5, 1]);
};

const Logo: React.FC<{localFrame: number}> = ({localFrame}) => {
  const scale = logoSize(localFrame);
  const opacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const size = 240 * scale;
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        marginTop: -size / 2,
        marginLeft: -size / 2,
        opacity,
        background: 'rgba(255,255,255,0.10)',
        borderRadius: '50%',
        boxShadow: `0 0 40px rgba(182,248,74,0.15)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={logoSrc} style={{width: '72%', height: '72%', display: 'block'}} />
    </div>
  );
};

export const BrandBumper: React.FC<BrandBumperProps> = ({
  kind,
  platform,
  startFrame,
  totalFrames,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const f = frame - startFrame;
  const isPortrait = height > width;

  const cta = ctaFor(platform);

  const bg = (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: ink,
        color: '#fff',
        fontFamily: theme.fonts.sans,
        overflow: 'hidden',
      }}
    />
  );

  const waves = (
    <>
      <SignalWave frame={f} delay={2} color={lime} />
      <SignalWave frame={f} delay={8} color='rgba(182,248,74,0.45)' />
      <SignalWave frame={f} delay={14} color='rgba(182,248,74,0.25)' />
    </>
  );

  if (kind === 'intro') {
    // Reveal the mark over ~1s, then the wordmark.
    const markOpacity = interpolate(f, [0, 20], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const wordmarkOpacity = interpolate(f, [30, 50], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const wordmarkY = interpolate(f, [30, 50], [14, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return (
      <>
        {bg}
        {waves}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            opacity: markOpacity,
            pointerEvents: 'none',
          }}
        >
          <Logo localFrame={f} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            marginTop: 170,
            textAlign: 'center',
            opacity: wordmarkOpacity,
            transform: `translateY(${wordmarkY}px)`,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: -2,
              color: '#fff',
              fontFamily: theme.fonts.sans,
            }}
          >
            TOOLPILOT
          </span>
          <div
            style={{
              marginTop: 14,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              color: lime,
              fontFamily: theme.fonts.mono,
            }}
          >
            AI TOOLS IN 100 SECONDS
          </div>
        </div>
      </>
    );
  }

  // Outro: mark + wordmark + platform-aware call to action.
  const ctaOpacity = interpolate(f, [15, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ctaY = interpolate(f, [15, 35], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <>
      {bg}
      {waves}
      <Logo localFrame={f} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          marginTop: 180,
          textAlign: 'center',
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: -2,
            color: '#fff',
            fontFamily: theme.fonts.sans,
          }}
        >
          TOOLPILOT
        </span>
        <div
          style={{
            marginTop: 16,
            fontSize: isPortrait ? 28 : 34,
            fontWeight: 800,
            letterSpacing: 2,
            color: '#fff',
            fontFamily: theme.fonts.sans,
          }}
        >
          {cta.line1}
        </div>
        {cta.line2 && (
          <div
            style={{
              marginTop: 8,
              fontSize: isPortrait ? 24 : 28,
              fontWeight: 700,
              letterSpacing: 1,
              color: lime,
              fontFamily: theme.fonts.mono,
            }}
          >
            {cta.line2}
          </div>
        )}
      </div>
    </>
  );
};
