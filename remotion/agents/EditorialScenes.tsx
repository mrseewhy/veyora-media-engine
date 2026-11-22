import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';

const ink = '#101820';
const paper = '#F4F0E6';
const lime = '#B6F84A';
const blue = '#72CBF3';
const coral = '#FF715B';
const cyan = '#83D5FF';

const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
const pop = (f: number, delay = 0) =>
  spring({
    frame: Math.max(0, f - delay),
    fps: 30,
    config: {damping: 14, stiffness: 160},
  });

const sans = theme.fonts.sans;
const mono = theme.fonts.mono;

/**
 * Content frame: full-bleed background with NO persistent logo, watermark or
 * "TOOLPILOT / AI AGENTS / 100" overlay. Branding appears only in the bumper
 * components (BrandIntro / BrandOutro), per the ToolPilot brand-motion rules.
 */
const ContentFrame: React.FC<{bg?: string; children: React.ReactNode}>=({
  bg = ink,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: bg,
      color: '#fff',
      fontFamily: sans,
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

const revealText = (text: string, f: number, start: number, rate = 14) => {
  const shown = Math.floor((f - start) * rate);
  const shownChars = Math.max(0, Math.min(text.length, shown));
  return text.slice(0, shownChars);
};

const Chip: React.FC<{
  text: string;
  accent: string;
  f: number;
  start: number;
  index: number;
}> = ({text, accent, f, start, index}) => {
  const open = ease(f, start + index * 14, start + index * 14 + 12);
  const y = (1 - open) * 40;
  const opacity = open;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: '#151f2b',
        border: `1px solid ${accent}`,
        color: '#fff',
        borderRadius: 10,
        padding: '10px 16px',
        fontFamily: mono,
        fontSize: 20,
        fontWeight: 700,
        marginRight: 14,
        marginBottom: 14,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 12px ${accent}`,
        }}
      />
      {text}
    </div>
  );
};

export const TerminalHook: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const square = height === width;
  const cx = width / 2;
  const cy = height / 2;

  const terminalW = portrait ? width * 0.88 : width * 0.52;
  const terminalH = portrait ? height * 0.62 : height * 0.72;
  const tx = portrait ? width * 0.06 : cx - terminalW / 2;
  const ty = portrait ? height * 0.14 : cy - terminalH / 2;

  const prompt = revealText(
    '$ claude "Add an OAuth2 middleware to the API router."',
    f,
    6,
    10,
  );
  const typing = revealText(
    'const mw = async (req, res, next) => { ... }',
    f,
    40,
    12,
  );

  return (
    <ContentFrame bg="#0b1018">
      {/* Left: a plain terminal that does nothing. */}
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.06 : width * 0.035,
          top: portrait ? height * 0.14 : height * 0.16,
          width: portrait ? width * 0.88 : width * 0.30,
          height: portrait ? height * 0.66 : height * 0.62,
          background: '#0d121a',
          border: `2px solid #24303d`,
          borderRadius: 14,
          boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: '#171e28',
            height: 28,
            borderBottom: `1px solid #24303d`,
            padding: '0 14px',
            fontFamily: mono,
            fontSize: 14,
            color: '#6b7a89',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{width: 8, height: 8, borderRadius: '50%', background: '#ff5f56'}} />
          <div style={{width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e'}} />
          <div style={{width: 8, height: 8, borderRadius: '50%', background: '#27c93f'}} />
          <span>bash</span>
        </div>
        <div
          style={{
            padding: '16px 14px',
            fontFamily: mono,
            fontSize: 17,
            lineHeight: 1.5,
            color: '#9aa5b1',
            height: 'calc(100% - 28px)',
            overflow: 'hidden',
          }}
        >
          <div style={{marginBottom: 12}}>{prompt}</div>
          <div style={{opacity: ease(f, 55, 75)}}>_</div>
        </div>
      </div>

      {/* Right: Claude Code actively editing files. */}
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.06 : width * 0.37,
          top: portrait ? height * 0.82 : cy - terminalH / 2,
          width: portrait ? width * 0.88 : width * 0.59,
          height: portrait ? height * 0.14 : terminalH,
          background: '#0f1722',
          border: `2px solid ${blue}`,
          borderRadius: 14,
          boxShadow: `0 24px 70px rgba(114,203,243,0.12), 0 0 0 1px rgba(114,203,243,0.06)`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: '#0b1119',
            height: 28,
            borderBottom: `1px solid #1c2838`,
            padding: '0 14px',
            fontFamily: mono,
            fontSize: 14,
            color: blue,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{width: 8, height: 8, borderRadius: '50%', background: lime}} />
          <span>claude • middleware.ts</span>
        </div>
        <div style={{padding: '14px', fontFamily: mono, fontSize: 16, color: '#cbd5e1', lineHeight: 1.45}}>
          <div style={{marginBottom: 8, color: '#94a3b8'}}>// Adds OAuth2 bearer validation</div>
          <div style={{marginBottom: 2}}>{`export const auth = ${revealText('async (req) => {', f, 14, 16)}`}</div>
          <div style={{marginLeft: 22, marginBottom: 2, color: '#86efac'}}>{`  const token = ${revealText('req.headers.authorization', f, 26, 14)}`}</div>
          <div style={{marginLeft: 22, marginBottom: 10}}>{`  return ${revealText('validate(token)', f, 42, 14)}`}</div>
          <div style={{marginLeft: 0}}>{`}`}</div>
          <div
            style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: `1px solid #1c2838`,
              fontSize: 13,
              color: lime,
              fontWeight: 700,
              opacity: ease(f, 70, 85),
            }}
          >
            ✓ Applied to 3 files · 0 errors
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.06 : width * 0.035,
          top: portrait ? height * 0.84 : height * 0.86,
          fontSize: portrait ? 20 : 24,
          fontWeight: 800,
          color: lime,
          opacity: ease(f, 85, 100),
          letterSpacing: 1,
        }}
      >
        Same terminal. New job description.
      </div>
    </ContentFrame>
  );
};

export const AgentInLoop: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const square = height === width;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <ContentFrame>
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.08 : height * 0.12,
          width: portrait ? width * 0.9 : width * 0.42,
          fontSize: portrait ? 34 : 44,
          fontWeight: 900,
          letterSpacing: -2,
          lineHeight: 1.1,
        }}
      >
        {revealText('Claude Code lives inside your project.', f, 0, 10)}
      </div>

      {/* Central codebase graph: files connected to the agent. */}
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : cx - width * 0.26,
          top: portrait ? height * 0.22 : cy - height * 0.34,
          width: portrait ? width * 0.9 : width * 0.52,
          height: portrait ? height * 0.55 : height * 0.62,
          background: '#0d121a',
          border: `1px solid #24303d`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 50% 40%, rgba(114,203,243,0.08), transparent 40%)`,
          }}
        />
        {/* Agent node */}
        <div
          style={{
            position: 'absolute',
            left: portrait ? width * 0.44 : width * 0.10,
            top: portrait ? height * 0.10 : height * 0.10,
            width: 64,
            height: 64,
            background: lime,
            color: ink,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 24,
            boxShadow: `0 0 30px ${lime}`,
            opacity: ease(f, 8, 22),
          }}
        >
          {'>'}
        </div>
        <div
          style={{
            position: 'absolute',
            left: portrait ? width * 0.52 : width * 0.16,
            top: portrait ? height * 0.17 : height * 0.16,
            fontSize: 16,
            fontWeight: 700,
            color: '#e2e8f0',
            opacity: ease(f, 18, 30),
          }}
        >
          Claude Code
        </div>

        {/* File nodes radiating out. */}
        {[1, 2, 3, 4].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          const rx = portrait ? width * 0.44 : cx + Math.cos(angle) * 150;
          const ry = portrait ? height * 0.22 + Math.sin(angle) * 110 : cy + Math.sin(angle) * 140;
          const open = ease(f, 22 + i * 10, 34 + i * 10);
          return (
            <div key={i} style={{position: 'absolute'}}>
              <div
                style={{
                  position: 'absolute',
                  left: rx - 30,
                  top: ry - 30,
                  width: 60,
                  height: 60,
                  background: '#151f2b',
                  border: `1px solid ${blue}`,
                  borderRadius: 12,
                  opacity: open,
                  transform: `scale(${interpolate(open, [0, 1], [0.5, 1])})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <div style={{fontSize: 20, marginBottom: 4}}>{['ts', 'json', 'md', 'tsx'][i - 1]}</div>
                <div style={{fontSize: 11, color: '#94a3b8'}}>{`file${i}`}</div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: rx,
                  top: ry,
                  width: 2,
                  height: 2,
                  background: blue,
                  borderRadius: '50%',
                  opacity: open,
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : cx + width * 0.04,
          top: portrait ? height * 0.82 : height * 0.72,
          width: portrait ? width * 0.9 : width * 0.42,
          fontSize: portrait ? 22 : 26,
          lineHeight: 1.35,
          color: '#cbd5e1',
          opacity: ease(f, 60, 80),
        }}
      >
        {revealText(
          'It reads your files, builds a model of the codebase, and turns plain language into edits.',
          f,
          60,
          8,
        )}
      </div>
    </ContentFrame>
  );
};

export const ToolUse: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;

  const chips = [
    {text: 'Read files', accent: blue},
    {text: 'Edit & write', accent: lime},
    {text: 'Search code', accent: cyan},
    {text: 'Run commands', accent: '#a78bfa'},
    {text: 'Run tests', accent: coral},
    {text: 'Use git', accent: '#34d399'},
  ];

  const loop = ['Plan', 'Edit', 'Run', 'Check', 'Iterate'];

  return (
    <ContentFrame>
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.06 : height * 0.10,
          width: portrait ? width * 0.9 : width * 0.56,
          fontSize: portrait ? 30 : 40,
          fontWeight: 900,
          letterSpacing: -2,
          lineHeight: 1.1,
        }}
      >
        {revealText('It reads, edits, searches, runs, tests and commits.', f, 0, 10)}
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.26 : height * 0.28,
          width: portrait ? width * 0.9 : width * 0.56,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {chips.map((c, i) => (
          <Chip key={c.text} text={c.text} accent={c.accent} f={f} start={10} index={i} />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.56 : height * 0.56,
          width: portrait ? width * 0.9 : width * 0.56,
          display: 'flex',
          gap: portrait ? 8 : 18,
        }}
      >
        {loop.map((step, i) => {
          const active = Math.floor((f % 130) / 26) === i;
          return (
            <div
              key={step}
              style={{
                width: portrait ? 70 : 90,
                height: portrait ? 70 : 90,
                background: active ? lime : '#151f2b',
                color: active ? ink : '#94a3b8',
                border: active ? `3px solid ${lime}` : `1px solid #334155`,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: mono,
                fontSize: portrait ? 16 : 20,
                fontWeight: 900,
                opacity: ease(f, 40 + i * 8, 52 + i * 8),
                transform: `scale(${interpolate(ease(f, 40 + i * 8, 52 + i * 8), [0, 1], [0.6, 1])})`,
                boxShadow: active ? `0 0 22px ${lime}` : 'none',
              }}
            >
              {step}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.76 : height * 0.76,
          width: portrait ? width * 0.9 : width * 0.56,
          fontSize: portrait ? 20 : 24,
          fontWeight: 800,
          color: '#cbd5e1',
          opacity: ease(f, 95, 110),
        }}
      >
        {repeatText('It plans, edits, runs, checks results, and repeats until the task is done.', f, 95, 8)}
      </div>
    </ContentFrame>
  );
};

function repeatText(text: string, f: number, start: number, rate: number) {
  const shown = Math.floor((f - start) * rate);
  const shownChars = Math.max(0, Math.min(text.length, shown));
  return text.slice(0, shownChars);
}

export const SubagentsMCP: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <ContentFrame>
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.07 : height * 0.10,
          width: portrait ? width * 0.9 : width * 0.56,
          fontSize: portrait ? 30 : 38,
          fontWeight: 900,
          letterSpacing: -2,
          lineHeight: 1.1,
        }}
      >
        {revealText('Big jobs split across parallel subagents.', f, 0, 10)}
      </div>

      {/* Lead agent on left, subagents on right. */}
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.06 : width * 0.06,
          top: portrait ? height * 0.20 : height * 0.22,
          width: portrait ? width * 0.4 : width * 0.22,
          background: '#0d121a',
          border: `2px solid ${lime}`,
          borderRadius: 14,
          padding: 16,
          opacity: ease(f, 8, 20),
        }}
      >
        <div style={{fontFamily: mono, fontSize: 15, fontWeight: 800, color: lime, marginBottom: 10}}>Lead agent</div>
        <div style={{fontSize: 14, color: '#cbd5e1', lineHeight: 1.4}}>Decomposes the goal and delegates.</div>
      </div>

      {[1, 2, 3].map((i) => {
        const x = portrait ? width * 0.52 : cx + (i - 1) * 260;
        const y = portrait ? height * 0.20 + i * 150 : cy - 100;
        return (
          <div key={i} style={{position: 'absolute'}}>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: portrait ? width * 0.4 : 170,
                height: portrait ? 110 : 150,
                background: '#151f2b',
                border: `1px solid #334155`,
                borderRadius: 12,
                padding: 12,
                opacity: ease(f, 22 + i * 12, 34 + i * 12),
              }}
            >
              <div style={{fontFamily: mono, fontSize: 14, fontWeight: 800, color: blue, marginBottom: 6}}>Subagent {i}</div>
              <div style={{fontSize: 13, color: '#94a3b8', lineHeight: 1.3}}>{i === 1 ? 'Edits the router' : i === 2 ? 'Writes tests' : 'Updates docs'}</div>
            </div>
          </div>
        );
      })}

      {/* MCP servers row. */}
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.72 : height * 0.72,
          width: portrait ? width * 0.9 : width * 0.56,
          fontSize: portrait ? 18 : 22,
          fontWeight: 800,
          color: '#cbd5e1',
          opacity: ease(f, 60, 72),
          lineHeight: 1.4,
        }}
      >
        {repeatText('It also connects to MCP servers, pulling in extra tools and context from your services.', f, 60, 7)}
      </div>
    </ContentFrame>
  );
};

export const WorkflowDemo: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const cx = width / 2;

  const stages = [
    {label: 'Goal', text: 'Add OAuth2 middleware', accent: lime},
    {label: 'Explore', text: 'Reads router + auth files', accent: blue},
    {label: 'Implement', text: 'Edits and wires code', accent: cyan},
    {label: 'Verify', text: 'Runs tests and typecheck', accent: '#a78bfa'},
    {label: 'Report', text: 'Summarizes the change', accent: coral},
  ];

  return (
    <ContentFrame bg="#0b1018">
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.06 : height * 0.08,
          width: portrait ? width * 0.9 : width * 0.56,
          fontSize: portrait ? 28 : 36,
          fontWeight: 900,
          letterSpacing: -2,
          lineHeight: 1.1,
        }}
      >
        {revealText('One goal, handled end to end.', f, 0, 10)}
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.28 : height * 0.26,
          width: portrait ? width * 0.9 : width * 0.56,
          display: 'flex',
          flexDirection: portrait ? 'column' : 'row',
          gap: portrait ? 14 : 22,
          alignItems: portrait ? 'stretch' : 'center',
        }}
      >
        {stages.map((s, i) => {
          const active = Math.floor((f % 150) / 30) === i;
          const w = portrait ? width * 0.88 : width * 0.16;
          return (
            <div
              key={s.label}
              style={{
                width: w,
                height: portrait ? 78 : 150,
                background: active ? '#151f2b' : '#0d121a',
                border: active ? `3px solid ${s.accent}` : `1px solid #24303d`,
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                opacity: ease(f, 12 + i * 10, 24 + i * 10),
                transform: `scale(${interpolate(ease(f, 12 + i * 10, 24 + i * 10), [0, 1], [0.85, 1])})`,
              }}
            >
              <div style={{fontFamily: mono, fontSize: 15, fontWeight: 800, color: s.accent, textTransform: 'uppercase', letterSpacing: 2}}>{s.label}</div>
              <div style={{fontSize: portrait ? 15 : 18, color: '#e2e8f0', lineHeight: 1.3}}>{s.text}</div>
              <div
                style={{
                  width: 6,
                  height: 30,
                  background: s.accent,
                  borderRadius: 3,
                  alignSelf: active ? 'center' : 'flex-start',
                  opacity: active ? 1 : 0,
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.66,
          top: portrait ? height * 0.72 : height * 0.66,
          width: portrait ? width * 0.9 : width * 0.30,
          fontSize: portrait ? 18 : 22,
          fontWeight: 800,
          color: '#cbd5e1',
          opacity: ease(f, 95, 110),
          lineHeight: 1.4,
        }}
      >
        {repeatText('This run is an illustrative simulation — Claude Code performs the real work in your terminal.', f, 95, 7)}
      </div>
    </ContentFrame>
  );
};

export const Guardrails: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;
  const cx = width / 2;

  return (
    <ContentFrame bg="#0b1018">
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.08 : height * 0.10,
          width: portrait ? width * 0.9 : width * 0.56,
          fontSize: portrait ? 30 : 38,
          fontWeight: 900,
          letterSpacing: -2,
          lineHeight: 1.1,
        }}
      >
        {revealText('You stay in control.', f, 0, 10)}
      </div>

      {/* Approval gate shield. */}
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : cx - width * 0.24,
          top: portrait ? height * 0.24 : height * 0.26,
          width: portrait ? width * 0.9 : width * 0.48,
          height: portrait ? height * 0.42 : height * 0.5,
          background: '#151f2b',
          border: `2px solid ${coral}`,
          borderRadius: 18,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          opacity: ease(f, 10, 22),
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            background: coral,
            color: ink,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            fontWeight: 900,
            boxShadow: `0 0 32px ${coral}`,
          }}
        >
          ✋
        </div>
        <div style={{fontFamily: mono, fontSize: 17, fontWeight: 800, color: '#fca5a5', textAlign: 'center'}}>Approval required</div>
        <div style={{fontSize: 15, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.5, maxWidth: '80%'}}>
          Claude Code asks before costly or irreversible actions — it never runs without your say-so.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : cx + width * 0.02,
          top: portrait ? height * 0.72 : height * 0.26,
          width: portrait ? width * 0.9 : width * 0.42,
          fontSize: portrait ? 18 : 22,
          lineHeight: 1.5,
          color: '#cbd5e1',
          opacity: ease(f, 55, 70),
        }}
      >
        {repeatText('It runs in your environment, respects your permissions, and leaves the final decision to you.', f, 55, 7)}
      </div>

      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.88 : height * 0.84,
          fontSize: portrait ? 20 : 24,
          fontWeight: 800,
          color: lime,
          opacity: ease(f, 85, 100),
        }}
      >
        Your code. Your rules. Your terminal.
      </div>
    </ContentFrame>
  );
};

export const ConclusionBrand: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const portrait = height > width;

  return (
    <ContentFrame>
      <div
        style={{
          position: 'absolute',
          left: portrait ? width * 0.05 : width * 0.06,
          top: portrait ? height * 0.10 : height * 0.14,
          width: portrait ? width * 0.9 : width * 0.56,
          fontSize: portrait ? 32 : 44,
          fontWeight: 900,
          letterSpacing: -2,
          lineHeight: 1.1,
        }}
      >
        {revealText('Claude Code.', f, 0, 16)}
        <div
          style={{
            marginTop: portrait ? 14 : 24,
            fontSize: portrait ? 22 : 30,
            fontWeight: 800,
            color: lime,
            letterSpacing: -1,
            opacity: ease(f, 22, 36),
          }}
        >
          {revealText('Your AI pair programmer in the terminal.', f, 22, 10)}
        </div>
        <div
          style={{
            marginTop: portrait ? 18 : 28,
            fontSize: portrait ? 18 : 24,
            color: '#cbd5e1',
            opacity: ease(f, 42, 56),
          }}
        >
          {revealText('From prompt to production, faster.', f, 42, 9)}
        </div>
      </div>
    </ContentFrame>
  );
};

export const EditorialScene: React.FC<{
  type: any;
  portrait?: boolean;
  square?: boolean;
}> = ({type}) => {
  switch (type) {
    case 'TerminalHook':
      return <TerminalHook />;
    case 'AgentInLoop':
      return <AgentInLoop />;
    case 'ToolUse':
      return <ToolUse />;
    case 'SubagentsMCP':
      return <SubagentsMCP />;
    case 'WorkflowDemo':
      return <WorkflowDemo />;
    case 'Guardrails':
      return <Guardrails />;
    case 'ConclusionBrand':
      return <ConclusionBrand />;
    default:
      return (
        <ContentFrame>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 40,
              color: '#64748b',
            }}
          >
            Scene awaiting implementation
          </div>
        </ContentFrame>
      );
  }
};
