/**
 * Visual Director preflight. This validates a proposed visual edit before rendering.
 * It deliberately does not claim that metadata proves a video is creatively good.
 */
export type VisualIntent = 'show_person' | 'show_location' | 'show_object' | 'show_process' | 'show_evidence' | 'show_interface' | 'contrast' | 'mood_transition' | 'brief_typography';
export type VisualMode = 'licensed_photo' | 'licensed_footage' | 'original_recording' | 'screenshot' | 'original_illustration' | 'ai_image' | 'ai_video' | 'motion_graphic' | 'data_diagram' | 'kinetic_type';
export type RightsStatus = 'cleared' | 'pending_review' | 'rejected';
export interface DirectedAsset {
  id: string;
  uri?: string;
  sourceUrl?: string;
  creator: string;
  license: string;
  rights: RightsStatus;
  synthetic: boolean;
  factualReview: 'approved' | 'pending' | 'rejected';
  costApproved: boolean;
}
export interface DirectedShot {
  id: string;
  beatId: string;
  startMs: number;
  endMs: number;
  narrationQuote: string;
  intent: VisualIntent;
  modes: VisualMode[];
  subject: string;
  action: string;
  composition: string;
  camera: string;
  transition: string;
  assetIds: string[];
  landscape: string;
  portrait: string;
  square: string;
  truthfulnessNote: string;
  review: 'approved' | 'proposed' | 'rejected';
}
export interface DirectedEpisode {
  schemaVersion: 1;
  channelId: string;
  seriesId: string;
  episodeId: string;
  configVersion: string;
  narrationAssetId: string;
  narrationLocked: true;
  durationMs: number;
  shots: DirectedShot[];
  assets: DirectedAsset[];
  humanReview: 'approved' | 'pending' | 'rejected';
}
export interface DirectorReport {readyToRender: boolean; readyToPublish: boolean; blockers: string[]; warnings: string[]}
const intents = new Set<VisualIntent>(['show_person','show_location','show_object','show_process','show_evidence','show_interface','contrast','mood_transition','brief_typography']);
const modes = new Set<VisualMode>(['licensed_photo','licensed_footage','original_recording','screenshot','original_illustration','ai_image','ai_video','motion_graphic','data_diagram','kinetic_type']);
const meaningful = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0;
export function validateDirectedEpisode(input: DirectedEpisode): DirectorReport {
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!input || input.schemaVersion !== 1 || !meaningful(input.channelId) || !meaningful(input.seriesId) || !meaningful(input.episodeId) || !meaningful(input.configVersion)) {
    return {readyToRender:false, readyToPublish:false, blockers:['Invalid episode identity/schema'], warnings};
  }
  if (!input.narrationLocked || !meaningful(input.narrationAssetId)) blockers.push('Approved narration must be locked and identified');
  if (!Number.isInteger(input.durationMs) || input.durationMs <= 0) blockers.push('Invalid narration duration');
  if (!Array.isArray(input.shots) || input.shots.length === 0) blockers.push('No directed shots');
  if (!Array.isArray(input.assets)) blockers.push('No asset manifest');
  const assets = new Map((input.assets ?? []).map(a => [a.id, a]));
  if (assets.size !== (input.assets ?? []).length) blockers.push('Duplicate asset IDs');
  let cursor = 0;
  const ids = new Set<string>();
  let typographyMs = 0;
  for (const shot of input.shots ?? []) {
    if (!meaningful(shot.id) || ids.has(shot.id)) blockers.push('Missing/duplicate shot ID');
    ids.add(shot.id);
    if (!Number.isInteger(shot.startMs) || !Number.isInteger(shot.endMs) || shot.startMs !== cursor || shot.endMs <= shot.startMs) blockers.push(`Shot ${shot.id}: invalid, overlapping or missing timing`);
    cursor = shot.endMs;
    if (!meaningful(shot.beatId) || !meaningful(shot.narrationQuote) || !meaningful(shot.subject) || !meaningful(shot.action) || !meaningful(shot.composition) || !meaningful(shot.camera) || !meaningful(shot.transition) || !meaningful(shot.truthfulnessNote)) blockers.push(`Shot ${shot.id}: incomplete visual/narrative direction`);
    if (!intents.has(shot.intent) || !Array.isArray(shot.modes) || !shot.modes.length || shot.modes.some(m => !modes.has(m))) blockers.push(`Shot ${shot.id}: invalid visual intent/mode`);
    if (!meaningful(shot.landscape) || !meaningful(shot.portrait) || !meaningful(shot.square)) blockers.push(`Shot ${shot.id}: missing native aspect-ratio direction`);
    if (!Array.isArray(shot.assetIds) || !shot.assetIds.length) blockers.push(`Shot ${shot.id}: no concrete assets`);
    for (const id of shot.assetIds ?? []) {
      const a = assets.get(id);
      if (!a) {blockers.push(`Shot ${shot.id}: missing asset ${id}`); continue;}
      if (!meaningful(a.uri) || !meaningful(a.creator) || !meaningful(a.license) || a.rights !== 'cleared' || a.factualReview !== 'approved' || !a.costApproved) blockers.push(`Asset ${id}: unavailable, uncleared, unreviewed or unapproved cost`);
      if (a.synthetic && !meaningful(shot.truthfulnessNote)) blockers.push(`Shot ${shot.id}: synthetic asset lacks disclosure assessment`);
    }
    if (shot.intent === 'brief_typography' || shot.modes.every(m => m === 'kinetic_type' || m === 'data_diagram')) typographyMs += shot.endMs - shot.startMs;
    if (shot.review !== 'approved') warnings.push(`Shot ${shot.id}: creative approval pending`);
  }
  if (cursor !== input.durationMs) blockers.push(`Shot coverage ${cursor}ms does not match narration ${input.durationMs}ms`);
  if (input.durationMs > 0 && typographyMs / input.durationMs > 0.3) blockers.push('Presentation-mode risk: over 30% typography/diagram-only shots; revise or explicitly redesign the edit');
  if (input.humanReview !== 'approved') warnings.push('Human creative review is not approved');
  return {readyToRender:blockers.length === 0, readyToPublish:blockers.length === 0 && warnings.length === 0, blockers, warnings};
}
