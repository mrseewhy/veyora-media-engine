import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {BrandConfig} from '../../packages/shared/src/storyboard';
import {theme} from '../theme';
import {BrandMark} from './BrandMark';

interface StageProps {
  frame: number;
  durationInFrames: number;
  sceneIndex: number;
  sceneCount: number;
  brand: BrandConfig;
  children?: React.ReactNode;
}

export const Stage: React.FC<StageProps> = ({
  frame,
  durationInFrames,
  sceneIndex,
  sceneCount,
  brand,
  children,
}) => {
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames - 1)));
  return (
    <AbsoluteFill style={{backgroundColor: theme.colors.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${theme.colors.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.colors.grid} 1px, transparent 1px)`,
          backgroundSize: '96px 96px',
          maskImage:
            'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0.95) 18%, rgba(0,0,0,0.42) 58%, transparent 84%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0.95) 18%, rgba(0,0,0,0.42) 58%, transparent 84%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 42%, rgba(12, 26, 38, 0.08) 0%, rgba(4, 9, 14, 0.42) 62%, rgba(3, 7, 11, 0.78) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'rgba(255,255,255,0.07)',
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: theme.colors.lime,
            boxShadow: '0 0 18px rgba(182,248,74,0.55)',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 42,
          left: 64,
          right: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 15,
        }}
      >
        <BrandMark size={25} subtitle />
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontFamily: theme.fonts.mono,
              fontSize: 13,
              letterSpacing: 2.1,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: theme.colors.lime,
                boxShadow: '0 0 12px rgba(182,248,74,0.8)',
              }}
            />
            LATENCY / 10 SEC
          </div>
          <div
            style={{
              width: 1,
              height: 22,
              background: theme.colors.border,
            }}
          />
          <div
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 13,
              letterSpacing: 1.8,
              color: theme.colors.textDim,
              textTransform: 'uppercase',
            }}
          >
            {String(sceneIndex + 1).padStart(2, '0')} / {String(sceneCount).padStart(2, '0')}
          </div>
          <div
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 12,
              letterSpacing: 1.6,
              color: theme.colors.textDim,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 999,
              padding: '5px 10px',
              textTransform: 'uppercase',
            }}
          >
            {brand.name} LAB
          </div>
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, zIndex: 1}}>{children}</div>
    </AbsoluteFill>
  );
};
