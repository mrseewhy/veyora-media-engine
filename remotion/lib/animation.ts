import {Easing, interpolate, spring} from 'remotion';

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const clamp01 = (value: number) => clamp(value, 0, 1);

export const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

export const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

export const easeOutExpo = (value: number) =>
  value === 1 ? 1 : 1 - 2 ** (-10 * value);

export const progress = (frame: number, start: number, duration: number) =>
  clamp01((frame - start) / Math.max(1, duration));

export function mix(
  frame: number,
  inputRange: number[],
  outputRange: number[],
  easing: (value: number) => number = easeOutCubic,
): number {
  return interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

export function springIn(
  frame: number,
  fps: number,
  delay: number,
  config: {damping?: number; stiffness?: number; mass?: number} = {},
): number {
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {
      damping: config.damping ?? 24,
      stiffness: config.stiffness ?? 140,
      mass: config.mass ?? 0.8,
    },
  });
}

export interface Entrance {
  opacity: number;
  transform: string;
}

export function entrance(
  frame: number,
  fps: number,
  delay: number,
  options: {distance?: number; direction?: 'up' | 'down' | 'left' | 'right'} = {},
): Entrance {
  const amount = springIn(frame, fps, delay);
  const distance = options.distance ?? 24;
  const direction = options.direction ?? 'up';
  const axis =
    direction === 'left' || direction === 'right'
      ? `translateX(${(1 - amount) * (direction === 'left' ? -distance : distance)}px)`
      : `translateY(${(1 - amount) * (direction === 'up' ? distance : -distance)}px)`;
  return {
    opacity: clamp01(amount),
    transform: `translate3d(0, 0, 0) ${axis}`,
  };
}

export function exitOpacity(
  frame: number,
  durationInFrames: number,
  exitFrames: number,
): number {
  return clamp01((durationInFrames - frame) / Math.max(1, exitFrames));
}

export function formatMs(ms: number): string {
  return Math.round(ms).toLocaleString('en-US');
}

export function formatSeconds(ms: number, digits = 2): string {
  return (ms / 1000).toFixed(digits);
}

export function formatCompact(ms: number): {value: string; unit: string} {
  if (ms >= 1000) return {value: formatSeconds(ms), unit: 's'};
  return {value: formatMs(ms), unit: 'ms'};
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase();
}

export function highlightParts(
  text: string,
  emphasis: string[] = [],
): Array<{text: string; emphasis: boolean}> {
  const phrases = emphasis
    .filter((phrase) => phrase.trim().length > 0)
    .sort((a, b) => b.length - a.length);
  if (phrases.length === 0) return [{text, emphasis: false}];
  const escaped = phrases.map((phrase) =>
    phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const matcher = new RegExp(`(${escaped.join('|')})`, 'gi');
  return text
    .split(matcher)
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      emphasis: phrases.some(
        (phrase) => phrase.toLowerCase() === part.toLowerCase(),
      ),
    }));
}

export {Easing};
