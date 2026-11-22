import React from 'react';
import {useCurrentFrame} from 'remotion';
import {
  resolveMeasurement,
  type MetricTimelineScene as MetricTimelineSceneType,
  type Storyboard,
} from '../../packages/shared/src/storyboard';
import {theme} from '../theme';
import {
  easeInOutCubic,
  entrance,
  formatMs,
  mix,
  progress,
} from '../lib/animation';
import {Disclosure} from '../components/Disclosure';
import {LatencyTimeline} from '../components/LatencyTimeline';
import {MetricCard} from '../components/MetricCard';
import {ComparisonTracks} from '../components/ComparisonTracks';

interface MetricTimelineSceneProps {
  scene: MetricTimelineSceneType;
  storyboard: Storyboard;
  durationInFrames: number;
  fps: number;
}

export const MetricTimelineScene: React.FC<MetricTimelineSceneProps> = ({
  scene,
  storyboard,
  durationInFrames,
  fps,
}) => {
  const frame = useCurrentFrame();
  const measurement = resolveMeasurement(storyboard, scene.visual.measurementId);
  const panelIn = entrance(frame, fps, 0, {distance: 18, direction: 'up'});
  const headerIn = entrance(frame, fps, 4, {distance: 10, direction: 'up'});
  const cameraScale = mix(
    frame,
    [0, durationInFrames - 1],
    [1, 1.028],
    easeInOutCubic,
  );
  const cameraY = mix(frame, [0, durationInFrames - 1], [0, -14], easeInOutCubic);
  const compareIn = progress(frame, 34, 12);
  const focusTotal = progress(frame, 30, 18);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${cameraY}px) scale(${cameraScale})`,
        }}
      >
        <div
          style={{
            width: 1680,
            height: 760,
            borderRadius: 24,
            background: '#0B141D',
            border: `1px solid ${theme.colors.borderStrong}`,
            boxShadow: theme.shadows.panel,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            ...panelIn,
          }}
        >
          <div
            style={{
              position: 'relative',
              height: 86,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '0 38px',
              borderBottom: `1px solid ${theme.colors.border}`,
              background: '#0D1721',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 5,
                background: theme.colors.lime,
                boxShadow: '0 0 22px rgba(182,248,74,0.5)',
              }}
            />
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: theme.colors.lime,
                background: 'rgba(182,248,74,0.08)',
                border: '1px solid rgba(182,248,74,0.3)',
                borderRadius: 6,
                padding: '5px 9px',
              }}
            >
              POST
            </span>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 24,
                fontWeight: 700,
                color: theme.colors.text,
                letterSpacing: -0.6,
              }}
            >
              /v1/chat/completions
            </span>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.1,
                color: theme.colors.green,
                background: 'rgba(117,231,197,0.08)',
                border: '1px solid rgba(117,231,197,0.3)',
                borderRadius: 999,
                padding: '5px 10px',
              }}
            >
              200 OK
            </span>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 12,
                letterSpacing: 0.8,
                color: theme.colors.textDim,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 999,
                padding: '5px 10px',
              }}
            >
              trace_8f3a
            </span>
            <div style={{marginLeft: 'auto', ...headerIn}}>
              <Disclosure text="Measured local demo API" tone="lime" />
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: '430px 1fr',
              gap: 40,
              padding: '30px 38px 22px',
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
              <MetricCard
                label="Time to first token"
                valueMs={measurement.ttftMs}
                accent={theme.colors.amber}
                frame={frame}
                fps={fps}
                startFrame={8}
                sublabel="TTFT · request → first chunk"
              />
              <MetricCard
                label="Total response"
                valueMs={measurement.totalMs}
                accent={theme.colors.coral}
                frame={frame}
                fps={fps}
                startFrame={14}
                sublabel="request → stream complete"
              />
              <div
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 9,
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(182,248,74,0.04)',
                  border: '1px solid rgba(182,248,74,0.16)',
                  opacity: 0.55 + focusTotal * 0.45,
                }}
              >
                <span
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1.4,
                    color: theme.colors.lime,
                  }}
                >
                  THE POINT
                </span>
                <span
                  style={{
                    fontFamily: theme.fonts.sans,
                    fontSize: 15,
                    lineHeight: 1.45,
                    color: theme.colors.textMuted,
                  }}
                >
                  The UI can finish before the API has sent its first token.
                </span>
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 26, minWidth: 0}}>
              <LatencyTimeline
                measurement={measurement}
                frame={frame}
                fps={fps}
                startFrame={6}
                labels={{
                  request: scene.visual.labels.request,
                  firstToken: scene.visual.labels.firstToken,
                  complete: scene.visual.labels.complete,
                }}
              />

              <div
                style={{
                  height: 1,
                  background: `linear-gradient(90deg, ${theme.colors.border}, transparent)`,
                  opacity: 0.8,
                }}
              />

              <div style={{opacity: 0.4 + compareIn * 0.6}}>
                <ComparisonTracks
                  measurement={measurement}
                  uiPerceivedMs={scene.visual.uiPerceivedMs}
                  frame={frame}
                  fps={fps}
                  startFrame={34}
                  labels={{
                    ui: scene.visual.labels.ui,
                    api: scene.visual.labels.api,
                    gap: scene.visual.labels.gap,
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              height: 58,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              padding: '0 38px',
              borderTop: `1px solid ${theme.colors.border}`,
              background: '#0A131C',
            }}
          >
            <Disclosure text={scene.visual.disclosure} tone="muted" />
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 10,
                letterSpacing: 1,
                color: theme.colors.textDim,
              }}
            >
              {formatMs(measurement.ttftMs)} ms TTFT · {formatMs(measurement.totalMs)} ms TOTAL ·{' '}
              {measurement.runs} RUNS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
