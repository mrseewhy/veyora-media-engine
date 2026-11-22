import React from 'react';
import {AbsoluteFill, Audio, Sequence, Series, staticFile, useCurrentFrame} from 'remotion';
import type {EditorialStoryboard} from '../../packages/shared/src/editorial-storyboard';
import {CaptionTrack} from '../components/CaptionTrack';
import {FontLoader} from '../fonts';
import {EditorialScene} from './EditorialScenes';

export const AgentsPreview: React.FC<{storyboard: EditorialStoryboard}> = ({storyboard}) => {
  const frame = useCurrentFrame();
  const scenes = storyboard.scenes.filter(scene => scene.startMs < 30000);
  return <AbsoluteFill>
    <FontLoader/>
    <Audio src={staticFile(storyboard.narration.previewAudioPath)} volume={1}/>
    <Sequence from={144} durationInFrames={23}><Audio src={staticFile('generated/agents-tick.wav')} volume={0.22}/></Sequence>
    <Sequence from={300} durationInFrames={23}><Audio src={staticFile('generated/agents-tick.wav')} volume={0.16}/></Sequence>
    <Sequence from={705} durationInFrames={23}><Audio src={staticFile('generated/agents-tick.wav')} volume={0.22}/></Sequence>
    <Series>{scenes.map(scene => <Series.Sequence key={scene.id} durationInFrames={scene.durationMs/1000*30} name={scene.id}><EditorialScene type={scene.type}/></Series.Sequence>)}</Series>
    <CaptionTrack captions={storyboard.narration.captions} frame={frame} fps={30}/>
  </AbsoluteFill>;
};
