import React from 'react';
import type {LatencyEvidence} from '../../packages/shared/src/storyboard';
import {theme} from '../theme';
import {formatMs, progress, springIn} from '../lib/animation';

interface LatencyTimelineProps {
  measurement: LatencyEvidence;
  frame: number;
  fps: number;
  startFrame: number;
  labels: {
    request: string;
    firstToken: string;
    complete: string;
  };
}

export const LatencyTimeline: React.FC<LatencyTimelineProps> = ({
  measurement,
  frame,
  fps,
  startFrame,
  labels,
}) => {
  const reveal = springIn(frame, fps, startFrame, {
    damping: 28,
    stiffness: 120,
    mass: 0.9,
  });
  const draw = progress(frame, startFrame + 6, 44);
  const sweep = draw;
  const ttftPct = (measurement.ttftMs / measurement.totalMs) * 100;

  const ticks = [0, 1000, 2000, measurement.totalMs]
    .filter((value, index, array) => value <= measurement.totalMs && array.indexOf(value) === index)
    .sort((a, b) => a - b);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 12}px)`,
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
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.7,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
            }}
          >
            Request timeline
          </span>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 10,
              letterSpacing: 0.8,
              color: theme.colors.textDim,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 999,
              padding: '4px 8px',
            }}
          >
            trace_8f3a
          </span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: theme.colors.lime,
              boxShadow: '0 0 10px rgba(182,248,74,0.8)',
            }}
          />
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: theme.colors.lime,
            }}
          >
            MEASURED · MEDIAN OF {measurement.runs}
          </span>
        </div>
      </div>

      <div style={{position: 'relative', paddingTop: 34, paddingBottom: 34}}>
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 0,
            width: `${ttftPct}%`,
            display: 'flex',
            justifyContent: 'flex-end',
            paddingRight: 8,
            opacity: 0.45 + draw * 0.55,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 10,
              letterSpacing: 1.1,
              color: theme.colors.textDim,
            }}
          >
            {labels.firstToken}
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 0,
            opacity: 0.45 + draw * 0.55,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 10,
              letterSpacing: 1.1,
              color: theme.colors.textDim,
            }}
          >
            {labels.complete}
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 0,
            opacity: 0.45 + draw * 0.55,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 10,
              letterSpacing: 1.1,
              color: theme.colors.textDim,
            }}
          >
            {labels.request}
          </span>
        </div>

        <div
          style={{
            position: 'relative',
            height: 76,
            borderRadius: 12,
            background: '#0C1822',
            border: `1px solid ${theme.colors.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
            }}
          >
            {ticks.map((tick) => (
              <div
                key={tick}
                style={{
                  position: 'absolute',
                  left: `${(tick / measurement.totalMs) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: 'rgba(255,255,255,0.055)',
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: 2,
              marginTop: -1,
              background: 'rgba(255,255,255,0.12)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${ttftPct}%`,
                background: 'rgba(255, 176, 120, 0.13)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: `${ttftPct}%`,
                right: 0,
                top: 0,
                bottom: 0,
                background:
                  'linear-gradient(90deg, rgba(255,176,120,0.34), rgba(255,125,113,0.26))',
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: theme.fonts.mono,
                fontSize: 11,
                letterSpacing: 1.2,
                color: 'rgba(255,255,255,0.48)',
                textTransform: 'uppercase',
              }}
            >
              request
            </div>
            <div
              style={{
                position: 'absolute',
                left: `${ttftPct + (100 - ttftPct) / 2}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: theme.fonts.mono,
                fontSize: 11,
                letterSpacing: 1.2,
                color: 'rgba(255,255,255,0.62)',
                textTransform: 'uppercase',
              }}
            >
              streaming response
            </div>

            {[
              {left: 0, color: theme.colors.lime, label: labels.request},
              {left: ttftPct, color: theme.colors.amber, label: labels.firstToken},
              {left: 100, color: theme.colors.coral, label: labels.complete},
            ].map((marker) => (
              <div
                key={marker.label}
                style={{
                  position: 'absolute',
                  left: `${marker.left}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: marker.color,
                  transform: 'translateX(-50%)',
                  boxShadow: `0 0 14px ${marker.color}88`,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    background: marker.color,
                    boxShadow: `0 0 14px ${marker.color}`,
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              left: `${sweep * 100}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: theme.colors.text,
              opacity: sweep > 0 && sweep < 1 ? 0.9 : 0,
              transform: 'translateX(-50%)',
              boxShadow: '0 0 12px rgba(255,255,255,0.45)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -3,
                left: -4,
                width: 10,
                height: 10,
                borderRadius: 99,
                background: theme.colors.white,
                boxShadow: '0 0 12px rgba(255,255,255,0.55)',
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            height: 24,
            marginTop: 9,
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            color: theme.colors.textDim,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              style={{
                position: 'absolute',
                left: `${(tick / measurement.totalMs) * 100}%`,
                transform:
                  tick === 0
                    ? 'translateX(0)'
                    : tick === measurement.totalMs
                      ? 'translateX(-100%)'
                      : 'translateX(-50%)',
                color:
                  tick === measurement.totalMs
                    ? theme.colors.textMuted
                    : theme.colors.textDim,
                whiteSpace: 'nowrap',
              }}
            >
              {tick === 0 ? '0' : `${formatMs(tick)} ms`}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontFamily: theme.fonts.mono,
          fontSize: 10,
          letterSpacing: 0.8,
          color: theme.colors.textDim,
        }}
      >
        <span>Request start → first token → full response</span>
        <span>SOURCE · LOCAL DEMO ENDPOINT</span>
      </div>
    </div>
  );
};
