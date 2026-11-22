/**
 * Storyboard contract for the Remotion renderer.
 *
 * Time is always integer milliseconds in data. Frames are derived only at the
 * render boundary. The contract is deliberately strict: a renderer must never
 * silently invent a scene type, a metric or a caption.
 */

export const STORYBOARD_SCHEMA_VERSION = 1 as const;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 30;

export type JourneyTemplate =
  | 'concept-explainer'
  | 'tool-review'
  | 'comparison'
  | 'tutorial';

export type SceneType = 'ScreenDemo' | 'MetricTimeline' | 'Callout' | 'BrandOutro';

export type MotionPreset =
  | 'push-in'
  | 'focus-network'
  | 'reveal-then-focus'
  | 'freeze-slam'
  | 'static';

export type MotionIntensity = 'subtle' | 'medium' | 'strong';
export type CaptionMode = 'emphasis' | 'plain' | 'none';
export type ReviewState = 'proposed' | 'needs-changes' | 'approved';

export interface VideoFormat {
  width: number;
  height: number;
  fps: number;
  durationMs: number;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  accent: string;
}

export interface CaptionCue {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  emphasis?: string[];
}

export interface NarrationTrack {
  assetId: string;
  text: string;
  /** Path served by Remotion from public/, e.g. generated/latency-narration.wav. */
  audioPath: string;
  /** Project-relative source path used by the asset-preparation script. */
  sourcePath: string;
  provider: string;
  voice: string;
  durationMs: number;
  startMs: number;
  measured: boolean;
  captions: CaptionCue[];
}

export interface LatencyEvidence {
  id: string;
  kind: 'latency-measurement';
  endpoint: string;
  method: string;
  measuredAt: string;
  runs: number;
  ttftMs: number;
  totalMs: number;
  /** True only when the timing values themselves are fabricated. */
  simulated: boolean;
  /** True when the assistant interface is an authored simulation. */
  uiSimulated: boolean;
  disclosure: string;
  methodology?: string;
  environment?: {
    node: string;
    platform: string;
    arch: string;
  };
}

export interface Beat {
  id: string;
  intent: string;
  startMs: number;
  durationMs: number;
  narration?: {
    startMs: number;
    endMs: number;
    captionIds: string[];
  } | null;
}

interface BaseScene {
  id: string;
  beatId: string;
  startMs: number;
  durationMs: number;
  motion: {
    preset: MotionPreset;
    intensity: MotionIntensity;
  };
  caption: {
    mode: CaptionMode;
    safeArea: boolean;
    cueIds: string[];
  };
  review: ReviewState;
}

export interface ScreenDemoVisual {
  variant: 'assistant-with-network';
  title: string;
  url: string;
  userPrompt: string;
  assistantText: string;
  uiReadyMs: number;
  revealNetworkAtMs: number;
  measurementId: string;
  disclosure: string;
}

export interface ScreenDemoScene extends BaseScene {
  type: 'ScreenDemo';
  visual: ScreenDemoVisual;
}

export interface MetricTimelineVisual {
  measurementId: string;
  unit: 'ms';
  uiPerceivedMs: number;
  disclosure: string;
  labels: {
    request: string;
    firstToken: string;
    complete: string;
    ui: string;
    api: string;
    gap: string;
  };
}

export interface MetricTimelineScene extends BaseScene {
  type: 'MetricTimeline';
  visual: MetricTimelineVisual;
}

export interface CalloutVisual {
  headline: string;
  subheadline: string;
  measurementId: string;
  detail: string;
  disclosure: string;
  tone: 'lime' | 'cyan' | 'coral';
}

export interface CalloutScene extends BaseScene {
  type: 'Callout';
  visual: CalloutVisual;
}

export interface BrandOutroVisual {
  headline: string;
  tagline: string;
}

export interface BrandOutroScene extends BaseScene {
  type: 'BrandOutro';
  visual: BrandOutroVisual;
}

export type StoryboardScene =
  | ScreenDemoScene
  | MetricTimelineScene
  | CalloutScene
  | BrandOutroScene;

export interface Storyboard {
  schemaVersion: 1;
  episodeId: string;
  storyboardVersion: number;
  journeyTemplate: JourneyTemplate;
  format: VideoFormat;
  brand: BrandConfig;
  narration: NarrationTrack;
  evidence: LatencyEvidence[];
  beats: Beat[];
  scenes: StoryboardScene[];
  review: {
    status: ReviewState;
    notes: string[];
  };
}

export class StoryboardValidationError extends Error {
  readonly issues: string[];
  constructor(issues: string[]) {
    super(`Invalid storyboard:\n- ${issues.join('\n- ')}`);
    this.name = 'StoryboardValidationError';
    this.issues = issues;
  }
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const SCENE_TYPES: SceneType[] = [
  'ScreenDemo',
  'MetricTimeline',
  'Callout',
  'BrandOutro',
];
const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  'concept-explainer',
  'tool-review',
  'comparison',
  'tutorial',
];
const MOTION_PRESETS: MotionPreset[] = [
  'push-in',
  'focus-network',
  'reveal-then-focus',
  'freeze-slam',
  'static',
];
const MOTION_INTENSITIES: MotionIntensity[] = ['subtle', 'medium', 'strong'];
const CAPTION_MODES: CaptionMode[] = ['emphasis', 'plain', 'none'];
const REVIEW_STATES: ReviewState[] = ['proposed', 'needs-changes', 'approved'];
const TONES = ['lime', 'cyan', 'coral'] as const;

function validateCoverage(
  items: Array<{ id: string; startMs: number; durationMs: number }>,
  totalMs: number,
  label: string,
  issues: string[],
) {
  const ids = new Set<string>();
  let cursor = 0;
  for (const item of items) {
    if (!isNonEmptyString(item.id)) {
      issues.push(`${label} has an empty id`);
      continue;
    }
    if (ids.has(item.id)) issues.push(`${label} id "${item.id}" is duplicated`);
    ids.add(item.id);
    if (!isInteger(item.startMs) || item.startMs < 0) {
      issues.push(`${label} "${item.id}" has an invalid startMs`);
    }
    if (!isInteger(item.durationMs) || item.durationMs <= 0) {
      issues.push(`${label} "${item.id}" has an invalid durationMs`);
    }
    if (isInteger(item.startMs) && item.startMs !== cursor) {
      issues.push(
        `${label} "${item.id}" starts at ${item.startMs}ms; expected ${cursor}ms (gap or overlap)`,
      );
    }
    cursor += isInteger(item.durationMs) ? item.durationMs : 0;
  }
  if (cursor !== totalMs) {
    issues.push(`${label} coverage ends at ${cursor}ms; expected ${totalMs}ms`);
  }
}

function validateCaptionCue(
  cue: unknown,
  index: number,
  narration: NarrationTrack,
  issues: string[],
) {
  const path = `narration.captions[${index}]`;
  if (!isRecord(cue)) {
    issues.push(`${path} must be an object`);
    return;
  }
  if (!isNonEmptyString(cue.id)) issues.push(`${path}.id is required`);
  if (!isNonEmptyString(cue.text)) issues.push(`${path}.text is required`);
  if (!isInteger(cue.startMs) || !isInteger(cue.endMs)) {
    issues.push(`${path} must use integer millisecond timing`);
  } else {
    if (cue.startMs < 0 || cue.endMs <= cue.startMs) {
      issues.push(`${path} has an invalid time range`);
    }
    if (cue.endMs > narration.startMs + narration.durationMs + 250) {
      issues.push(`${path} ends after the narration track`);
    }
    if (cue.startMs < narration.startMs - 250) {
      issues.push(`${path} starts before the narration track`);
    }
  }
  if (cue.emphasis !== undefined) {
    if (
      !Array.isArray(cue.emphasis) ||
      cue.emphasis.some((word) => !isNonEmptyString(word))
    ) {
      issues.push(`${path}.emphasis must be an array of non-empty strings`);
    } else if (isNonEmptyString(cue.text)) {
      const normalizedCue = normalizeText(cue.text);
      for (const phrase of cue.emphasis) {
        if (!normalizedCue.includes(normalizeText(phrase))) {
          issues.push(
            `${path}.emphasis phrase "${phrase}" does not occur in its caption`,
          );
        }
      }
    }
  }
}

/**
 * Validate an unknown value and return a narrowed Storyboard. Collects all
 * issues so the CLI can report every problem in one pass.
 */
export function validateStoryboard(value: unknown): Storyboard {
  const issues: string[] = [];
  if (!isRecord(value)) {
    throw new StoryboardValidationError(['storyboard must be a JSON object']);
  }

  if (value.schemaVersion !== STORYBOARD_SCHEMA_VERSION) {
    issues.push(`schemaVersion must be ${STORYBOARD_SCHEMA_VERSION}`);
  }
  if (!isNonEmptyString(value.episodeId)) issues.push('episodeId is required');
  if (!isInteger(value.storyboardVersion) || (value.storyboardVersion as number) < 1) {
    issues.push('storyboardVersion must be an integer >= 1');
  }
  if (!JOURNEY_TEMPLATES.includes(value.journeyTemplate as JourneyTemplate)) {
    issues.push(`journeyTemplate must be one of ${JOURNEY_TEMPLATES.join(', ')}`);
  }

  // Format
  if (!isRecord(value.format)) {
    issues.push('format is required');
  } else {
    const format = value.format;
    if (format.width !== VIDEO_WIDTH) issues.push(`format.width must be ${VIDEO_WIDTH}`);
    if (format.height !== VIDEO_HEIGHT) issues.push(`format.height must be ${VIDEO_HEIGHT}`);
    if (format.fps !== VIDEO_FPS) issues.push(`format.fps must be ${VIDEO_FPS}`);
    if (!isInteger(format.durationMs) || (format.durationMs as number) <= 0) {
      issues.push('format.durationMs must be a positive integer');
    }
  }
  const durationMs = isRecord(value.format) && isInteger(value.format.durationMs)
    ? (value.format.durationMs as number)
    : 0;

  // Brand
  if (!isRecord(value.brand)) {
    issues.push('brand is required');
  } else {
    if (!isNonEmptyString(value.brand.name)) issues.push('brand.name is required');
    if (!isNonEmptyString(value.brand.tagline)) issues.push('brand.tagline is required');
    if (!isNonEmptyString(value.brand.accent)) issues.push('brand.accent is required');
  }

  // Narration
  let narration: NarrationTrack | null = null;
  if (!isRecord(value.narration)) {
    issues.push('narration is required');
  } else {
    const n = value.narration;
    if (!isNonEmptyString(n.assetId)) issues.push('narration.assetId is required');
    if (!isNonEmptyString(n.text)) issues.push('narration.text is required');
    if (!isNonEmptyString(n.audioPath)) issues.push('narration.audioPath is required');
    if (!isNonEmptyString(n.sourcePath)) issues.push('narration.sourcePath is required');
    if (!isNonEmptyString(n.provider)) issues.push('narration.provider is required');
    if (!isNonEmptyString(n.voice)) issues.push('narration.voice is required');
    if (typeof n.measured !== 'boolean') issues.push('narration.measured must be boolean');
    if (!isInteger(n.durationMs) || (n.durationMs as number) <= 0) {
      issues.push('narration.durationMs must be a positive integer');
    }
    if (!isInteger(n.startMs) || (n.startMs as number) < 0) {
      issues.push('narration.startMs must be a non-negative integer');
    }
    if (
      isInteger(n.startMs) &&
      isInteger(n.durationMs) &&
      (n.startMs as number) + (n.durationMs as number) > durationMs
    ) {
      issues.push('narration must fit inside format.durationMs');
    }
    if (!Array.isArray(n.captions) || n.captions.length === 0) {
      issues.push('narration.captions must contain at least one cue');
    } else {
      const cueIds = new Set<string>();
      let previousEnd = -1;
      for (let index = 0; index < n.captions.length; index += 1) {
        const cue = n.captions[index];
        validateCaptionCue(
          cue,
          index,
          {
            ...(n as unknown as NarrationTrack),
            captions: [],
          },
          issues,
        );
        if (isRecord(cue)) {
          if (isNonEmptyString(cue.id)) {
            if (cueIds.has(cue.id)) issues.push(`caption id "${cue.id}" is duplicated`);
            cueIds.add(cue.id);
          }
          if (isInteger(cue.startMs) && isInteger(cue.endMs)) {
            if ((cue.startMs as number) < previousEnd) {
              issues.push(`caption "${String(cue.id)}" overlaps the previous cue`);
            }
            previousEnd = cue.endMs as number;
          }
        }
      }
      const captionText = n.captions
        .filter(isRecord)
        .map((cue) => (typeof cue.text === 'string' ? cue.text : ''))
        .join(' ');
      if (
        isNonEmptyString(n.text) &&
        normalizeText(captionText) !== normalizeText(n.text)
      ) {
        issues.push(
          'caption text must cover the narration exactly (whitespace/punctuation insensitive)',
        );
      }
      narration = n as unknown as NarrationTrack;
    }
  }

  // Evidence
  const evidence: LatencyEvidence[] = [];
  if (!Array.isArray(value.evidence) || value.evidence.length === 0) {
    issues.push('evidence must contain at least one latency measurement');
  } else {
    const evidenceIds = new Set<string>();
    for (let index = 0; index < value.evidence.length; index += 1) {
      const entry = value.evidence[index];
      const path = `evidence[${index}]`;
      if (!isRecord(entry)) {
        issues.push(`${path} must be an object`);
        continue;
      }
      if (entry.kind !== 'latency-measurement') {
        issues.push(`${path}.kind must be latency-measurement`);
      }
      if (!isNonEmptyString(entry.id)) issues.push(`${path}.id is required`);
      if (isNonEmptyString(entry.id)) {
        if (evidenceIds.has(entry.id)) issues.push(`evidence id "${entry.id}" is duplicated`);
        evidenceIds.add(entry.id);
      }
      if (!isNonEmptyString(entry.endpoint)) issues.push(`${path}.endpoint is required`);
      if (!isNonEmptyString(entry.method)) issues.push(`${path}.method is required`);
      if (!isNonEmptyString(entry.measuredAt) || Number.isNaN(Date.parse(String(entry.measuredAt)))) {
        issues.push(`${path}.measuredAt must be an ISO date`);
      }
      if (!isInteger(entry.runs) || (entry.runs as number) < 1) {
        issues.push(`${path}.runs must be an integer >= 1`);
      }
      if (!isFiniteNumber(entry.ttftMs) || (entry.ttftMs as number) <= 0) {
        issues.push(`${path}.ttftMs must be positive`);
      }
      if (!isFiniteNumber(entry.totalMs) || (entry.totalMs as number) <= 0) {
        issues.push(`${path}.totalMs must be positive`);
      }
      if (
        isFiniteNumber(entry.ttftMs) &&
        isFiniteNumber(entry.totalMs) &&
        (entry.ttftMs as number) >= (entry.totalMs as number)
      ) {
        issues.push(`${path}.ttftMs must be smaller than totalMs`);
      }
      if (typeof entry.simulated !== 'boolean') issues.push(`${path}.simulated must be boolean`);
      if (typeof entry.uiSimulated !== 'boolean') {
        issues.push(`${path}.uiSimulated must be boolean`);
      }
      if (!isNonEmptyString(entry.disclosure)) issues.push(`${path}.disclosure is required`);
      if (entry.simulated === true && isNonEmptyString(entry.disclosure)) {
        if (!/simulat/i.test(entry.disclosure)) {
          issues.push(`${path}.disclosure must say "simulated" when timing is simulated`);
        }
      }
      evidence.push(entry as unknown as LatencyEvidence);
    }
  }

  // Beats
  if (!Array.isArray(value.beats) || value.beats.length === 0) {
    issues.push('beats must contain at least one beat');
  } else {
    const beatIds = new Set<string>();
    const beats = value.beats.filter(isRecord);
    validateCoverage(
      beats as Array<{ id: string; startMs: number; durationMs: number }>,
      durationMs,
      'beats',
      issues,
    );
    for (const beat of beats) {
      if (!isNonEmptyString(beat.id)) issues.push('beat id is required');
      if (isNonEmptyString(beat.id)) {
        if (beatIds.has(beat.id)) issues.push(`beat id "${beat.id}" is duplicated`);
        beatIds.add(beat.id);
      }
      if (!isNonEmptyString(beat.intent)) issues.push(`beat "${String(beat.id)}" needs an intent`);
      if (beat.narration !== undefined && beat.narration !== null) {
        if (!isRecord(beat.narration)) {
          issues.push(`beat "${String(beat.id)}".narration must be an object or null`);
        } else {
          const start = beat.narration.startMs;
          const end = beat.narration.endMs;
          if (!isInteger(start) || !isInteger(end) || (end as number) <= (start as number)) {
            issues.push(`beat "${String(beat.id)}".narration has an invalid range`);
          } else if (
            isInteger(beat.startMs) &&
            isInteger(beat.durationMs) &&
            ((start as number) < (beat.startMs as number) ||
              (end as number) > (beat.startMs as number) + (beat.durationMs as number))
          ) {
            issues.push(`beat "${String(beat.id)}".narration must sit inside the beat`);
          }
          if (!Array.isArray(beat.narration.captionIds)) {
            issues.push(
              `beat "${String(beat.id)}".narration.captionIds must be an array`,
            );
          } else {
            for (const captionId of beat.narration.captionIds) {
              if (!isNonEmptyString(captionId)) {
                issues.push(
                  `beat "${String(beat.id)}".narration has an empty caption id`,
                );
                continue;
              }
              const cue = narration?.captions.find((item) => item.id === captionId);
              if (!cue) {
                issues.push(
                  `beat "${String(beat.id)}".narration references unknown caption "${captionId}"`,
                );
                continue;
              }
              if (
                isInteger(start) &&
                isInteger(end) &&
                (cue.startMs < (start as number) || cue.endMs > (end as number))
              ) {
                issues.push(
                  `beat "${String(beat.id)}".narration range must cover caption "${captionId}"`,
                );
              }
            }
          }
        }
      }
    }
  }

  // Scenes
  const scenes: StoryboardScene[] = [];
  if (!Array.isArray(value.scenes) || value.scenes.length === 0) {
    issues.push('scenes must contain at least one scene');
  } else {
    const sceneIds = new Set<string>();
    const sceneRecords = value.scenes.filter(isRecord);
    validateCoverage(
      sceneRecords as Array<{ id: string; startMs: number; durationMs: number }>,
      durationMs,
      'scenes',
      issues,
    );
    const beatIds = new Set(
      Array.isArray(value.beats)
        ? value.beats.filter(isRecord).map((beat) => beat.id).filter(isNonEmptyString)
        : [],
    );
    const evidenceIds = new Set(evidence.map((entry) => entry.id));
    const cueIds = new Set(
      narration?.captions?.filter((cue) => isNonEmptyString(cue.id)).map((cue) => cue.id) ?? [],
    );
    const referencedCues = new Set<string>();

    for (let index = 0; index < value.scenes.length; index += 1) {
      const scene = value.scenes[index];
      const path = `scenes[${index}]`;
      if (!isRecord(scene)) {
        issues.push(`${path} must be an object`);
        continue;
      }
      if (!isNonEmptyString(scene.id)) issues.push(`${path}.id is required`);
      if (isNonEmptyString(scene.id)) {
        if (sceneIds.has(scene.id)) issues.push(`scene id "${scene.id}" is duplicated`);
        sceneIds.add(scene.id);
      }
      if (!SCENE_TYPES.includes(scene.type as SceneType)) {
        issues.push(`${path}.type must be one of ${SCENE_TYPES.join(', ')}`);
      }
      if (!isNonEmptyString(scene.beatId) || !beatIds.has(scene.beatId as string)) {
        issues.push(`${path}.beatId must reference a declared beat`);
      }
      const beat = Array.isArray(value.beats)
        ? value.beats.filter(isRecord).find((item) => item.id === scene.beatId)
        : undefined;
      if (
        beat &&
        isInteger(scene.startMs) &&
        isInteger(scene.durationMs) &&
        isInteger(beat.startMs) &&
        isInteger(beat.durationMs) &&
        ((scene.startMs as number) < (beat.startMs as number) ||
          (scene.startMs as number) + (scene.durationMs as number) >
            (beat.startMs as number) + (beat.durationMs as number))
      ) {
        issues.push(`${path} must sit inside its beat`);
      }
      if (!isRecord(scene.motion)) {
        issues.push(`${path}.motion is required`);
      } else {
        if (!MOTION_PRESETS.includes(scene.motion.preset as MotionPreset)) {
          issues.push(`${path}.motion.preset is invalid`);
        }
        if (!MOTION_INTENSITIES.includes(scene.motion.intensity as MotionIntensity)) {
          issues.push(`${path}.motion.intensity is invalid`);
        }
      }
      if (!isRecord(scene.caption)) {
        issues.push(`${path}.caption is required`);
      } else {
        if (!CAPTION_MODES.includes(scene.caption.mode as CaptionMode)) {
          issues.push(`${path}.caption.mode is invalid`);
        }
        if (typeof scene.caption.safeArea !== 'boolean') {
          issues.push(`${path}.caption.safeArea must be boolean`);
        }
        if (!Array.isArray(scene.caption.cueIds)) {
          issues.push(`${path}.caption.cueIds must be an array`);
        } else {
          for (const cueId of scene.caption.cueIds) {
            if (!isNonEmptyString(cueId) || !cueIds.has(cueId)) {
              issues.push(`${path}.caption.cueIds references unknown cue "${String(cueId)}"`);
            } else {
              referencedCues.add(cueId);
            }
          }
          if (scene.caption.mode !== 'none' && scene.caption.cueIds.length === 0) {
            issues.push(`${path}.caption.cueIds cannot be empty when captions are enabled`);
          }
          if (scene.caption.mode === 'none' && scene.caption.cueIds.length > 0) {
            issues.push(`${path}.caption.cueIds must be empty when captions are disabled`);
          }
        }
      }
      if (!REVIEW_STATES.includes(scene.review as ReviewState)) {
        issues.push(`${path}.review is invalid`);
      }

      if (!isRecord(scene.visual)) {
        issues.push(`${path}.visual is required`);
      } else {
        const visual = scene.visual;
        if (scene.type === 'ScreenDemo') {
          if (visual.variant !== 'assistant-with-network') {
            issues.push(`${path}.visual.variant is invalid`);
          }
          for (const key of [
            'title',
            'url',
            'userPrompt',
            'assistantText',
            'disclosure',
          ]) {
            if (!isNonEmptyString(visual[key])) {
              issues.push(`${path}.visual.${key} is required`);
            }
          }
          if (!isFiniteNumber(visual.uiReadyMs) || (visual.uiReadyMs as number) < 0) {
            issues.push(`${path}.visual.uiReadyMs must be a non-negative number`);
          }
          if (
            !isInteger(visual.revealNetworkAtMs) ||
            (visual.revealNetworkAtMs as number) < 0 ||
            (isInteger(scene.durationMs) &&
              (visual.revealNetworkAtMs as number) >= (scene.durationMs as number))
          ) {
            issues.push(`${path}.visual.revealNetworkAtMs must be inside the scene`);
          }
          if (
            !isNonEmptyString(visual.measurementId) ||
            !evidenceIds.has(visual.measurementId)
          ) {
            issues.push(`${path}.visual.measurementId must reference declared evidence`);
          }
        }
        if (scene.type === 'MetricTimeline') {
          if (!isNonEmptyString(visual.measurementId) || !evidenceIds.has(visual.measurementId)) {
            issues.push(`${path}.visual.measurementId must reference declared evidence`);
          }
          if (visual.unit !== 'ms') issues.push(`${path}.visual.unit must be "ms"`);
          if (!isFiniteNumber(visual.uiPerceivedMs) || (visual.uiPerceivedMs as number) < 0) {
            issues.push(`${path}.visual.uiPerceivedMs must be non-negative`);
          }
          if (!isNonEmptyString(visual.disclosure)) {
            issues.push(`${path}.visual.disclosure is required`);
          }
          if (!isRecord(visual.labels)) {
            issues.push(`${path}.visual.labels is required`);
          } else {
            for (const key of ['request', 'firstToken', 'complete', 'ui', 'api', 'gap']) {
              if (!isNonEmptyString(visual.labels[key])) {
                issues.push(`${path}.visual.labels.${key} is required`);
              }
            }
          }
          const measurement = evidence.find((entry) => entry.id === visual.measurementId);
          if (
            measurement &&
            isFiniteNumber(visual.uiPerceivedMs) &&
            (visual.uiPerceivedMs as number) >= measurement.totalMs
          ) {
            issues.push(`${path}.visual.uiPerceivedMs must be smaller than totalMs`);
          }
        }
        if (scene.type === 'Callout') {
          for (const key of [
            'headline',
            'subheadline',
            'detail',
            'disclosure',
          ]) {
            if (!isNonEmptyString(visual[key])) {
              issues.push(`${path}.visual.${key} is required`);
            }
          }
          if (!isNonEmptyString(visual.measurementId) || !evidenceIds.has(visual.measurementId)) {
            issues.push(`${path}.visual.measurementId must reference declared evidence`);
          }
          if (!TONES.includes(visual.tone as (typeof TONES)[number])) {
            issues.push(`${path}.visual.tone is invalid`);
          }
        }
        if (scene.type === 'BrandOutro') {
          if (!isNonEmptyString(visual.headline)) {
            issues.push(`${path}.visual.headline is required`);
          }
          if (!isNonEmptyString(visual.tagline)) {
            issues.push(`${path}.visual.tagline is required`);
          }
        }
      }
      scenes.push(scene as unknown as StoryboardScene);
    }

    if (narration) {
      for (const cue of narration.captions) {
        if (!referencedCues.has(cue.id)) {
          issues.push(`caption "${cue.id}" is not referenced by any scene`);
        }
      }
    }
  }

  if (!isRecord(value.review)) {
    issues.push('review is required');
  } else {
    if (!REVIEW_STATES.includes(value.review.status as ReviewState)) {
      issues.push('review.status is invalid');
    }
    if (
      !Array.isArray(value.review.notes) ||
      value.review.notes.some((note) => !isNonEmptyString(note))
    ) {
      issues.push('review.notes must be an array of strings');
    }
  }

  if (issues.length > 0) throw new StoryboardValidationError(issues);

  return {
    ...(value as unknown as Storyboard),
    narration: narration as NarrationTrack,
    evidence,
    scenes,
  };
}

export function getStoryboardErrors(value: unknown): string[] {
  try {
    validateStoryboard(value);
    return [];
  } catch (error) {
    if (error instanceof StoryboardValidationError) return error.issues;
    throw error;
  }
}

export function resolveMeasurement(
  storyboard: Storyboard,
  measurementId: string,
): LatencyEvidence {
  const measurement = storyboard.evidence.find((entry) => entry.id === measurementId);
  if (!measurement) {
    throw new Error(`Unknown measurement "${measurementId}"`);
  }
  return measurement;
}

export function msToFrame(ms: number, fps: number): number {
  return Math.round((ms / 1000) * fps);
}

export function framesToMs(frames: number, fps: number): number {
  return Math.round((frames / fps) * 1000);
}

function pad(value: number, width = 2): string {
  return String(value).padStart(width, '0');
}

export function formatSrtTime(ms: number): string {
  const safe = Math.max(0, Math.round(ms));
  const hours = Math.floor(safe / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1000);
  const millis = safe % 1000;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
}

export function buildSrt(storyboard: Storyboard): string {
  return storyboard.narration.captions
    .slice()
    .sort((a, b) => a.startMs - b.startMs)
    .map((cue, index) => {
      const text = cue.text.trim();
      return `${index + 1}\n${formatSrtTime(cue.startMs)} --> ${formatSrtTime(
        cue.endMs,
      )}\n${text}\n`;
    })
    .join('\n');
}
