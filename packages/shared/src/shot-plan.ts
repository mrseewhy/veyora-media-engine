export interface ExecutableShot {
  shotId: string;
  actId: string;
  startFrame: number;
  endFrame: number;
  subject: string;
  visualIntent: string;
  startState: string;
  action: string;
  endState: string;
  assetIds: string[];
  sourceAndRights: string;
}

export interface ShotPlanReport { errors: string[]; warnings: string[] }

/** Validate the edit decision list against the locked audio timeline. */
export function validateShotPlan(shots: ExecutableShot[], segmentIds: string[], segmentFrames: number[], introFrames = 150): ShotPlanReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  let cursor = introFrames;
  const seen = new Set<string>();
  if (segmentIds.length !== segmentFrames.length) errors.push('Audio segment count mismatch');
  for (const shot of shots) {
    if (seen.has(shot.shotId)) errors.push(`${shot.shotId}: duplicate ID`);
    seen.add(shot.shotId);
    if (shot.startFrame !== cursor || shot.endFrame <= shot.startFrame) errors.push(`${shot.shotId}: gap, overlap or empty shot at frame ${cursor}`);
    cursor = shot.endFrame;
    if (!segmentIds.includes(shot.actId)) errors.push(`${shot.shotId}: unknown act`);
    if (!shot.subject || !shot.visualIntent || !shot.action || !shot.assetIds?.length || !shot.sourceAndRights) errors.push(`${shot.shotId}: incomplete production instruction`);
    if (/^unrevealed shot-specific subject$/i.test(shot.startState) || /^subject or process visibly changed$/i.test(shot.endState)) errors.push(`${shot.shotId}: generic state description cannot drive an action shot`);
  }
  const expected = introFrames + segmentFrames.reduce((a, b) => a + b, 0);
  if (cursor !== expected) errors.push(`Shot coverage ends at ${cursor}; audio ends at ${expected}`);
  for (let i = 0, start = introFrames; i < segmentIds.length; start += segmentFrames[i], i++) {
    const end = start + segmentFrames[i];
    if (!shots.some(s => s.actId === segmentIds[i] && s.startFrame === start) || !shots.some(s => s.actId === segmentIds[i] && s.endFrame === end)) errors.push(`${segmentIds[i]}: shot boundaries do not match narration`);
  }
  const counts = new Map<string, number>();
  for (const shot of shots) counts.set(shot.subject, (counts.get(shot.subject) ?? 0) + 1);
  for (const [subject, count] of counts) if (count > 2) warnings.push(`Repeated visual subject ${subject}: ${count} shots`);
  if (shots.length && shots.filter(s => /locked composition/i.test((s as ExecutableShot & {camera?: string}).camera ?? '')).length / shots.length > 0.5) errors.push('More than half the shots use locked compositions');
  return {errors, warnings};
}
