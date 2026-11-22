import React from 'react';
import {theme} from '../theme';

type Tone = 'lime' | 'coral' | 'muted';

const tones: Record<Tone, {border: string; dot: string; text: string}> = {
  lime: {
    border: 'rgba(182, 248, 74, 0.34)',
    dot: theme.colors.lime,
    text: '#D8F5AE',
  },
  coral: {
    border: 'rgba(255, 125, 113, 0.34)',
    dot: theme.colors.coral,
    text: '#FFB8B1',
  },
  muted: {
    border: theme.colors.border,
    dot: theme.colors.textDim,
    text: theme.colors.textMuted,
  },
};

interface DisclosureProps {
  text: string;
  tone?: Tone;
  style?: React.CSSProperties;
}

export const Disclosure: React.FC<DisclosureProps> = ({
  text,
  tone = 'muted',
  style,
}) => {
  const palette = tones[tone];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        padding: '7px 13px',
        borderRadius: 999,
        border: `1px solid ${palette.border}`,
        background: 'rgba(5, 10, 16, 0.72)',
        fontFamily: theme.fonts.mono,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 1.35,
        textTransform: 'uppercase',
        color: palette.text,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 99,
          background: palette.dot,
          flexShrink: 0,
        }}
      />
      {text}
    </div>
  );
};
