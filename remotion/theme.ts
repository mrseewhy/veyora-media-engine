export const VIDEO_FRAME = {width: 1920, height: 1080} as const;
export const videoSafeArea = {left: 150, right: 150, top: 100, bottom: 100} as const;

/** Safe foreground area. Decorative backgrounds may extend outside these bounds. */
export const foregroundBounds = {
  left: videoSafeArea.left,
  top: videoSafeArea.top,
  right: VIDEO_FRAME.width - videoSafeArea.right,
  bottom: VIDEO_FRAME.height - videoSafeArea.bottom,
} as const;

export const theme = {
  colors: {
    bg: '#070D14',
    bgSoft: '#0A1119',
    panel: '#0D1721',
    panelRaised: '#111D28',
    panelInset: '#0A131C',
    border: '#223343',
    borderStrong: '#334C60',
    grid: 'rgba(131, 213, 255, 0.045)',
    text: '#F3F7FA',
    textMuted: '#93A7B9',
    textDim: '#61778B',
    lime: '#B6F84A',
    limeSoft: '#D7FF9A',
    limeDim: '#6E9E24',
    cyan: '#83D5FF',
    cyanDim: '#3E7F9E',
    coral: '#FF7D71',
    coralDim: '#A9473F',
    amber: '#FFB078',
    green: '#75E7C5',
    white: '#FFFFFF',
    black: '#000000',
    scrim: 'rgba(4, 9, 14, 0.78)',
  },
  fonts: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  shadows: {
    window: '0 48px 140px rgba(0, 0, 0, 0.62), 0 2px 0 rgba(255, 255, 255, 0.04) inset',
    panel: '0 24px 80px rgba(0, 0, 0, 0.38)',
    glowLime: '0 0 42px rgba(182, 248, 74, 0.22)',
    glowCoral: '0 0 42px rgba(255, 125, 113, 0.18)',
  },
} as const;

export type Theme = typeof theme;
