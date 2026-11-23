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
import {ToolPilotIntro, TOOLPILOT_INTRO_FRAMES} from './agents/ToolPilotIntro';
import {ToolPilotOutro, TOOLPILOT_OUTRO_FRAMES} from './agents/ToolPilotOutro';
import {SingularityVisualProof} from './agents/SingularityVisualProof';

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
      <Composition id="SingularityVisualProof15s" component={SingularityVisualProof} width={1920} height={1080} fps={30} durationInFrames={450} />
      <Composition id="ToolPilotIntroV1" component={ToolPilotIntro} width={1920} height={1080} fps={30} durationInFrames={TOOLPILOT_INTRO_FRAMES} />
      <Composition id="ToolPilotIntroV1Vertical" component={ToolPilotIntro} width={1080} height={1920} fps={30} durationInFrames={TOOLPILOT_INTRO_FRAMES} />
      <Composition id="ToolPilotIntroV1Square" component={ToolPilotIntro} width={1080} height={1080} fps={30} durationInFrames={TOOLPILOT_INTRO_FRAMES} />
      <Composition id="ToolPilotOutroV1" component={ToolPilotOutro} width={1920} height={1080} fps={30} durationInFrames={TOOLPILOT_OUTRO_FRAMES} />
      <Composition id="ToolPilotOutroV1Vertical" component={ToolPilotOutro} width={1080} height={1920} fps={30} durationInFrames={TOOLPILOT_OUTRO_FRAMES} />
      <Composition id="ToolPilotOutroV1Square" component={ToolPilotOutro} width={1080} height={1080} fps={30} durationInFrames={TOOLPILOT_OUTRO_FRAMES} />
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
    </>
  );
};
