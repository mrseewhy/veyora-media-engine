import React from 'react';
import {theme} from '../theme';
import {formatCompact, formatMs, progress, springIn} from '../lib/animation';

interface MetricCardProps {
  label: string;
  valueMs: number;
  accent: string;
  frame: number;
  fps: number;
  startFrame: number;
  sublabel: string;
  compact?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  valueMs,
  accent,
  frame,
  fps,
  startFrame,
  sublabel,
  compact = false,
}) => {
  const reveal = springIn(frame, fps, startFrame, {
    damping: 25,
    stiffness: 130,
    mass: 0.8,
  });
  const count = progress(frame, startFrame + 4, 26);
  const displayMs = Math.round(valueMs * count);
  const compactValue = formatCompact(displayMs);

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: compact ? '18px 20px' : '24px 26px 22px',
        borderRadius: 18,
        background: '#101C27',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.panel,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 18}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: accent,
          boxShadow: `0 0 24px ${accent}66`,
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: compact ? 10 : 14,
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: compact ? 10 : 11,
            fontWeight: 600,
            letterSpacing: 1.6,
            color: theme.colors.textMuted,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: compact ? 8 : 9,
            fontWeight: 700,
            letterSpacing: 1,
            color: accent,
            border: `1px solid ${accent}55`,
            background: `${accent}12`,
            borderRadius: 999,
            padding: compact ? '3px 6px' : '4px 8px',
            whiteSpace: 'nowrap',
          }}
        >
          MEASURED
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.sans,
            fontSize: compact ? 48 : 68,
            fontWeight: 850,
            letterSpacing: -2.6,
            lineHeight: 0.92,
            color: theme.colors.text,
          }}
        >
          {compactValue.value}
        </span>
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: compact ? 16 : 20,
            fontWeight: 700,
            color: accent,
            letterSpacing: -0.4,
          }}
        >
          {compactValue.unit}
        </span>
      </div>
      <div
        style={{
          marginTop: compact ? 8 : 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          fontFamily: theme.fonts.mono,
          fontSize: compact ? 9 : 11,
          letterSpacing: 0.7,
          color: theme.colors.textDim,
        }}
      >
        <span>{sublabel}</span>
        <span style={{color: theme.colors.textMuted}}>{formatMs(displayMs)} ms</span>
      </div>
    </div>
  );
};
