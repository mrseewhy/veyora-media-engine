import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { ToolPilotIntro } from '../components/ToolPilotIntro';
import { ToolPilotOutro } from '../components/ToolPilotOutro';
import { ClaudeCodeContentScene, CONTENT_DURATION_FRAMES, INTRO_FRAMES } from '../scenes/ClaudeCodeContent';
import { CaptionTrack } from '../components/CaptionTrack';
import {
  toolpilotBrandMotion,
  bumperDurationMs,
} from '../agents/brand-motion';
import type { CaptionCue } from '../../packages/shared/src/storyboard';

const OUTRO_FRAMES = 240; // 8 seconds at 30 fps
const TOTAL_FRAMES = INTRO_FRAMES + CONTENT_DURATION_FRAMES + OUTRO_FRAMES; // 3744 frames = 124.8s

// Captions are offset by the 5-second intro in the JSON file.
// Pass the raw frame to CaptionTrack; captions start at frame 150.
const CAPTIONS: CaptionCue[] = [
  { id: 'hook', text: 'Most AI coding tools just give you suggestions. Claude Code actually does the work. It reads your files, runs your commands, and edits your code — straight from your terminal.', startMs: 5000, endMs: 14666 },
  { id: 'what-is', text: "Claude Code is Anthropic's terminal-based coding agent. Think of it as pair programming with an AI that has real access to your codebase and your command line. It is not a chatbot that watches from the sidelines. It is an agent that gets in there and ships.", startMs: 14666, endMs: 29809 },
  { id: 'how-it-works', text: 'Here is how it works. You give it a goal — like refactor the authentication flow, or add dark mode. Claude Code explores your repository, reads the relevant files, understands the structure, then makes changes across multiple files at once. It runs your tests, checks for errors, and fixes what it breaks. Plan, act, observe, repeat. That loop is the whole point. It works right in your terminal, so there is no context switching between your editor and a separate AI window.', startMs: 29809, endMs: 56229 },
  { id: 'capabilities', text: 'What can it actually do? It writes and edits code, runs shell commands, searches across your entire project, reads and summarizes long files, and helps you debug by reproducing errors. It understands context across your whole codebase — not just the one file you happen to have open. And it works in the tools you already use, right in your terminal.', startMs: 56229, endMs: 75883 },
  { id: 'example', text: 'Here is a practical example. You tell Claude Code: add a retry with exponential backoff to the API client. It finds the client file, writes the retry logic, adds tests, runs them, and reports back — all without you opening a single file. That is the difference between a suggestion and an agent.', startMs: 75883, endMs: 92959 },
  { id: 'limitations', text: 'But it is not magic. Claude Code can hallucinate, misread your intent, or run a command you did not expect. Always review changes before committing, narrow its permissions, and keep a human in the loop. You are still the engineer in charge.', startMs: 92959, endMs: 106491 },
  { id: 'conclusion', text: 'The best coding tool is the one that actually ships code. Claude Code does. It is your terminal, your codebase, and an agent that gets things done. ToolPilot: smarter tools, better work.', startMs: 106491, endMs: 116800 },
] as const;

type Layout = 'landscape' | 'portrait' | 'square';

function getLayout(width: number, height: number): Layout {
  if (width === height) return 'square';
  if (height > width) return 'portrait';
  return 'landscape';
}

function segmentIdAt(contentMs: number) {
  const segments: Array<{ id: string; startMs: number; endMs: number }> = [
    { id: 'hook', startMs: 0, endMs: 9666 },
    { id: 'what-is', startMs: 9666, endMs: 24809 },
    { id: 'how-it-works', startMs: 24809, endMs: 51229 },
    { id: 'capabilities', startMs: 51229, endMs: 70883 },
    { id: 'example', startMs: 70883, endMs: 87959 },
    { id: 'limitations', startMs: 87959, endMs: 101491 },
    { id: 'conclusion', startMs: 101491, endMs: 111800 },
  ];
  return segments.find((s) => contentMs >= s.startMs && contentMs < s.endMs)?.id;
}

interface ClaudeCode100sProps {
  platform?: 'youtube' | 'vertical' | 'square';
}

export const ClaudeCode100s: React.FC<ClaudeCode100sProps> = ({
  platform = 'youtube',
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Section boundaries in frames
  const contentStart = INTRO_FRAMES;
  const contentEnd = contentStart + CONTENT_DURATION_FRAMES;
  const outroStart = contentEnd;

  const inIntro = frame < contentStart;
  const inContent = frame >= contentStart && frame < outroStart;
  const inOutro = frame >= outroStart;

  const contentMs = inContent ? ((frame - contentStart) / 30) * 1000 : 0;
  const segmentId = segmentIdAt(contentMs);
  const progress = segmentId
    ? ((contentMs - SEGMENT_START_MS[segmentId]) /
        (SEGMENT_END_MS[segmentId] - SEGMENT_START_MS[segmentId])) *
      1000
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#070D14' }}>
      {/* Intro: frames 0-149 */}
      <Sequence from={0} durationInFrames={INTRO_FRAMES}>
        <ToolPilotIntro platform={platform} />
      </Sequence>

      {/* Content: frames 150-3503 */}
      <Sequence from={contentStart} durationInFrames={CONTENT_DURATION_FRAMES}>
        <AbsoluteFill style={{ position: 'absolute', inset: 0 }}>
          {/* Narration audio plays only during content */}
          <Audio src={staticFile('generated/claude-code-100s.wav')} volume={1} />
          <ClaudeCodeContentScene
            segmentId={segmentId ?? 'hook'}
            progress={progress}
            contentMs={contentMs}
            layout={getLayout(width, height)}
          />
          {/* Captions: offset by intro, active during content only */}
          <CaptionTrack captions={CAPTIONS} frame={frame} fps={30} />
        </AbsoluteFill>
      </Sequence>

      {/* Outro: frames 3504-3743 */}
      <Sequence from={outroStart} durationInFrames={OUTRO_FRAMES}>
        <ToolPilotOutro width={width} height={height} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Segment timing maps for progress calculation
const SEGMENT_START_MS: Record<string, number> = {
  hook: 0,
  'what-is': 9666,
  'how-it-works': 24809,
  capabilities: 51229,
  example: 70883,
  limitations: 87959,
  conclusion: 101491,
};
const SEGMENT_END_MS: Record<string, number> = {
  hook: 9666,
  'what-is': 24809,
  'how-it-works': 51229,
  capabilities: 70883,
  example: 87959,
  limitations: 101491,
  conclusion: 111800,
};

export const CLAUDE_CODE_TOTAL_FRAMES = TOTAL_FRAMES;
export const CLAUDE_CODE_INTRO_FRAMES = INTRO_FRAMES;
export const CLAUDE_CODE_OUTRO_FRAMES = OUTRO_FRAMES;
