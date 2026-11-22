import React from 'react';
import {Composition, type CalculateMetadataFunction} from 'remotion';
import storyboardJson from '../fixtures/storyboards/toolpilot-latency-10s.json';
import {
  validateStoryboard,
  type Storyboard,
} from '../packages/shared/src/storyboard';
import {
  LatencyVideo,
  type LatencyVideoProps,
} from './compositions/LatencyVideo';
import agentsJson from '../fixtures/storyboards/toolpilot-agents-100s.json';
import {validateEditorialStoryboard} from '../packages/shared/src/editorial-storyboard';
import {AgentsPreview} from './agents/AgentsPreview';
import {Agents15s, FRAMES} from './agents/Agents15s';

const storyboard: Storyboard = validateStoryboard(storyboardJson);

const calculateMetadata: CalculateMetadataFunction<LatencyVideoProps> = ({
  props,
}) => {
  const validated = validateStoryboard(props.storyboard);
  return {
    durationInFrames: Math.round(
      (validated.format.durationMs / 1000) * validated.format.fps,
    ),
    fps: validated.format.fps,
    width: validated.format.width,
    height: validated.format.height,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ToolPilotLatency10s"
        component={LatencyVideo}
        defaultProps={{storyboard}}
        calculateMetadata={calculateMetadata}
      />
      {([
        ['ToolPilotAgents30sVertical', 1080, 1920],
        ['ToolPilotAgents30sSquare', 1080, 1080],
      ] as const).map(([id, width, height]) => (
        <Composition
          key={id}
          id={id}
          component={AgentsPreview}
          defaultProps={{storyboard: validateEditorialStoryboard(agentsJson)}}
          width={width}
          height={height}
          fps={30}
          durationInFrames={900}
        />
      ))}
      <Composition
        id="ToolPilotAgents30s"
        component={AgentsPreview}
        defaultProps={{storyboard: validateEditorialStoryboard(agentsJson)}}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={900}
      />
      <Composition
        id="ToolPilotAgents15s"
        component={Agents15s}
        defaultProps={{storyboard: validateEditorialStoryboard(agentsJson)}}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={FRAMES}
      />
    </>
  );
};
