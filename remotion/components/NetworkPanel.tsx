import React from 'react';
import type {LatencyEvidence} from '../../packages/shared/src/storyboard';
import {theme} from '../theme';
import {formatMs, progress, springIn} from '../lib/animation';
import {Disclosure} from './Disclosure';

interface NetworkPanelProps {
  measurement: LatencyEvidence;
  frame: number;
  fps: number;
  revealFrame: number;
  compact?: boolean;
  style?: React.CSSProperties;
}

interface MetricRowProps {
  label: string;
  value: string;
  percent: number;
  color: string;
  compact: boolean;
  opacity: number;
}

const MetricRow: React.FC<MetricRowProps> = ({
  label,
  value,
  percent,
  color,
  compact,
  opacity,
}) => (
  <div style={{opacity}}>
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: compact ? 6 : 8,
      }}
    >
      <span
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: compact ? 10 : 12,
          letterSpacing: compact ? 1.2 : 1.5,
          color: theme.colors.textMuted,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: compact ? 15 : 19,
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
    <div
      style={{
        height: compact ? 4 : 5,
        borderRadius: 99,
        background: 'rgba(255,255,255,0.065)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.max(2, percent)}%`,
          height: '100%',
          borderRadius: 99,
          background: color,
          boxShadow: `0 0 12px ${color}55`,
        }}
      />
    </div>
  </div>
);

export const NetworkPanel: React.FC<NetworkPanelProps> = ({
  measurement,
  frame,
  fps,
  revealFrame,
  compact = false,
  style,
}) => {
  const panelIn = springIn(frame, fps, revealFrame, {
    damping: 26,
    stiffness: 120,
    mass: 0.9,
  });
  const valueIn = progress(frame, revealFrame + 6, compact ? 20 : 28);
  const ttft = measurement.ttftMs;
  const total = measurement.totalMs;
  const ttftPct = (ttft / total) * 100;
  const ttftDisplay = Math.round(ttft * valueIn);
  const totalDisplay = Math.round(total * valueIn);
  const playhead = valueIn * 100;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0A131C',
        borderLeft: `1px solid ${theme.colors.border}`,
        opacity: panelIn,
        transform: `translateX(${(1 - panelIn) * 46}px)`,
        ...style,
      }}
    >
      <div
        style={{
          height: compact ? 58 : 68,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 10 : 14,
          padding: compact ? '0 18px' : '0 24px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: '#0D1721',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M2 4h12M2 8h8M2 12h11"
              stroke={theme.colors.cyan}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: compact ? 11 : 13,
              fontWeight: 700,
              letterSpacing: 1.6,
              color: theme.colors.text,
            }}
          >
            NETWORK
          </span>
        </div>
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: compact ? 9 : 11,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: theme.colors.lime,
            background: 'rgba(182,248,74,0.08)',
            border: '1px solid rgba(182,248,74,0.28)',
            borderRadius: 5,
            padding: '3px 7px',
          }}
        >
          POST
        </span>
        {!compact ? (
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 13,
              color: theme.colors.textMuted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            /v1/chat/completions
          </span>
        ) : null}
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: theme.fonts.mono,
            fontSize: compact ? 9 : 11,
            fontWeight: 700,
            letterSpacing: 1,
            color: theme.colors.green,
            background: 'rgba(117,231,197,0.08)',
            border: '1px solid rgba(117,231,197,0.28)',
            borderRadius: 999,
            padding: '4px 9px',
            whiteSpace: 'nowrap',
          }}
        >
          200 OK
        </span>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: compact ? '18px 20px' : '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? 16 : 22,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: compact ? 10 : 11,
              letterSpacing: 1.5,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
            }}
          >
            Request timeline
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: theme.fonts.mono,
              fontSize: compact ? 9 : 10,
              letterSpacing: 1.1,
              color: theme.colors.lime,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: theme.colors.lime,
              }}
            />
            MEASURED
          </span>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: compact ? 14 : 18}}>
          <MetricRow
            label="Request sent"
            value="0 ms"
            percent={2}
            color={theme.colors.lime}
            compact={compact}
            opacity={0.7 + valueIn * 0.3}
          />
          <MetricRow
            label="First token"
            value={`${formatMs(ttftDisplay)} ms`}
            percent={ttftPct * valueIn}
            color={theme.colors.amber}
            compact={compact}
            opacity={0.55 + valueIn * 0.45}
          />
          <MetricRow
            label="Full response"
            value={`${formatMs(totalDisplay)} ms`}
            percent={100 * valueIn}
            color={theme.colors.coral}
            compact={compact}
            opacity={0.55 + valueIn * 0.45}
          />
        </div>

        <div style={{marginTop: compact ? 2 : 6}}>
          <div
            style={{
              position: 'relative',
              height: compact ? 44 : 58,
              borderRadius: 8,
              background: '#0D1A24',
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
                width: `${ttftPct * valueIn}%`,
                background: 'rgba(255, 176, 120, 0.16)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: `${ttftPct * valueIn}%`,
                right: 0,
                top: 0,
                bottom: 0,
                background:
                  'linear-gradient(90deg, rgba(255,176,120,0.28), rgba(255,125,113,0.2))',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: compact ? 15 : 20,
                right: 0,
                height: 2,
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            {[
              {left: 0, color: theme.colors.lime, size: compact ? 6 : 8},
              {
                left: `${ttftPct}%`,
                color: theme.colors.amber,
                size: compact ? 6 : 8,
              },
              {left: '100%', color: theme.colors.coral, size: compact ? 6 : 8},
            ].map((marker, index) => (
              <span
                key={index}
                style={{
                  position: 'absolute',
                  top: (compact ? 15 : 20) - (compact ? 3 : 4),
                  left: marker.left,
                  width: marker.size,
                  height: marker.size,
                  borderRadius: 99,
                  background: marker.color,
                  boxShadow: `0 0 10px ${marker.color}`,
                  transform: 'translateX(-50%)',
                  opacity: valueIn,
                }}
              />
            ))}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${playhead}%`,
                width: 2,
                background: theme.colors.text,
                opacity: 0.85,
                boxShadow: '0 0 10px rgba(255,255,255,0.35)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 10,
                bottom: 6,
                fontFamily: theme.fonts.mono,
                fontSize: compact ? 8 : 9,
                letterSpacing: 0.8,
                color: theme.colors.textDim,
              }}
            >
              0
            </div>
            <div
              style={{
                position: 'absolute',
                right: 10,
                bottom: 6,
                fontFamily: theme.fonts.mono,
                fontSize: compact ? 8 : 9,
                letterSpacing: 0.8,
                color: theme.colors.textDim,
              }}
            >
              {formatMs(total)} ms
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 7,
              fontFamily: theme.fonts.mono,
              fontSize: compact ? 8 : 10,
              letterSpacing: 0.7,
              color: theme.colors.textDim,
            }}
          >
            <span>REQUEST</span>
            <span style={{marginLeft: 'auto', marginRight: 'auto'}}>
              FIRST TOKEN {formatMs(ttft)} ms
            </span>
            <span>COMPLETE</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: compact ? 7 : 9,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              fontFamily: theme.fonts.mono,
              fontSize: compact ? 9 : 10,
              letterSpacing: 1.1,
              color: theme.colors.textDim,
              textTransform: 'uppercase',
            }}
          >
            <span>Stream chunks</span>
            <span>19 chunks · 90 ms cadence</span>
          </div>
          <div
            style={{
              position: 'relative',
              height: compact ? 42 : 50,
              borderRadius: 7,
              background: '#0D1A24',
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
                width: `${ttftPct * valueIn}%`,
                background: 'rgba(255,176,120,0.07)',
              }}
            />
            {Array.from({length: 19}, (_, index) => {
              const position = ttftPct + ((100 - ttftPct) * index) / 18;
              return (
                <span
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${position}%`,
                    top: compact ? 11 : 13,
                    bottom: compact ? 11 : 13,
                    width: 2,
                    borderRadius: 1,
                    background:
                      index === 0
                        ? theme.colors.amber
                        : index === 18
                          ? theme.colors.coral
                          : 'rgba(131,213,255,0.42)',
                    transform: 'translateX(-50%)',
                    opacity: valueIn,
                  }}
                />
              );
            })}
            <span
              style={{
                position: 'absolute',
                left: 8,
                bottom: compact ? 3 : 4,
                fontFamily: theme.fonts.mono,
                fontSize: compact ? 7 : 8,
                letterSpacing: 0.7,
                color: theme.colors.textDim,
              }}
            >
              FIRST {formatMs(ttft)} MS
            </span>
            <span
              style={{
                position: 'absolute',
                right: 8,
                bottom: compact ? 3 : 4,
                fontFamily: theme.fonts.mono,
                fontSize: compact ? 7 : 8,
                letterSpacing: 0.7,
                color: theme.colors.textDim,
              }}
            >
              DONE {formatMs(total)} MS
            </span>
          </div>
        </div>

        <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: compact ? 9 : 10,
                letterSpacing: 1.1,
                color: theme.colors.textDim,
              }}
            >
              trace_8f3a · local demo API
            </span>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: compact ? 8 : 9,
                letterSpacing: 0.8,
                color: theme.colors.textDim,
              }}
            >
              MEDIAN OF {measurement.runs} RUNS
            </span>
          </div>
          <Disclosure
            text="UI simulated · timing measured"
            tone="muted"
            style={{
              fontSize: compact ? 9 : 10,
              padding: compact ? '5px 8px' : '6px 10px',
              letterSpacing: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
};
