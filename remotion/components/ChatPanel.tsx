import React from 'react';
import {theme} from '../theme';
import {clamp01, progress} from '../lib/animation';

interface ChatPanelProps {
  userPrompt: string;
  assistantText: string;
  uiReadyMs: number;
  frame: number;
  dimmed?: number;
}

const TypingDots: React.FC<{frame: number}> = ({frame}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 5, height: 22}}>
    {[0, 1, 2].map((index) => {
      const pulse = 0.35 + 0.65 * Math.max(0, Math.sin((frame - index * 4) / 5));
      return (
        <span
          key={index}
          style={{
            width: 7,
            height: 7,
            borderRadius: 99,
            background: theme.colors.cyan,
            opacity: pulse,
          }}
        />
      );
    })}
  </div>
);

export const ChatPanel: React.FC<ChatPanelProps> = ({
  userPrompt,
  assistantText,
  uiReadyMs,
  frame,
  dimmed = 0,
}) => {
  const userIn = progress(frame, 4, 10);
  const typingIn = progress(frame, 12, 5);
  const textProgress = progress(frame, 18, 34);
  const chars = Math.floor(textProgress * assistantText.length);
  const typing = frame < 18;
  const meterProgress = progress(frame, 4, 6);
  const ready = frame >= 10;
  const dim = clamp01(dimmed);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0B141D',
        opacity: 1 - dim * 0.58,
        filter: `saturate(${1 - dim * 0.45})`,
      }}
    >
      <div
        style={{
          height: 66,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 24px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: '#0D1721',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme.colors.lime,
            color: '#08110A',
            fontFamily: theme.fonts.sans,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: -0.4,
          }}
        >
          TP
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <span
            style={{
              fontFamily: theme.fonts.sans,
              fontSize: 17,
              fontWeight: 750,
              color: theme.colors.text,
              letterSpacing: -0.1,
            }}
          >
            ToolPilot Assistant
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: theme.fonts.mono,
              fontSize: 11,
              letterSpacing: 0.9,
              color: theme.colors.textMuted,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: theme.colors.green,
              }}
            />
            ONLINE · STREAMING
          </span>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            fontFamily: theme.fonts.mono,
            fontSize: 10,
            letterSpacing: 1.3,
            color: theme.colors.textDim,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 999,
            padding: '5px 9px',
          }}
        >
          UI SIMULATED
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '26px 30px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 7,
            opacity: userIn,
            transform: `translateY(${(1 - userIn) * 12}px)`,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 10,
              letterSpacing: 1.4,
              color: theme.colors.textDim,
            }}
          >
            YOU
          </span>
          <div
            style={{
              maxWidth: 520,
              padding: '14px 18px',
              borderRadius: '16px 16px 4px 16px',
              background: 'rgba(131, 213, 255, 0.1)',
              border: '1px solid rgba(131, 213, 255, 0.24)',
              color: theme.colors.text,
              fontFamily: theme.fonts.sans,
              fontSize: 19,
              lineHeight: 1.4,
            }}
          >
            {userPrompt}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            opacity: typingIn,
            transform: `translateY(${(1 - typingIn) * 14}px)`,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.colors.lime,
              color: '#08110A',
              fontFamily: theme.fonts.sans,
              fontSize: 10,
              fontWeight: 900,
            }}
          >
            TP
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0}}>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 10,
                letterSpacing: 1.4,
                color: theme.colors.textDim,
              }}
            >
              TOOLPILOT
            </span>
            <div
              style={{
                maxWidth: 620,
                padding: '16px 20px',
                borderRadius: '4px 16px 16px 16px',
                background: '#14212D',
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
                fontFamily: theme.fonts.sans,
                fontSize: 20,
                lineHeight: 1.5,
                minHeight: 58,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {typing ? (
                <TypingDots frame={frame} />
              ) : (
                <span>
                  {assistantText.slice(0, chars)}
                  {chars < assistantText.length ? (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 2,
                        height: 21,
                        marginLeft: 2,
                        verticalAlign: '-3px',
                        background: theme.colors.lime,
                        opacity: Math.floor(frame / 7) % 2 === 0 ? 1 : 0,
                      }}
                    />
                  ) : null}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 10,
                letterSpacing: 1.1,
                color: theme.colors.textDim,
                opacity: chars >= assistantText.length ? 1 : 0,
              }}
            >
              STREAM COMPLETE · 19 CHUNKS
            </span>
          </div>
        </div>
      </div>

      <div style={{padding: '0 30px 16px', flexShrink: 0}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '13px 16px',
            borderRadius: 12,
            background: '#0A131C',
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 10, minWidth: 0}}>
            <span
              style={{
                fontFamily: theme.fonts.sans,
                fontSize: 16,
                color: theme.colors.textDim,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Ask anything…
            </span>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 9,
                letterSpacing: 1,
                color: theme.colors.textDim,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 999,
                padding: '3px 6px',
                flexShrink: 0,
              }}
            >
              DEMO
            </span>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.colors.lime,
              color: '#08110A',
              fontFamily: theme.fonts.sans,
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            ↑
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(182, 248, 74, 0.045)',
            border: '1px solid rgba(182, 248, 74, 0.18)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 9,
            }}
          >
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 10,
                letterSpacing: 1.5,
                color: theme.colors.textMuted,
              }}
            >
              PERCEIVED SPEED
            </span>
            <span
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 10,
                letterSpacing: 1.1,
                color: ready ? theme.colors.lime : theme.colors.textDim,
              }}
            >
              {ready ? `READY · ${(uiReadyMs / 1000).toFixed(2)} s` : 'MEASURING…'}
            </span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.07)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${meterProgress * 100}%`,
                height: '100%',
                borderRadius: 99,
                background: theme.colors.lime,
                boxShadow: '0 0 14px rgba(182,248,74,0.5)',
              }}
            />
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: theme.fonts.sans,
              fontSize: 12,
              color: theme.colors.textDim,
            }}
          >
            Time to a polished first paint. Not time to a finished API response.
          </div>
        </div>
      </div>
    </div>
  );
};
