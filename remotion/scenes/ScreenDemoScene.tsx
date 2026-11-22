import React from 'react';
import {useCurrentFrame} from 'remotion';
import {
  resolveMeasurement,
  type ScreenDemoScene as ScreenDemoSceneType,
  type Storyboard,
} from '../../packages/shared/src/storyboard';
import {theme} from '../theme';
import {
  clamp01,
  easeInOutCubic,
  entrance,
  mix,
  springIn,
} from '../lib/animation';
import {BrowserChrome} from '../components/BrowserChrome';
import {ChatPanel} from '../components/ChatPanel';
import {NetworkPanel} from '../components/NetworkPanel';

interface ScreenDemoSceneProps {
  scene: ScreenDemoSceneType;
  storyboard: Storyboard;
  durationInFrames: number;
  fps: number;
}

export const ScreenDemoScene: React.FC<ScreenDemoSceneProps> = ({
  scene,
  storyboard,
  durationInFrames,
  fps,
}) => {
  const frame = useCurrentFrame();
  const measurement = resolveMeasurement(storyboard, scene.visual.measurementId);
  const revealFrame = Math.round((scene.visual.revealNetworkAtMs / 1000) * fps);
  const reveal = springIn(frame, fps, revealFrame, {
    damping: 27,
    stiffness: 115,
    mass: 0.9,
  });
  const windowIn = springIn(frame, fps, 0, {
    damping: 30,
    stiffness: 95,
    mass: 1,
  });

  const cameraScale = mix(
    frame,
    [0, revealFrame, durationInFrames - 1],
    [1, 1.035, 1.075],
    easeInOutCubic,
  );
  const cameraX = mix(
    frame,
    [0, revealFrame, durationInFrames - 1],
    [0, -18, -34],
    easeInOutCubic,
  );
  const cameraY = mix(
    frame,
    [0, revealFrame, durationInFrames - 1],
    [0, -6, -12],
    easeInOutCubic,
  );
  const chatWidth = 100 - reveal * 46;
  const dimmed = clamp01(reveal * 0.92);
  const leftLabel = entrance(frame, fps, 4, {distance: 10, direction: 'down'});
  const rightLabel = entrance(frame, fps, revealFrame + 10, {
    distance: 10,
    direction: 'down',
  });
  const highlight = clamp01(reveal * 1.05);

  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div
        style={{
          position: 'absolute',
          left: 250,
          top: 82,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          ...leftLabel,
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.9,
            color: theme.colors.lime,
            textTransform: 'uppercase',
          }}
        >
          Perceived · UI
        </span>
        <span
          style={{
            fontFamily: theme.fonts.sans,
            fontSize: 13,
            color: theme.colors.textDim,
          }}
        >
          A polished first paint
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: 118,
          width: 1,
          height: 10,
          background: 'rgba(182,248,74,0.45)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: 252,
          top: 82,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 4,
          ...rightLabel,
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.9,
            color: theme.colors.coral,
            textTransform: 'uppercase',
          }}
        >
          Actual · Network
        </span>
        <span
          style={{
            fontFamily: theme.fonts.sans,
            fontSize: 13,
            color: theme.colors.textDim,
          }}
        >
          The part you don't see
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 300,
          top: 118,
          width: 1,
          height: 10,
          background: 'rgba(255,125,113,0.45)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 1560,
            height: 840,
            borderRadius: 48,
            background:
              'radial-gradient(ellipse at 55% 50%, rgba(131,213,255,0.10), rgba(182,248,74,0.035) 44%, transparent 72%)',
            filter: 'blur(20px)',
          }}
        />

        <div
          style={{
            position: 'relative',
            width: 1480,
            height: 740,
            opacity: 0.25 + windowIn * 0.75,
            transform: `scale(${0.985 + windowIn * 0.015})`,
          }}
        >
          <BrowserChrome url={scene.visual.url} title={scene.visual.title}>
            <div style={{display: 'flex', height: '100%', minHeight: 0}}>
              <div
                style={{
                  width: `${chatWidth}%`,
                  minWidth: 0,
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <ChatPanel
                  userPrompt={scene.visual.userPrompt}
                  assistantText={scene.visual.assistantText}
                  uiReadyMs={scene.visual.uiReadyMs}
                  frame={frame}
                  dimmed={dimmed}
                />
              </div>
              <div
                style={{
                  width: `${100 - chatWidth}%`,
                  minWidth: 0,
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderLeft: `2px solid ${theme.colors.lime}`,
                    boxShadow: `inset 16px 0 42px rgba(182,248,74,${0.04 * highlight})`,
                    zIndex: 2,
                    pointerEvents: 'none',
                    opacity: highlight,
                  }}
                />
                <NetworkPanel
                  measurement={measurement}
                  frame={frame}
                  fps={fps}
                  revealFrame={revealFrame}
                  compact
                />
              </div>
            </div>
          </BrowserChrome>

        </div>
      </div>
    </div>
  );
};
