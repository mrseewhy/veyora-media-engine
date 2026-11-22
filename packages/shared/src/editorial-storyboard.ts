import type {
  BrandConfig, CaptionCue, JourneyTemplate, ReviewState, VideoFormat,
} from './storyboard.js';

const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;
const VIDEO_FPS = 30;

export type EditorialSceneType =
  | 'ComicChat' | 'AgentEscape' | 'KitchenAnalogy' | 'ActionLoop'
  | 'MissingEggs' | 'CodeTerminal' | 'DiagramFlow' | 'ScreenDemo'
  | 'ComicFailure' | 'BrandOutro';

export interface EditorialScene {
  id: string;
  beatId: string;
  startMs: number;
  durationMs: number;
  type: EditorialSceneType;
  visualPurpose: string;
  assetIds: string[];
  status: 'implemented' | 'planned';
}

export interface EditorialStoryboard {
  schemaVersion: 1;
  episodeId: string;
  storyboardVersion: number;
  journeyTemplate: JourneyTemplate;
  format: VideoFormat;
  brand: BrandConfig;
  review: {status: ReviewState; notes: string[]};
  narration: {
    provider: string;
    voice: string;
    previewAudioPath: string;
    previewText: string;
    captions: CaptionCue[];
  };
  beats: Array<{
    id: string; startMs: number; durationMs: number; intent: string; script: string;
  }>;
  scenes: EditorialScene[];
  assets: Array<{
    id: string; kind: string; source: string; creator: string; license: string; usage: string;
  }>;
}

const types = new Set<EditorialSceneType>([
  'ComicChat', 'AgentEscape', 'KitchenAnalogy', 'ActionLoop', 'MissingEggs',
  'CodeTerminal', 'DiagramFlow', 'ScreenDemo', 'ComicFailure', 'BrandOutro',
]);
const normalized = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Strict preflight for the 100-second editorial timeline and opening preview. */
export function validateEditorialStoryboard(value: unknown): EditorialStoryboard {
  const s = value as EditorialStoryboard;
  const issues: string[] = [];
  if (!s || typeof s !== 'object') throw new Error('Storyboard must be an object');
  if (s.schemaVersion !== 1 || !s.episodeId || s.storyboardVersion < 1) issues.push('Invalid storyboard identity');
  if (s.format?.width !== VIDEO_WIDTH || s.format.height !== VIDEO_HEIGHT || s.format.fps !== VIDEO_FPS || s.format.durationMs !== 100000) issues.push('Expected 1920x1080, 30 fps, 100 seconds');
  if (!s.brand?.name || !s.brand.tagline || !s.brand.accent) issues.push('Brand is incomplete');
  if (!s.narration?.previewText || !s.narration.previewAudioPath || s.narration.provider !== 'gemini-flash-tts') issues.push('Preview narration is incomplete');
  if (!Array.isArray(s.beats) || !Array.isArray(s.scenes) || !Array.isArray(s.assets)) issues.push('Beats, scenes and assets are required');
  if (issues.length) throw new Error(issues.join('; '));
  const coverage = (items: Array<{id: string; startMs: number; durationMs: number}>, label: string) => {
    let at = 0;
    const ids = new Set<string>();
    for (const item of items) {
      if (!item.id || ids.has(item.id)) issues.push(`${label}: invalid or duplicate id`);
      ids.add(item.id);
      if (!Number.isInteger(item.startMs) || !Number.isInteger(item.durationMs) || item.durationMs <= 0 || item.startMs !== at) issues.push(`${label} ${item.id}: gap, overlap or invalid timing`);
      at = item.startMs + item.durationMs;
    }
    if (at !== 100000) issues.push(`${label}: expected 100000 ms coverage, got ${at}`);
  };
  coverage(s.beats, 'beats');
  coverage(s.scenes, 'scenes');
  const beatIds = new Set(s.beats.map(b => b.id));
  const assetIds = new Set(s.assets.map(a => a.id));
  for (const b of s.beats) if (!b.intent || !b.script) issues.push(`beat ${b.id}: missing intent or script`);
  for (const scene of s.scenes) {
    if (!types.has(scene.type) || !beatIds.has(scene.beatId) || !scene.visualPurpose) issues.push(`scene ${scene.id}: invalid type, beat or purpose`);
    const beat = s.beats.find(b => b.id === scene.beatId)!;
    if (scene.startMs < beat.startMs || scene.startMs + scene.durationMs > beat.startMs + beat.durationMs) issues.push(`scene ${scene.id}: outside beat`);
    if (scene.assetIds.some(id => !assetIds.has(id))) issues.push(`scene ${scene.id}: undeclared asset`);
    if (scene.startMs < 30000 && scene.status !== 'implemented') issues.push(`scene ${scene.id}: preview scene is not implemented`);
    if (scene.startMs >= 30000 && scene.status !== 'implemented' && scene.status !== 'planned') issues.push(`scene ${scene.id}: invalid status`);
  }
  for (const a of s.assets) if (!a.id || !a.source || !a.creator || !a.license || !a.usage) issues.push(`asset ${a.id}: missing provenance`);
  if (normalized(s.beats.slice(0, 2).map(b => b.script).join(' ')) !== normalized(s.narration.previewText)) issues.push('Preview narration differs from opening beats');
  let last = 0;
  for (const c of s.narration.captions) {
    if (c.startMs < last || c.endMs <= c.startMs || c.endMs > 100000) issues.push(`caption ${c.id}: invalid timing`);
    if (c.emphasis?.some(e => !normalized(c.text).includes(normalized(e)))) issues.push(`caption ${c.id}: invalid emphasis`);
    last = c.endMs;
  }
  if (normalized(s.narration.captions.filter(c => c.startMs < 30000).map(c => c.text).join(' ')) !== normalized(s.narration.previewText)) issues.push('Captions do not cover narration');
  if (issues.length) throw new Error(issues.join('\n'));
  return s;
}
