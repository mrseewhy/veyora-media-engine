import React from 'react';
import {theme} from '../theme';

interface BrowserChromeProps {
  url: string;
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const BrowserChrome: React.FC<BrowserChromeProps> = ({
  url,
  title,
  children,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: theme.colors.panel,
        border: `1px solid ${theme.colors.borderStrong}`,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: theme.shadows.window,
        ...style,
      }}
    >
      <div
        style={{
          height: 58,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '0 18px',
          background: '#0A121A',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          {[
            ['#FF6159', 'rgba(255,97,89,0.9)'],
            ['#FFBD2E', 'rgba(255,189,46,0.9)'],
            ['#28C840', 'rgba(40,200,64,0.9)'],
          ].map(([color, background]) => (
            <span
              key={color}
              style={{
                width: 12,
                height: 12,
                borderRadius: 99,
                background,
                border: `1px solid ${color}`,
                boxShadow: `0 0 10px ${background}`,
              }}
            />
          ))}
        </div>

        <div
          style={{
            height: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 15px',
            borderRadius: '9px 9px 0 0',
            background: theme.colors.panel,
            border: `1px solid ${theme.colors.border}`,
            borderBottom: 'none',
            color: theme.colors.text,
            fontFamily: theme.fonts.sans,
            fontSize: 14,
            fontWeight: 600,
            marginTop: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: theme.colors.lime,
            }}
          />
          {title}
        </div>

        <div
          style={{
            flex: 1,
            maxWidth: 650,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '0 13px',
            borderRadius: 8,
            background: '#0E1923',
            border: `1px solid ${theme.colors.border}`,
            marginLeft: 4,
          }}
        >
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
            <rect
              x="1.5"
              y="6"
              width="9"
              height="6.5"
              rx="1.4"
              stroke={theme.colors.textDim}
              strokeWidth="1.2"
            />
            <path
              d="M3.5 6V4.4a2.5 2.5 0 015 0V6"
              stroke={theme.colors.textDim}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 13,
              color: theme.colors.textMuted,
              letterSpacing: 0.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {url}
          </span>
        </div>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 11px',
            borderRadius: 999,
            border: '1px solid rgba(182, 248, 74, 0.3)',
            background: 'rgba(182, 248, 74, 0.06)',
            fontFamily: theme.fonts.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: theme.colors.lime,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: theme.colors.lime,
              boxShadow: '0 0 9px rgba(182,248,74,0.9)',
            }}
          />
          LIVE
        </div>
      </div>

      <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
        {children}
      </div>
    </div>
  );
};
