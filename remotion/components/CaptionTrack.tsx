import React from 'react';
import {msToFrame, type CaptionCue} from '../../packages/shared/src/storyboard';
import {theme, videoLayout} from '../theme';
import {clamp01, highlightParts, progress} from '../lib/animation';

interface CaptionTrackProps {
  captions: CaptionCue[];
  frame: number;
  fps: number;
}

export const CaptionTrack: React.FC<CaptionTrackProps> = ({captions, frame, fps}) => {
  const frameMs = (frame / fps) * 1000;
  const active = captions.find((cue) => frameMs >= cue.startMs && frameMs < cue.endMs);
  if (!active) return null;

  const startFrame = msToFrame(active.startMs, fps);
  const endFrame = msToFrame(active.endMs, fps);
  const fadeIn = progress(frame, startFrame, 7);
  const fadeOut = clamp01((endFrame - frame) / 7);
  const opacity = Math.min(fadeIn, fadeOut);
  const y = (1 - fadeIn) * 14;
  const parts = highlightParts(active.text, active.emphasis ?? []);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: videoLayout.safeArea.bottom,
        display: 'flex',
        justifyContent: 'center',
        padding: `0 ${videoLayout.safeArea.left}px`,
        zIndex: 30,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          maxWidth: videoLayout.width - videoLayout.safeArea.left - videoLayout.safeArea.right,
          padding: '17px 28px 17px 22px',
          borderRadius: 14,
          background: 'rgba(4, 9, 14, 0.9)',
          border: '1px solid rgba(182, 248, 74, 0.24)',
          boxShadow: '0 18px 50px rgba(0, 0, 0, 0.45)',
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        <span
          style={{
            width: 4,
            alignSelf: 'stretch',
            minHeight: 38,
            borderRadius: 99,
            background: theme.colors.lime,
            boxShadow: '0 0 14px rgba(182,248,74,0.5)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: theme.fonts.sans,
            fontSize: 36,
            fontWeight: 650,
            lineHeight: 1.24,
            letterSpacing: -0.55,
            color: theme.colors.text,
            textAlign: 'left',
          }}
        >
          {parts.map((part, index) =>
            part.emphasis ? (
              <span
                key={index}
                style={{
                  color: theme.colors.lime,
                  fontWeight: 800,
                }}
              >
                {part.text}
              </span>
            ) : (
              <React.Fragment key={index}>{part.text}</React.Fragment>
            ),
          )}
        </span>
      </div>
    </div>
  );
};
