import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile, useCurrentFrame} from 'remotion';
import {CaptionTrack} from '../components/CaptionTrack';
import {FontLoader} from '../fonts';
import {EditorialScene15s} from './EditorialScenes15s';

/**
 * 15-second ToolPilot layout-refinement test composition.
 *
 * Uses the representative 8s-23s slice of the approved AI Agents episode
 * (original 30-second preview), mapped onto a fresh 1920x1080 @ 30fps canvas.
 *
 * - No intro, no outro, no persistent branding / watermark.
 * - Audio is the original Puck narration extracted from agents-0-30.mp4
 *   (public/generated/agents-15s-test.wav), preserving voice and pace.
 * - Illustrations keep full readable size; consistent horizontal margins keep
 *   content off the frame edges.
 * - A fixed caption-safe zone is reserved at the bottom; all animated content
 *   stays above it.
 * - Captions are remapped onto the 15s window and stay synchronized with the
 *   narration.
 */
const SEGMENT_START_MS = 8000; // original 8s
const DURATION_MS = 15000; // exactly 15 seconds
const FRAMES = Math.round((DURATION_MS / 1000) * 30); // 450

// Representative 15s slice: original 8s-23s, remapped to 0-15s.
// Each scene plays its opening animation within its slice.
export const scenes15s = [
  {id: 'agent-escape', type: 'AgentEscape' as const, durationMs: 2000},
  {id: 'action-loop', type: 'ActionLoop' as const, durationMs: 7000},
  {id: 'kitchen-analogy', type: 'KitchenAnalogy' as const, durationMs: 5000},
  {id: 'missing-eggs', type: 'MissingEggs' as const, durationMs: 1000},
] as const;

export const Agents15s: React.FC<{storyboard: import('../../packages/shared/src/editorial-storyboard').EditorialStoryboard}> = ({
  storyboard,
}) => {
  const frame = useCurrentFrame();

  // Remap the original captions onto the 15s window (subtract SEGMENT_START_MS).
  const captions = storyboard.narration.captions
    .filter((cue) => cue.endMs > SEGMENT_START_MS && cue.startMs < SEGMENT_START_MS + DURATION_MS)
    .map((cue) => ({
      ...cue,
      startMs: Math.max(0, cue.startMs - SEGMENT_START_MS),
      endMs: Math.min(DURATION_MS, cue.endMs - SEGMENT_START_MS),
    }));

  return (
    <AbsoluteFill style={{backgroundColor: '#101820'}}>
      <FontLoader />
      <Audio src={staticFile('generated/agents-15s-test.wav')} volume={1} />
      <Series>
        {scenes15s.map((scene) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.durationMs / 1000 / (1 / 30)}
            name={scene.id}
          >
            <EditorialScene15s type={scene.type} />
          </Series.Sequence>
        ))}
      </Series>
      <CaptionTrack captions={captions} frame={frame} fps={30} />
    </AbsoluteFill>
  );
};

Agents15s.displayName = 'Agents15s';

export {FRAMES, DURATION_MS, SEGMENT_START_MS};
