import React from 'react';
import {useCurrentFrame} from 'remotion';
import {
  type BrandOutroScene as BrandOutroSceneType,
  type Storyboard,
} from '../../packages/shared/src/storyboard';
import {theme} from '../theme';
import {progress, springIn} from '../lib/animation';
import {BrandMark} from '../components/BrandMark';

interface BrandOutroSceneProps {
  scene: BrandOutroSceneType;
  storyboard: Storyboard;
  durationInFrames: number;
  fps: number;
}

export const BrandOutroScene: React.FC<BrandOutroSceneProps> = ({
  scene,
  storyboard,
  durationInFrames,
  fps,
}) => {
  const frame = useCurrentFrame();
  const brandIn = springIn(frame, fps, 0, {
    damping: 24,
    stiffness: 110,
    mass: 0.8,
  });
  const line = progress(frame, 8, 20);
  const tagline = progress(frame, 14, 14);
  const fadeOut = progress(frame, durationInFrames - 12, 12);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        opacity: 1 - fadeOut * 0.5,
      }}
    >
      <div style={{opacity: brandIn, transform: `translateY(${(1 - brandIn) * 16}px)`}}>
        <BrandMark size={44} subtitle />
      </div>
      <div
        style={{
          width: `${line * 260}px`,
          height: 3,
          background: theme.colors.lime,
          boxShadow: '0 0 20px rgba(182,248,74,0.5)',
        }}
      />
      <div
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: 72,
          fontWeight: 850,
          letterSpacing: -2,
          color: theme.colors.text,
          opacity: tagline,
          transform: `translateY(${(1 - tagline) * 14}px)`,
        }}
      >
        {scene.visual.headline}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.sans,
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: 0.2,
          color: theme.colors.textMuted,
          opacity: tagline,
        }}
      >
        {scene.visual.tagline || storyboard.brand.tagline}
      </div>
    </div>
  );
};
