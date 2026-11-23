import React from 'react';
import {interpolate, spring, useCurrentFrame} from 'remotion';
import {AgentCharacter} from './EditorialScenes';
import {theme} from '../theme';

const ink = '#101820';
const paper = '#F4F0E6';
const lime = '#B6F84A';
const coral = '#FF715B';
const blue = '#72CBF3';

const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
const pop = (f: number, delay = 0) =>
  spring({
    frame: Math.max(0, f - delay),
    fps: 30,
    config: {damping: 13, stiffness: 145},
  });

const label: React.CSSProperties = {
  fontFamily: theme.fonts.mono,
  fontSize: 21,
  fontWeight: 700,
  letterSpacing: 3,
  textTransform: 'uppercase',
};
const display: React.CSSProperties = {
  fontFamily: theme.fonts.sans,
  fontWeight: 900,
  letterSpacing: -5,
  lineHeight: 0.95,
};
const body: React.CSSProperties = {
  fontFamily: theme.fonts.sans,
  fontWeight: 650,
};

/**
 * Layout constants for the 15-second layout refinement.
 *
 * Instead of globally shrinking the composition (the previous contentScale
 * approach), illustrations and text stay at full, readable size and are kept
 * inside a consistent horizontal margin. A fixed caption-safe zone is reserved
 * at the bottom; no essential animated content enters it.
 */
const MARGIN_X = 140; // breathing room on both sides
const CAPTION_ZONE_BOTTOM = 240; // reserved caption-safe zone height
const CONTENT_BOTTOM = 1080 - CAPTION_ZONE_BOTTOM; // 840: content stops here
const RIGHT_EDGE = 1920 - MARGIN_X; // 1780

const DotGrid: React.FC<{dark?: boolean}> = ({dark}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity: dark ? 0.13 : 0.17,
      backgroundImage: `radial-gradient(${dark ? '#fff' : '#233'} 1.5px,transparent 1.5px)`,
      backgroundSize: '30px 30px',
    }}
  />
);

const Speech: React.FC<{children: React.ReactNode; style?: React.CSSProperties; dark?: boolean}> = ({
  children,
  style,
  dark = false,
}) => (
  <div
    style={{
      position: 'absolute',
      background: dark ? ink : '#fff',
      border: `5px solid ${ink}`,
      borderRadius: 28,
      boxShadow: '14px 16px 0 rgba(16, 24, 32, 0.18)',
      padding: '30px 38px',
      ...style,
    }}
  >
    {children}
  </div>
);

const TaskCard: React.FC<{text: string; style?: React.CSSProperties; color?: string}> = ({
  text,
  style,
  color = lime,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 18,
      background: color,
      color: ink,
      border: `5px solid ${ink}`,
      boxShadow: '9px 9px 0 rgba(16, 24, 32, 0.25)',
      borderRadius: 8,
      padding: '17px 25px',
      fontFamily: theme.fonts.mono,
      fontWeight: 800,
      fontSize: 26,
      ...style,
    }}
  >
    <span style={{fontSize: 32}}>↗</span>
    {text}
  </div>
);

/**
 * Lightweight frame: full-bleed background with a top accent stripe and
 * consistent horizontal margins. No persistent branding / watermark. All
 * children are laid out inside the content band above the caption-safe zone.
 */
const Frame15s: React.FC<{dark?: boolean; index: string; accent?: string; children: React.ReactNode}> = ({
  dark = false,
  index,
  accent = lime,
  children,
}) => {
  const bg = dark ? ink : paper;
  const fg = dark ? paper : ink;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: bg,
        color: fg,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          background: accent,
        }}
      />
      {/* Content band: horizontal margins, stops above the caption-safe zone. */}
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          right: MARGIN_X,
          top: 120,
          bottom: CAPTION_ZONE_BOTTOM,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{...label, fontSize: 16, opacity: 0.55}}>AI AGENTS / 100</span>
          <span
            style={{
              width: 1,
              height: 12,
              background: dark ? '#577' : '#999',
            }}
          />
          <span style={{...label, fontSize: 16, opacity: 0.45}}>{index}</span>
        </div>
        {children}
      </div>
    </div>
  );
};

export const AgentEscape15s: React.FC = () => {
  const f = useCurrentFrame();
  // Slides the agent in from the right over the first ~20 frames.
  const slideX = interpolate(f, [0, 20], [320, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <Frame15s dark index="02 / THE UPGRADE" accent={coral}>
      <DotGrid dark />
      <Speech
        style={{
          left: MARGIN_X,
          top: 150,
          width: 470,
          transform: `translateY(${(1 - ease(f, 6, 24)) * 140}px) rotate(-2deg)`,
          opacity: ease(f, 0, 18),
        }}
      >
        <div style={{...label, fontSize: 18}}>CHATBOT</div>
        <div style={{...body, fontSize: 43}}>Here's what<br/>you could do…</div>
      </Speech>
      <div
        style={{
          position: 'absolute',
          right: MARGIN_X,
          top: 150,
          transform: `translateX(${slideX}px) scale(${0.7 + 0.3 * pop(f, 8)})`,
          opacity: ease(f, 0, 14),
        }}
      >
        <AgentCharacter size={460} case />
      </div>
      <div
        style={{
          position: 'absolute',
          right: MARGIN_X,
          top: 470,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          opacity: ease(f, 20, 40),
        }}
      >
        <TaskCard text="SEARCH FLIGHTS" />
        <TaskCard text="CHECK CALENDAR" color={blue} />
        <TaskCard text="COMPARE OPTIONS" color={paper} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          bottom: CONTENT_BOTTOM - 40,
          ...display,
          fontSize: 82,
          opacity: ease(f, 30, 50),
        }}
      >
        SAME BRAIN.<br />
        <span style={{color: lime}}>DIFFERENT JOB.</span>
      </div>
    </Frame15s>
  );
};

export const ActionLoop15s: React.FC = () => {
  const f = useCurrentFrame();
  const steps = [
    ['01', 'GOAL', 'Make dinner'],
    ['02', 'CHOOSE', 'Open fridge'],
    ['03', 'TOOL', 'Inspect contents'],
    ['04', 'OBSERVE', 'No eggs'],
  ];
  const active = Math.floor((f % 2050) / 13);
  return (
    <Frame15s dark index="04 / THE LOOP" accent={blue}>
      <DotGrid dark />
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          top: 145,
          ...label,
          color: lime,
        }}
      >
        THE AGENT LOOP
      </div>
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          top: 200,
          ...display,
          fontSize: 86,
        }}
      >
        IT DOESN'T JUST ANSWER.<br />
        <span style={{color: blue}}>IT ITERATES.</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          right: MARGIN_X,
          top: 470,
          display: 'flex',
          gap: 18,
        }}
      >
        {steps.map(([n, title, detail], i) => {
          const isActive = i === active;
          return (
            <React.Fragment key={n}>
              <div
                style={{
                  flex: 1,
                  height: 350,
                  background: isActive ? lime : '#273841',
                  border: `4px solid ${isActive ? lime : '#536269'}`,
                  color: isActive ? ink : paper,
                  borderRadius: 12,
                  padding: 30,
                  transform: `translateY(${(1 - pop(f, 12 + i * 8)) * 350}px)`,
                  opacity: ease(f, 10 + i * 10, 30 + i * 10),
                }}
              >
                <div style={{...label, fontSize: 22, opacity: 0.6}}>{n}</div>
                <div
                  style={{
                    ...display,
                    fontSize: 51,
                    letterSpacing: -2,
                    marginTop: 40,
                  }}
                >
                  {title}
                </div>
                <div style={{...body, fontSize: 27, marginTop: 22}}>{detail}</div>
                <div
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: 50,
                    fontWeight: 900,
                    marginTop: 25,
                  }}
                >
                  {['◎', '↗', '⌘', '◉'][i]}
                </div>
              </div>
              {i < 3 && (
                <div
                  style={{
                    alignSelf: 'center',
                    fontSize: 48,
                    color: blue,
                    opacity: ease(f, 10 + i * 10, 30 + i * 10),
                  }}
                >
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          right: MARGIN_X,
          bottom: CONTENT_BOTTOM - 60,
          ...label,
          fontSize: 23,
          color: lime,
          opacity: ease(f, 85, 105),
        }}
      >
        ↶ REPEAT UNTIL DONE
      </div>
    </Frame15s>
  );
};

export const KitchenAnalogy15s: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Frame15s index="03 / THE ANALOGY" accent={blue}>
      <div
        style={{
          position: 'absolute',
          inset: '110px 0 0',
          background: '#E9DDC7',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          top: 170,
          width: 640,
          height: 560,
          background: '#fff',
          border: `6px solid ${ink}`,
          boxShadow: '20px 20px 0 #c4b9a9',
          transform: `rotate(-5deg) translateY(${(1 - pop(f, 0)) * 700}px)`,
          padding: 55,
          opacity: ease(f, 0, 20),
        }}
      >
        <div style={{...label, color: '#83949a'}}>RECIPE / FOR DINNER</div>
        <div style={{fontFamily: theme.fonts.sans, fontSize: 72, fontWeight: 900, marginTop: 35}}>
          OMELETTE
        </div>
        {['1. Get eggs', '2. Heat pan', '3. Cook'].map((x, i) => (
          <div
            key={x}
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 35,
              marginTop: 30,
              borderBottom: '2px solid #ccd0ce',
              paddingBottom: 12,
              opacity: ease(f, 20 + i * 8, 30 + i * 8),
            }}
          >
            {x}
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            right: 42,
            bottom: 38,
            fontFamily: theme.fonts.mono,
            fontSize: 70,
            fontWeight: 900,
          }}
        >
          ≡
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 900,
          top: 160,
          fontSize: 105,
          transform: `scale(${pop(f, 20)})`,
          opacity: ease(f, 0, 18),
        }}
      >
        ≠
      </div>
      <div
        style={{
          position: 'absolute',
          right: MARGIN_X,
          top: 150,
          width: 750,
          height: 610,
          background: '#8AC6DC',
          border: `8px solid ${ink}`,
          borderRadius: 30,
          transform: `translateX(${(1 - ease(f, 12, 32)) * 900}px)`,
          opacity: ease(f, 0, 20),
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 55,
            width: 260,
            height: 500,
            background: '#EEF2EF',
            border: `7px solid ${ink}`,
            borderRadius: 17,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 235,
              left: 0,
              right: 0,
              borderTop: `7px solid ${ink}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 105,
              right: 20,
              width: 10,
              height: 85,
              background: ink,
              borderRadius: 8,
            }}
          />
        </div>
        <div style={{position: 'absolute', right: 15, bottom: -5}}>
          <AgentCharacter size={365} expression="chef" />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 380,
            top: 40,
            ...label,
            color: ink,
            fontSize: 21,
          }}
        >
          ACTUALLY COOKING
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X,
          bottom: CONTENT_BOTTOM - 50,
          ...display,
          fontSize: 57,
          opacity: ease(f, 30, 50),
        }}
      >
        A RECIPE IS NOT DINNER.
      </div>
    </Frame15s>
  );
};

export const MissingEggs15s: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Frame15s index="05 / ADAPT" accent={coral}>
      <div style={{position: 'absolute', inset: '115px 0 0', background: '#CDE5E7'}} />
      <div
        style={{
          position: 'absolute',
          left: MARGIN_X - 40,
          top: 180,
          width: 700,
          height: 645,
          background: '#F2F3EB',
          border: `9px solid ${ink}`,
          borderRadius: 22,
          transform: `rotate(${ease(f, 20, 42) * -15}deg)`,
          transformOrigin: 'left center',
          boxShadow: '22px 20px 0 #8baeb2',
          opacity: ease(f, 0, 20),
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 90,
            top: 85,
            ...label,
            color: '#6a8589',
          }}
        >
          FRIDGE / INVENTORY
        </div>
        <div
          style={{
            position: 'absolute',
            left: 88,
            top: 200,
            display: 'flex',
            gap: 28,
          }}
        >
          <div
            style={{
              width: 70,
              height: 100,
              border: `7px solid ${ink}`,
              borderRadius: 14,
              background: '#fff',
            }}
          />
          <div
            style={{
              width: 30,
              height: 100,
              background: coral,
              transform: 'rotate(20deg)',
              borderRadius: '60% 60% 80% 80%',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            top: 330,
            borderTop: `7px solid ${ink}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 90,
            top: 390,
            ...display,
            fontSize: 84,
            color: coral,
          }}
        >
          NO EGGS.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: MARGIN_X,
          top: 210,
          transform: `scale(${pop(f, 34)}) rotate(8deg)`,
          border: `8px solid ${coral}`,
          color: coral,
          padding: '20px 37px',
          fontFamily: theme.fonts.mono,
          fontWeight: 900,
          fontSize: 58,
          opacity: ease(f, 0, 20),
        }}
      >
        PLAN UPDATED
      </div>
      <div
        style={{
          position: 'absolute',
          right: MARGIN_X + 15,
          top: 400,
          transform: `translateY(${(1 - pop(f, 47)) * 500}px)`,
          opacity: ease(f, 10, 30),
        }}
      >
        <AgentCharacter size={370} expression="chef" case />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 900,
          bottom: CONTENT_BOTTOM - 60,
          display: 'flex',
          gap: 15,
          alignItems: 'center',
          ...label,
          fontSize: 25,
          opacity: ease(f, 30, 50),
        }}
      >
        <TaskCard text="GROCERY FIRST" color={lime} />
        <span style={{fontSize: 58}}>↗</span>
      </div>
    </Frame15s>
  );
};

type Scene15sType = 'AgentEscape' | 'ActionLoop' | 'KitchenAnalogy' | 'MissingEggs';

export const EditorialScene15s: React.FC<{type: Scene15sType}> = ({type}) => {
  switch (type) {
    case 'AgentEscape':
      return <AgentEscape15s />;
    case 'ActionLoop':
      return <ActionLoop15s />;
    case 'KitchenAnalogy':
      return <KitchenAnalogy15s />;
    case 'MissingEggs':
      return <MissingEggs15s />;
    default:
      return <Frame15s index="PLANNED"><div style={{fontSize: 80}}>Scene awaiting review</div></Frame15s>;
  }
};
