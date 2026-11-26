export type OpeningPlan =
  | {mode: 'intro-first'}
  | {mode: 'thesis-first'; coldOpenFrames: number};

export type TimelineSlice = {
  kind: 'content' | 'intro' | 'outro';
  from: number;
  duration: number;
  segmentIndex?: number;
  segmentOffset?: number;
  contentOffset?: number;
};

/** Keeps narration in order while allowing its opening passage before the bumper. */
export function buildEpisodeTimeline(segmentFrames: number[], introFrames: number, outroFrames: number, opening: OpeningPlan): TimelineSlice[] {
  if (!segmentFrames.length || segmentFrames.some(n => !Number.isInteger(n) || n <= 0)) throw new Error('Invalid narration segments');
  if (!Number.isInteger(introFrames) || introFrames < 0 || !Number.isInteger(outroFrames) || outroFrames < 0) throw new Error('Invalid bumper duration');
  const cold = opening.mode === 'thesis-first' ? opening.coldOpenFrames : 0;
  if (!Number.isInteger(cold) || (opening.mode === 'thesis-first' && cold <= 0) || cold >= segmentFrames[0]) throw new Error('Cold open must end inside the first narration segment');
  const slices: TimelineSlice[] = [];
  if (cold) slices.push({kind: 'content', from: 0, duration: cold, segmentIndex: 0, segmentOffset: 0, contentOffset: 0});
  slices.push({kind: 'intro', from: cold, duration: introFrames});
  let cursor = cold + introFrames;
  let contentOffset = cold;
  for (let index = 0; index < segmentFrames.length; index++) {
    const offset = index === 0 ? cold : 0;
    const duration = segmentFrames[index] - offset;
    slices.push({kind: 'content', from: cursor, duration, segmentIndex: index, segmentOffset: offset, contentOffset});
    cursor += duration;
    contentOffset += duration;
  }
  slices.push({kind: 'outro', from: cursor, duration: outroFrames});
  return slices;
}

export function contentFrameToEpisodeFrame(frame: number, slices: TimelineSlice[]): number {
  const slice = slices.find(s => s.kind === 'content' && frame >= s.contentOffset! && frame < s.contentOffset! + s.duration);
  if (!slice) throw new Error(`Content frame outside timeline: ${frame}`);
  return slice.from + frame - slice.contentOffset!;
}
