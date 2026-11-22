import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  msToFrame,
  type Storyboard,
  type StoryboardScene,
} from '../../packages/shared/src/storyboard';
import {theme} from '../theme';
import {CaptionTrack} from '../components/CaptionTrack';
import {Stage} from '../components/Stage';
import {FontLoader} from '../fonts';
import {BrandOutroScene} from '../scenes/BrandOutroScene';
import {CalloutScene} from '../scenes/CalloutScene';
import {MetricTimelineScene} from '../scenes/MetricTimelineScene';
import {ScreenDemoScene} from '../scenes/ScreenDemoScene';

export type LatencyVideoProps = {
  storyboard: Storyboard;
};

export const LatencyVideo: React.FC<LatencyVideoProps> = ({storyboard}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const narrationStartFrame = msToFrame(storyboard.narration.startMs, fps);
  const narrationFrames =
    Math.ceil((storyboard.narration.durationMs / 1000) * fps) + 8;
  const activeSceneIndex = Math.max(
    0,
    storyboard.scenes.findIndex((scene) => {
      const start = msToFrame(scene.startMs, fps);
      const end = msToFrame(scene.startMs + scene.durationMs, fps);
      return frame >= start && frame < end;
    }),
  );

  const sceneFrames = storyboard.scenes.map((scene) => {
    const start = msToFrame(scene.startMs, fps);
    const end = msToFrame(scene.startMs + scene.durationMs, fps);
    return Math.max(1, end - start);
  });

  const renderScene = (scene: StoryboardScene, index: number) => {
    const common = {
      storyboard,
      durationInFrames: sceneFrames[index],
      fps,
    };
    switch (scene.type) {
      case 'ScreenDemo':
        return <ScreenDemoScene {...common} scene={scene} />;
      case 'MetricTimeline':
        return <MetricTimelineScene {...common} scene={scene} />;
      case 'Callout':
        return <CalloutScene {...common} scene={scene} />;
      case 'BrandOutro':
        return <BrandOutroScene {...common} scene={scene} />;
      default:
        return null;
    }
  };

  return (
    <AbsoluteFill style={{backgroundColor: theme.colors.bg}}>
      <FontLoader />
      <Stage
        frame={frame}
        durationInFrames={durationInFrames}
        sceneIndex={activeSceneIndex}
        sceneCount={storyboard.scenes.length}
        brand={storyboard.brand}
      />

      <Sequence
        from={narrationStartFrame}
        durationInFrames={narrationFrames}
        name="Gemini narration"
      >
        <Audio src={staticFile(storyboard.narration.audioPath)} />
      </Sequence>

      <Audio
        src={staticFile('generated/latency-sfx.wav')}
        volume={0.62}
        name="Original sound design"
      />

      <Series>
        {storyboard.scenes.map((scene, index) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={sceneFrames[index]}
            name={scene.id}
          >
            {renderScene(scene, index)}
          </Series.Sequence>
        ))}
      </Series>

      <CaptionTrack
        captions={storyboard.narration.captions}
        frame={frame}
        fps={fps}
      />
    </AbsoluteFill>
  );
};
