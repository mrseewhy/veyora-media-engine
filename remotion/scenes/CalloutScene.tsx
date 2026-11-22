import React from 'react';
import {useCurrentFrame} from 'remotion';
import {
  resolveMeasurement,
  type CalloutScene as CalloutSceneType,
  type Storyboard,
} from '../../packages/shared/src/storyboard';
import {theme} from '../theme';
import {
  formatMs,
  formatSeconds,
  progress,
  springIn,
} from '../lib/animation';
import {BrandMark} from '../components/BrandMark';
import {Disclosure} from '../components/Disclosure';

interface CalloutSceneProps {
  scene: CalloutSceneType;
  storyboard: Storyboard;
  durationInFrames: number;
  fps: number;
}

export const CalloutScene: React.FC<CalloutSceneProps> = ({
  scene,
  storyboard,
  durationInFrames,
  fps,
}) => {
  const frame = useCurrentFrame();
  const measurement = resolveMeasurement(storyboard, scene.visual.measurementId);
  const uiPerceivedMs = 180;
  const gapMs = measurement.totalMs - uiPerceivedMs;
  const uiPct = (uiPerceivedMs / measurement.totalMs) * 100;

  const headlineIn = progress(frame, 3, 16);
  const subIn = progress(frame, 9, 12);
  const numberIn = springIn(frame, fps, 7, {
    damping: 18,
    stiffness: 110,
    mass: 0.7,
  });
  const dividerIn = progress(frame, 10, 14);
  const stripIn = progress(frame, 0, 10);
  const barIn = progress(frame, 12, 14);
  const bracketIn = progress(frame, 22, 10);
  const brandIn = progress(frame, 26, 10);
  const totalSeconds = formatSeconds(measurement.totalMs);
  const uiSeconds = formatSeconds(uiPerceivedMs);
  const gapSeconds = formatSeconds(gapMs);

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          right: 40,
          top: 150,
          width: 760,
          height: 760,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(182,248,74,0.13) 0%, rgba(182,248,74,0.035) 42%, transparent 68%)',
          filter: 'blur(24px)',
          opacity: numberIn,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: 138,
          opacity: stripIn,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 9,
            fontFamily: theme.fonts.mono,
            fontSize: 10,
            letterSpacing: 1.2,
            color: theme.colors.textDim,
            textTransform: 'uppercase',
          }}
        >
          <span>Request sent · 0 ms</span>
          <span style={{color: theme.colors.amber}}>
            First token · {formatMs(measurement.ttftMs)} ms
          </span>
          <span style={{color: theme.colors.coral}}>
            Full response · {formatMs(measurement.totalMs)} ms
          </span>
        </div>
        <div
          style={{
            position: 'relative',
            height: 8,
            borderRadius: 99,
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
              width: `${(measurement.ttftMs / measurement.totalMs) * 100}%`,
              background: 'rgba(255,176,120,0.36)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${(measurement.ttftMs / measurement.totalMs) * 100}%`,
              right: 0,
              top: 0,
              bottom: 0,
              background: 'rgba(255,125,113,0.32)',
            }}
          />
          {[0, (measurement.ttftMs / measurement.totalMs) * 100, 100].map(
            (left, index) => (
              <span
                key={index}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: '50%',
                  width: 5,
                  height: 5,
                  borderRadius: 99,
                  background:
                    index === 0
                      ? theme.colors.lime
                      : index === 1
                        ? theme.colors.amber
                        : theme.colors.coral,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 8px currentColor',
                }}
              />
            ),
          )}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 268,
          width: 1020,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 26,
            opacity: headlineIn,
          }}
        >
          <span
            style={{
              width: 38,
              height: 3,
              background: theme.colors.lime,
              boxShadow: '0 0 14px rgba(182,248,74,0.6)',
            }}
          />
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2.3,
              color: theme.colors.lime,
              textTransform: 'uppercase',
            }}
          >
            The measurement
          </span>
        </div>

        <div
          style={{
            clipPath: `inset(0 ${(1 - headlineIn) * 100}% 0 0)`,
            fontFamily: theme.fonts.sans,
            fontSize: 112,
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: -4.8,
            color: theme.colors.text,
            textTransform: 'uppercase',
          }}
        >
          <div>Measure the</div>
          <div style={{color: theme.colors.lime}}>API call</div>
        </div>

        <div
          style={{
            marginTop: 28,
            fontFamily: theme.fonts.sans,
            fontSize: 54,
            fontWeight: 480,
            lineHeight: 1.1,
            letterSpacing: -1.4,
            color: theme.colors.textMuted,
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 14}px)`,
          }}
        >
          {scene.visual.subheadline}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 252,
          width: 560,
          textAlign: 'right',
          opacity: numberIn,
          transform: `scale(${1.1 - numberIn * 0.1})`,
          transformOrigin: '100% 50%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'flex-end',
            gap: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.sans,
              fontSize: 220,
              fontWeight: 850,
              lineHeight: 0.82,
              letterSpacing: -12,
              color: theme.colors.lime,
              textShadow: '0 0 70px rgba(182,248,74,0.22)',
            }}
          >
            {totalSeconds}
          </span>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 68,
              fontWeight: 700,
              color: theme.colors.lime,
              letterSpacing: -3,
            }}
          >
            s
          </span>
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: theme.fonts.mono,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2.6,
            color: theme.colors.text,
            textTransform: 'uppercase',
          }}
        >
          {scene.visual.detail}
        </div>
        <div
          style={{
            marginTop: 9,
            fontFamily: theme.fonts.mono,
            fontSize: 12,
            letterSpacing: 1,
            color: theme.colors.textDim,
          }}
        >
          {formatMs(measurement.totalMs)} ms · median of {measurement.runs} runs
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 1226,
          top: 300,
          width: 1,
          height: 360,
          background: `linear-gradient(180deg, ${theme.colors.lime}, ${theme.colors.border} 32%, transparent)`,
          transform: `scaleY(${dividerIn})`,
          transformOrigin: 'top',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: 742,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 10,
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            letterSpacing: 1.2,
            color: theme.colors.textDim,
            textTransform: 'uppercase',
          }}
        >
          <span>
            UI animation{' '}
            <span style={{color: theme.colors.lime, fontWeight: 700}}>{uiSeconds} s</span>
          </span>
          <span>
            API call{' '}
            <span style={{color: theme.colors.coral, fontWeight: 700}}>{totalSeconds} s</span>
          </span>
        </div>
        <div
          style={{
            position: 'relative',
            height: 30,
            borderRadius: 8,
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
              width: `${Math.max(1.5, uiPct)}%`,
              background: theme.colors.lime,
              boxShadow: '0 0 18px rgba(182,248,74,0.35)',
              opacity: barIn,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${uiPct}%`,
              right: 0,
              top: 0,
              bottom: 0,
              width: `${(100 - uiPct) * barIn}%`,
              background:
                'linear-gradient(90deg, rgba(255,176,120,0.65), rgba(255,125,113,0.85))',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${uiPct}%`,
              top: -2,
              bottom: -2,
              width: 1,
              background: 'rgba(255,255,255,0.65)',
              opacity: barIn,
            }}
          />
        </div>
        <div
          style={{
            position: 'relative',
            height: 28,
            marginTop: 5,
            opacity: bracketIn,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: `${uiPct}%`,
              right: 0,
              top: 7,
              height: 1,
              background: 'rgba(255,125,113,0.7)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${uiPct}%`,
              top: 2,
              width: 1,
              height: 10,
              background: 'rgba(255,125,113,0.7)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 2,
              width: 1,
              height: 10,
              background: 'rgba(255,125,113,0.7)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: `${(uiPct + 100) / 2}%`,
              top: 11,
              transform: 'translateX(-50%)',
              fontFamily: theme.fonts.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.3,
              color: theme.colors.coral,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {gapSeconds} s hidden latency
          </span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 140,
          bottom: 46,
          opacity: brandIn,
        }}
      >
        <Disclosure text={scene.visual.disclosure} tone="muted" />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 140,
          bottom: 42,
          opacity: brandIn,
        }}
      >
        <BrandMark size={22} />
      </div>
    </div>
  );
};
