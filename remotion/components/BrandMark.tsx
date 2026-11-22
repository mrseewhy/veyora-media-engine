import React from 'react';
import {theme} from '../theme';

interface BrandMarkProps {
  size?: number;
  subtitle?: boolean;
  color?: string;
  style?: React.CSSProperties;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 26,
  subtitle = false,
  color = theme.colors.text,
  style,
}) => {
  const arrowSize = size * 1.08;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.34,
        ...style,
      }}
    >
      <svg
        width={arrowSize}
        height={arrowSize}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        style={{display: 'block', flexShrink: 0}}
      >
        <path
          d="M6.5 17.5L17.5 6.5M8.5 6.5H17.5V15.5"
          stroke={theme.colors.lime}
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div style={{display: 'flex', flexDirection: 'column', gap: size * 0.06}}>
        <span
          style={{
            fontFamily: theme.fonts.sans,
            fontSize: size,
            fontWeight: 900,
            letterSpacing: size * 0.075,
            lineHeight: 1,
            color,
            whiteSpace: 'nowrap',
          }}
        >
          TOOLPILOT
        </span>
        {subtitle ? (
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: Math.max(10, size * 0.36),
              fontWeight: 400,
              letterSpacing: size * 0.12,
              lineHeight: 1,
              color: theme.colors.textDim,
              whiteSpace: 'nowrap',
            }}
          >
            AI SYSTEMS LAB
          </span>
        ) : null}
      </div>
    </div>
  );
};
