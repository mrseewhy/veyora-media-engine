import React from 'react';
import type {LatencyEvidence} from '../../packages/shared/src/storyboard';
import {theme} from '../theme';
import {formatSeconds, progress, springIn} from '../lib/animation';

interface ComparisonTracksProps {
  measurement: LatencyEvidence;
  uiPerceivedMs: number;
  frame: number;
  fps: number;
  startFrame: number;
  labels: {
    ui: string;
    api: string;
    gap: string;
  };
  compact?: boolean;
}

interface TrackRowProps {
  label: string;
  badge: string;
  badgeTone: 'lime' | 'coral';
  value: string;
  color: string;
  percent: number;
  progress: number;
  compact: boolean;
}

const TrackRow: React.FC<TrackRowProps> = ({
  label,
  badge,
  badgeTone,
  value,
  color,
  percent,
  progress: barProgress,
  compact,
}) => {
  const badgeColor = badgeTone === 'lime' ? theme.colors.lime : theme.colors.coral;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: compact ? '190px 1fr 92px' : '230px 1fr 120px',
        alignItems: 'center',
        gap: compact ? 14 : 20,
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: compact ? 10 : 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            color: theme.colors.text,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: compact ? 8 : 9,
            letterSpacing: 1,
            color: badgeColor,
            border: `1px solid ${badgeColor}44`,
            background: `${badgeColor}10`,
            borderRadius: 999,
            padding: '2px 6px',
            alignSelf: 'flex-start',
            whiteSpace: 'nowrap',
          }}
        >
          {badge}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: compact ? 26 : 34,
          borderRadius: 7,
          background: '#0C1822',
          border: `1px solid ${theme.colors.border}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${Math.max(1.4, percent * barProgress)}%`,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${color}CC, ${color})`,
            boxShadow: `0 0 18px ${color}44`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${percent}%`,
            top: -2,
            bottom: -2,
            width: 1,
            background: `${color}66`,
            opacity: barProgress,
          }}
        />
      </div>
      <div
        style={{
          textAlign: 'right',
          fontFamily: theme.fonts.mono,
          fontSize: compact ? 15 : 19,
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
    </div>
  );
};

export const ComparisonTracks: React.FC<ComparisonTracksProps> = ({
  measurement,
  uiPerceivedMs,
  frame,
  fps,
  startFrame,
  labels,
  compact = false,
}) => {
  const reveal = springIn(frame, fps, startFrame, {
    damping: 26,
    stiffness: 120,
    mass: 0.9,
  });
  const uiBar = progress(frame, startFrame + 2, 14);
  const apiBar = progress(frame, startFrame + 10, 28);
  const bracket = progress(frame, startFrame + 30, 16);
  const uiPct = (uiPerceivedMs / measurement.totalMs) * 100;
  const gapMs = measurement.totalMs - uiPerceivedMs;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 12 : 18,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 14}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: compact ? 10 : 11,
            fontWeight: 700,
            letterSpacing: 1.7,
            color: theme.colors.textMuted,
            textTransform: 'uppercase',
          }}
        >
          Perceived vs actual
        </span>
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: compact ? 8 : 9,
            letterSpacing: 1,
            color: theme.colors.textDim,
          }}
        >
          SAME TIME SCALE
        </span>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14}}>
        <TrackRow
          label={labels.ui}
          badge="SIMULATED"
          badgeTone="lime"
          value={`${formatSeconds(uiPerceivedMs)} s`}
          color={theme.colors.lime}
          percent={uiPct}
          progress={uiBar}
          compact={compact}
        />
        <TrackRow
          label={labels.api}
          badge="MEASURED"
          badgeTone="coral"
          value={`${formatSeconds(measurement.totalMs)} s`}
          color={theme.colors.coral}
          percent={100}
          progress={apiBar}
          compact={compact}
        />
      </div>

      <div
        style={{
          position: 'relative',
          height: compact ? 34 : 42,
          marginLeft: compact ? 204 : 250,
          marginRight: compact ? 106 : 140,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${uiPct}%`,
            right: 0,
            top: compact ? 15 : 19,
            height: 2,
            background: theme.colors.coral,
            opacity: 0.72 * bracket,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${uiPct}%`,
            top: compact ? 10 : 13,
            width: 2,
            height: compact ? 12 : 14,
            background: theme.colors.coral,
            opacity: bracket,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: compact ? 10 : 13,
            width: 2,
            height: compact ? 12 : 14,
            background: theme.colors.coral,
            opacity: bracket,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${(uiPct + 100) / 2}%`,
            top: 0,
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: bracket,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: compact ? 9 : 10,
              fontWeight: 700,
              letterSpacing: 1.3,
              color: theme.colors.coral,
              textTransform: 'uppercase',
            }}
          >
            {labels.gap}
          </span>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: compact ? 10 : 12,
              fontWeight: 700,
              color: theme.colors.text,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatSeconds(gapMs)} s
          </span>
        </div>
      </div>
    </div>
  );
};
