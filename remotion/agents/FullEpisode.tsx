import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {EditorialStoryboard} from '../../packages/shared/src/editorial-storyboard';
import {FontLoader} from '../fonts';
import {BrandBumper} from './BrandBumper';
import {EditorialScene} from './EditorialScenes';
import {CaptionTrack} from '../components/CaptionTrack';
import {platformFor} from './brand-motion';

const msToFrames = (ms: number) => Math.round((ms * 30) / 1000);

export const FullEpisode: React.FC<{storyboard: EditorialStoryboard; audioPath?: string}> = ({
  storyboard,
  audioPath = 'generated/agents-full.wav',
}) => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const ms = (frame / 30) * 1000;
  const portrait = height > width;
  const square = height === width;
  const platform = platformFor(width, height);

  return (
    <AbsoluteFill style={{background: '#101820'}}>
      <FontLoader />
      <Audio src={staticFile(audioPath)} />

      {/* Subtle tick on each scene transition. */}
      {storyboard.scenes.slice(1).map((scene) => (
        <Sequence
          key={`tick-${scene.id}`}
          from={msToFrames(scene.startMs)}
          durationInFrames={12}
        >
          <Audio src={staticFile('generated/agents-tick.wav')} volume={0.1} />
        </Sequence>
      ))}

      {/* Intro bumper, content scenes, outro bumper — all within the 100s budget. */}
      {storyboard.scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={msToFrames(scene.startMs)}
          durationInFrames={msToFrames(scene.durationMs)}
          name={scene.id}
        >
          {scene.type === 'BrandIntro' ? (
            <BrandBumper kind="intro" platform={platform} startFrame={msToFrames(scene.startMs)} totalFrames={msToFrames(scene.durationMs)} />
          ) : scene.type === 'BrandOutro' ? (
            <BrandBumper kind="outro" platform={platform} startFrame={msToFrames(scene.startMs)} totalFrames={msToFrames(scene.durationMs)} />
          ) : (
            <EditorialScene type={scene.type} portrait={portrait} square={square} />
          )}
        </Sequence>
      ))}

      <CaptionTrack captions={storyboard.narration.captions} frame={frame} fps={30} />
    </AbsoluteFill>
  );
};
