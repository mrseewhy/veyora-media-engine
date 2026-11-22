import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { theme } from '../theme';

// Content starts after the 5-second intro (150 frames at 30 fps)
export const INTRO_FRAMES = 150;
export const CONTENT_DURATION_FRAMES = 3354; // 111.8 seconds at 30 fps

// Segment timings in content-relative milliseconds (0-based, after intro)
const SEGMENTS = [
  { id: 'hook', startMs: 0, endMs: 9666 },
  { id: 'what-is', startMs: 9666, endMs: 24809 },
  { id: 'how-it-works', startMs: 24809, endMs: 51229 },
  { id: 'capabilities', startMs: 51229, endMs: 70883 },
  { id: 'example', startMs: 70883, endMs: 87959 },
  { id: 'limitations', startMs: 87959, endMs: 101491 },
  { id: 'conclusion', startMs: 101491, endMs: 111800 },
] as const;

function activeSegment(contentMs: number) {
  return SEGMENTS.find((s) => contentMs >= s.startMs && contentMs < s.endMs);
}

function segmentProgress(contentMs: number) {
  const seg = activeSegment(contentMs);
  if (!seg) return 0;
  return (contentMs - seg.startMs) / (seg.endMs - seg.startMs);
}

// Responsive layout helper: returns positioning based on aspect ratio
type Layout = 'landscape' | 'portrait' | 'square';

function getLayout(width: number, height: number): Layout {
  if (width === height) return 'square';
  if (height > width) return 'portrait';
  return 'landscape';
}

// Common visual style
const ink = '#070D14';
const paper = '#F3F7FA';
const lime = '#B6F84A';
const blue = '#72CBF3';
const coral = '#FF7D71';

const baseFont = theme.fonts.sans;
const mono = theme.fonts.mono;

function frameStyle(progress: number, delay = 0) {
  return spring({ frame: Math.max(0, progress - delay), fps: 30, config: { damping: 16, stiffness: 160 } });
}

interface SceneProps {
  segmentId?: string;
  progress: number; // 0-1 within segment
  contentMs?: number;
  layout: Layout;
}

const HookScene: React.FC<SceneProps> = ({ progress, layout }) => {
  const enter = frameStyle(progress * 1000, 0);
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const y = interpolate(enter, [0, 1], [60, 0]);

  // Landscape: two columns. Portrait/Square: stacked.
  const isStacked = layout !== 'landscape';

  return (
    <AbsoluteFill style={{ position: 'absolute', inset: 0, background: ink, color: paper }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: isStacked ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isStacked ? 60 : 120,
          gap: 60,
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        {/* Left: Terminal-style block */}
        <div
          style={{
            flex: 1,
            background: '#0A1119',
            border: `4px solid ${theme.colors.border}`,
            borderRadius: theme.radius.xl,
            padding: 40,
            minHeight: isStacked ? 300 : 420,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: i === 1 ? coral : i === 2 ? theme.colors.amber : theme.colors.green,
                }}
              />
            ))}
          </div>
          <div style={{ color: theme.colors.textMuted, fontFamily: mono, fontSize: 18 }}>
            $ claude-code --goal "refactor auth flow"
          </div>
          <div
            style={{
              color: paper,
              fontFamily: mono,
              fontSize: 20,
              lineHeight: 1.5,
              opacity: interpolate(enter, [0.3, 1], [0, 1]),
            }}
          >
            {'> Exploring repository...'}
            <br />
            {'> Found 47 files to modify'}
            <br />
            {'> Running tests... all passing'}
            <br />
            {'> Changes applied across 6 files'}
          </div>
        </div>

        {/* Right: Explanation */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: layout === 'portrait' ? 28 : 22,
              fontWeight: 800,
              color: lime,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            SUGGESTIONS vs ACTION
          </div>
          <h1
            style={{
              fontFamily: baseFont,
              fontSize: layout === 'portrait' ? 56 : 48,
              fontWeight: 900,
              lineHeight: 1.1,
              color: paper,
              margin: 0,
            }}
          >
            Most AI tools give you <span style={{ color: lime }}>suggestions.</span>{' '}
            Claude Code <span style={{ color: blue }}>does the work.</span>
          </h1>
          <p
            style={{
              fontSize: layout === 'portrait' ? 24 : 20,
              lineHeight: 1.5,
              color: theme.colors.textMuted,
              margin: 0,
            }}
          >
            It reads your files, runs your commands, and edits your code — straight from your
            terminal.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const WhatIsScene: React.FC<SceneProps> = ({ progress, layout }) => {
  const enter = frameStyle(progress * 1000, 0);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ position: 'absolute', inset: 0, background: ink, color: paper }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: layout === 'landscape' ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: layout === 'landscape' ? 120 : 60,
          gap: 60,
          opacity,
        }}
      >
        <div
          style={{
            flex: 1,
            background: theme.colors.bgSoft,
            border: `4px solid ${theme.colors.borderStrong}`,
            borderRadius: theme.radius.xl,
            padding: 40,
            minHeight: layout === 'landscape' ? 420 : 340,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ fontFamily: mono, fontSize: 16, color: theme.colors.textMuted }}>
            TERMINAL / CLAUDE CODE
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: layout === 'portrait' ? 22 : 18,
              color: paper,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {'> claude-code "Add dark mode to the settings page"'}
            <br />
            {'> Reading src/components/Settings.tsx...'}
            <br />
            {'> Reading src/styles/theme.ts...'}
            <br />
            {'> Editing 3 files...'}
            <br />
            {'> Running build... success'}
            <br />
            {'> Dark mode deployed.'}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: layout === 'portrait' ? 28 : 22,
              fontWeight: 800,
              color: lime,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            WHAT IS CLAUDE CODE
          </div>
          <h1
            style={{
              fontFamily: baseFont,
              fontSize: layout === 'portrait' ? 52 : 44,
              fontWeight: 900,
              lineHeight: 1.15,
              color: paper,
              margin: 0,
            }}
          >
            Anthropic's terminal-based{' '}
            <span style={{ color: blue }}>coding agent.</span>
          </h1>
          <p
            style={{
              fontSize: layout === 'portrait' ? 24 : 20,
              lineHeight: 1.5,
              color: theme.colors.textMuted,
              margin: 0,
            }}
          >
            Pair programming with an AI that has real access to your codebase and your command
            line — not a chatbot watching from the sidelines.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const HowItWorksScene: React.FC<SceneProps> = ({ progress, layout }) => {
  const enter = frameStyle(progress * 1000, 0);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  const steps = [
    { n: '01', title: 'PLAN', text: 'Understand the goal and repo structure' },
    { n: '02', title: 'ACT', text: 'Read files and write code' },
    { n: '03', title: 'OBSERVE', text: 'Run tests and check results' },
    { n: '04', title: 'REPEAT', text: 'Fix issues and refine' },
  ];

  const isStacked = layout !== 'landscape';

  return (
    <AbsoluteFill style={{ position: 'absolute', inset: 0, background: ink, color: paper }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 80,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: layout === 'portrait' ? 28 : 22,
            fontWeight: 800,
            color: lime,
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          THE AGENT LOOP
        </div>
        <h2
          style={{
            fontFamily: baseFont,
            fontSize: layout === 'portrait' ? 44 : 36,
            fontWeight: 900,
            color: paper,
            textAlign: 'center',
            margin: '0 0 48px 0',
            lineHeight: 1.2,
          }}
        >
          Plan, act, observe,{' '}
          <span style={{ color: blue }}>repeat.</span>
        </h2>
        <div
          style={{
            display: isStacked ? 'column' : 'row',
            gap: 30,
            width: '100%',
            maxWidth: 1100,
            justifyContent: 'center',
          }}
        >
          {steps.map((step, i) => {
            const stepEnter = interpolate(enter, [i * 0.2 + 0.1, i * 0.2 + 0.5], [0, 1]);
            return (
              <div
                key={step.n}
                style={{
                  flex: 1,
                  background: theme.colors.panel,
                  border: `3px solid ${theme.colors.borderStrong}`,
                  borderRadius: theme.radius.lg,
                  padding: 32,
                  opacity: stepEnter,
                  transform: `translateY(${interpolate(stepEnter, [0, 1], [40, 0])}px)`,
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ fontFamily: mono, fontSize: 14, color: theme.colors.textMuted }}>
                  {step.n}
                </div>
                <div
                  style={{
                    fontFamily: baseFont,
                    fontSize: layout === 'portrait' ? 24 : 20,
                    fontWeight: 900,
                    color: lime,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: layout === 'portrait' ? 18 : 16,
                    lineHeight: 1.5,
                    color: theme.colors.textMuted,
                  }}
                >
                  {step.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CapabilitiesScene: React.FC<SceneProps> = ({ progress, layout }) => {
  const enter = frameStyle(progress * 1000, 0);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  const caps = [
    { icon: '>', label: 'Write & edit code', color: lime },
    { icon: '$', label: 'Run shell commands', color: blue },
    { icon: '/', label: 'Search across project', color: theme.colors.cyan },
    { icon: '=', label: 'Read & summarize files', color: theme.colors.amber },
    { icon: '!', label: 'Debug & reproduce errors', color: coral },
  ];

  const isStacked = layout !== 'landscape';
  const cols = layout === 'landscape' ? 3 : 2;

  return (
    <AbsoluteFill style={{ position: 'absolute', inset: 0, background: ink, color: paper }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 80,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: layout === 'portrait' ? 28 : 22,
            fontWeight: 800,
            color: lime,
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          WHAT CAN IT DO
        </div>
        <h2
          style={{
            fontFamily: baseFont,
            fontSize: layout === 'portrait' ? 40 : 34,
            fontWeight: 900,
            color: paper,
            textAlign: 'center',
            margin: '0 0 48px 0',
            lineHeight: 1.2,
          }}
        >
          It works across your whole codebase —{' '}
          <span style={{ color: blue }}>not just one file.</span>
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 24,
            width: '100%',
            maxWidth: layout === 'landscape' ? 1000 : 600,
          }}
        >
          {caps.map((cap, i) => {
            const capEnter = interpolate(enter, [i * 0.12 + 0.1, i * 0.12 + 0.4], [0, 1]);
            return (
              <div
                key={cap.label}
                style={{
                  background: theme.colors.panel,
                  border: `3px solid ${theme.colors.borderStrong}`,
                  borderRadius: theme.radius.lg,
                  padding: 28,
                  opacity: capEnter,
                  transform: `translateY(${interpolate(capEnter, [0, 1], [40, 0])}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  minHeight: 100,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    color: cap.color,
                    fontWeight: 900,
                  }}
                >
                  {cap.icon}
                </div>
                <div
                  style={{
                    fontFamily: baseFont,
                    fontSize: layout === 'portrait' ? 20 : 18,
                    fontWeight: 700,
                    color: paper,
                  }}
                >
                  {cap.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ExampleScene: React.FC<SceneProps> = ({ progress, layout }) => {
  const enter = frameStyle(progress * 1000, 0);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ position: 'absolute', inset: 0, background: ink, color: paper }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 80,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: layout === 'portrait' ? 28 : 22,
            fontWeight: 800,
            color: lime,
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          PRACTICAL EXAMPLE
        </div>
        <h2
          style={{
            fontFamily: baseFont,
            fontSize: layout === 'portrait' ? 36 : 30,
            fontWeight: 900,
            color: paper,
            textAlign: 'center',
            margin: '0 0 32px 0',
            lineHeight: 1.2,
          }}
        >
          "Add retry with exponential backoff to the API client"
        </h2>
        <div
          style={{
            background: '#0A1119',
            border: `4px solid ${theme.colors.border}`,
            borderRadius: theme.radius.xl,
            padding: 32,
            width: '100%',
            maxWidth: layout === 'landscape' ? 900 : 600,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {[
            '$ claude-code "Add retry with exponential backoff to the API client"',
            '> Reading src/lib/api-client.ts...',
            '> Writing retry logic with exponential backoff...',
            '> Adding tests for retry behavior...',
            '> Running tests... all 12 passing',
            '> Changes applied. Task complete.',
          ].map((line, i) => {
            const lineEnter = interpolate(enter, [i * 0.15 + 0.1, i * 0.15 + 0.35], [0, 1]);
            const isCmd = i === 0;
            return (
              <div
                key={i}
                style={{
                  fontFamily: mono,
                  fontSize: layout === 'portrait' ? 18 : 16,
                  lineHeight: 1.5,
                  opacity: lineEnter,
                  transform: `translateY(${interpolate(lineEnter, [0, 1], [30, 0])}px)`,
                  color: isCmd ? lime : paper,
                  paddingLeft: isCmd ? 0 : 20,
                  borderLeft: isCmd ? `3px solid ${lime}` : 'none',
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
        <p
          style={{
            marginTop: 32,
            fontSize: layout === 'portrait' ? 20 : 18,
            color: theme.colors.textMuted,
            textAlign: 'center',
          }}
        >
          No files opened by you. No copying and pasting. The agent shipped it.
        </p>
      </div>
    </AbsoluteFill>
  );
};

const LimitationsScene: React.FC<SceneProps> = ({ progress, layout }) => {
  const enter = frameStyle(progress * 1000, 0);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ position: 'absolute', inset: 0, background: ink, color: paper }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 80,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: layout === 'portrait' ? 28 : 22,
            fontWeight: 800,
            color: coral,
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 16,
          }}
        >
          IMPORTANT CONSIDERATIONS
        </div>
        <h2
          style={{
            fontFamily: baseFont,
            fontSize: layout === 'portrait' ? 40 : 34,
            fontWeight: 900,
            color: paper,
            textAlign: 'center',
            margin: '0 0 32px 0',
            lineHeight: 1.2,
          }}
        >
          It is not magic.
        </h2>
        <div
          style={{
            background: '#1A0F0E',
            border: `4px solid ${coral}`,
            borderRadius: theme.radius.xl,
            padding: 32,
            width: '100%',
            maxWidth: layout === 'landscape' ? 800 : 600,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {[
            'Can hallucinate or misread your intent.',
            'May run a command you did not expect.',
            'Always review changes before committing.',
            'Narrow its permissions; keep a human in the loop.',
          ].map((line, i) => {
            const lineEnter = interpolate(enter, [i * 0.2 + 0.1, i * 0.2 + 0.35], [0, 1]);
            return (
              <div
                key={i}
                style={{
                  fontFamily: baseFont,
                  fontSize: layout === 'portrait' ? 20 : 18,
                  lineHeight: 1.5,
                  color: paper,
                  opacity: lineEnter,
                  transform: `translateY(${interpolate(lineEnter, [0, 1], [30, 0])}px)`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <span style={{ color: coral, fontSize: 24, flexShrink: 0 }}>⚠</span>
                <span>{line}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ConclusionScene: React.FC<SceneProps> = ({ progress, layout }) => {
  const enter = frameStyle(progress * 1000, 0);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ position: 'absolute', inset: 0, background: ink, color: paper }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: layout === 'portrait' ? 28 : 22,
            fontWeight: 800,
            color: lime,
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 24,
          }}
        >
          TAKEAWAY
        </div>
        <h1
          style={{
            fontFamily: baseFont,
            fontSize: layout === 'portrait' ? 60 : 52,
            fontWeight: 900,
            lineHeight: 1.1,
            color: paper,
            textAlign: 'center',
            margin: '0 0 24px 0',
          }}
        >
          The best coding tool is the one that{' '}
          <span style={{ color: lime }}>actually ships code.</span>
        </h1>
        <p
          style={{
            fontSize: layout === 'portrait' ? 24 : 20,
            lineHeight: 1.5,
            color: theme.colors.textMuted,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Claude Code does. It is your terminal, your codebase, and an agent that gets things
          done.
        </p>
        <div
          style={{
            marginTop: 40,
            fontFamily: mono,
            fontSize: layout === 'portrait' ? 22 : 18,
            fontWeight: 900,
            color: lime,
            letterSpacing: 4,
          }}
        >
          ToolPilot — Smarter tools. Better work.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ClaudeCodeContentScene: React.FC<SceneProps> = ({ segmentId, progress, layout }) => {
  switch (segmentId) {
    case 'hook':
      return <HookScene progress={progress} layout={layout} />;
    case 'what-is':
      return <WhatIsScene progress={progress} layout={layout} />;
    case 'how-it-works':
      return <HowItWorksScene progress={progress} layout={layout} />;
    case 'capabilities':
      return <CapabilitiesScene progress={progress} layout={layout} />;
    case 'example':
      return <ExampleScene progress={progress} layout={layout} />;
    case 'limitations':
      return <LimitationsScene progress={progress} layout={layout} />;
    case 'conclusion':
      return <ConclusionScene progress={progress} layout={layout} />;
    default:
      return null;
  }
};
