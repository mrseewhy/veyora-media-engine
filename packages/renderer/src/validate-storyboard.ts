import {access, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {
  buildSrt,
  StoryboardValidationError,
  validateStoryboard,
  type Storyboard,
  type StoryboardScene,
} from '../../shared/src/storyboard.js';

export const DEFAULT_STORYBOARD_PATH = 'fixtures/storyboards/toolpilot-latency-10s.json';

const REQUIRED_PUBLIC_ASSETS = [
  'public/fonts/InterVariable.woff2',
  'public/fonts/JetBrainsMono-Regular.woff2',
  'public/fonts/JetBrainsMono-Bold.woff2',
  'public/generated/latency-sfx.wav',
];

const PROOF_SCENE_TYPES: StoryboardScene['type'][] = [
  'ScreenDemo',
  'MetricTimeline',
  'Callout',
];

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export interface PreflightOptions {
  /** The latency proof must prove these three primitives. */
  requireProofSceneTypes?: boolean;
}

export interface PreflightResult {
  storyboard: Storyboard;
  issues: string[];
  warnings: string[];
  checkedAssets: string[];
  srt: string;
}

/**
 * Validate the data contract and then check the things a schema cannot know:
 * generated files, font licenses in the bundle, caption/scene alignment and
 * disclosure wording.
 */
export async function preflightStoryboard(
  storyboard: Storyboard,
  options: PreflightOptions = {},
): Promise<PreflightResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  const checkedAssets: string[] = [];

  const narrationAsset = resolve('public', storyboard.narration.audioPath);
  checkedAssets.push(narrationAsset);
  if (!(await exists(narrationAsset))) {
    issues.push(
      `Missing narration asset ${narrationAsset}. Run "npm run latency:sync" first.`,
    );
  }
  const sourceAsset = resolve(storyboard.narration.sourcePath);
  checkedAssets.push(sourceAsset);
  if (!(await exists(sourceAsset))) {
    warnings.push(
      `Source narration ${sourceAsset} is missing; the prepared WAV can still render, but the asset manifest cannot be reproduced.`,
    );
  }

  for (const asset of REQUIRED_PUBLIC_ASSETS) {
    const path = resolve(asset);
    checkedAssets.push(path);
    if (!(await exists(path))) {
      issues.push(
        `Missing required asset ${asset}. Run "npm run latency:sync" (audio/SFX) or restore the fonts.`,
      );
    }
  }

  if (!storyboard.narration.measured) {
    warnings.push('Narration timing is not marked as measured.');
  }
  if (!/gemini/i.test(storyboard.narration.provider)) {
    warnings.push(
      `Narration provider is "${storyboard.narration.provider}", not the reviewed Gemini take.`,
    );
  }

  for (const evidence of storyboard.evidence) {
    if (evidence.uiSimulated && !/simulat/i.test(evidence.disclosure)) {
      issues.push(
        `Evidence "${evidence.id}" has a simulated UI but its disclosure does not say "simulated".`,
      );
    }
    if (!evidence.simulated && !evidence.methodology) {
      warnings.push(
        `Evidence "${evidence.id}" claims measured timing without a methodology.`,
      );
    }
  }

  const sceneTypes = new Set(storyboard.scenes.map((scene) => scene.type));
  if (options.requireProofSceneTypes) {
    for (const type of PROOF_SCENE_TYPES) {
      if (!sceneTypes.has(type)) {
        issues.push(`Latency proof is missing the ${type} scene primitive.`);
      }
    }
  }

  const cueById = new Map(
    storyboard.narration.captions.map((cue) => [cue.id, cue] as const),
  );
  for (const scene of storyboard.scenes) {
    for (const cueId of scene.caption.cueIds) {
      const cue = cueById.get(cueId);
      if (!cue) continue;
      const sceneEnd = scene.startMs + scene.durationMs;
      if (cue.endMs <= scene.startMs || cue.startMs >= sceneEnd) {
        issues.push(
          `Scene "${scene.id}" references caption "${cueId}", but the cue does not overlap the scene.`,
        );
      }
    }
  }

  for (const cue of storyboard.narration.captions) {
    if (cue.startMs < storyboard.narration.startMs - 250) {
      warnings.push(`Caption "${cue.id}" starts before the narration track.`);
    }
    if (cue.endMs > storyboard.narration.startMs + storyboard.narration.durationMs + 250) {
      warnings.push(`Caption "${cue.id}" ends after the narration track.`);
    }
  }

  if (storyboard.review.status !== 'approved') {
    warnings.push(
      `Storyboard review status is "${storyboard.review.status}"; human visual, factual and brand approval is still required.`,
    );
  }

  return {
    storyboard,
    issues,
    warnings,
    checkedAssets,
    srt: buildSrt(storyboard),
  };
}

export async function loadAndPreflight(
  storyboardPath = DEFAULT_STORYBOARD_PATH,
  options: PreflightOptions = {},
): Promise<PreflightResult> {
  const raw = JSON.parse(await readFile(resolve(storyboardPath), 'utf8')) as unknown;
  const storyboard = validateStoryboard(raw);
  return preflightStoryboard(storyboard, options);
}

async function main() {
  const storyboardPath = process.argv[2] ?? DEFAULT_STORYBOARD_PATH;
  const result = await loadAndPreflight(storyboardPath, {
    requireProofSceneTypes: storyboardPath.includes('latency-10s'),
  });

  const {storyboard} = result;
  console.log(`Storyboard: ${storyboardPath}`);
  console.log(
    `Format: ${storyboard.format.width}x${storyboard.format.height} @ ${storyboard.format.fps} fps, ${storyboard.format.durationMs} ms`,
  );
  console.log(
    `Scenes: ${storyboard.scenes.map((scene) => `${scene.id} (${scene.type})`).join(', ')}`,
  );
  console.log(
    `Narration: ${storyboard.narration.provider} / ${storyboard.narration.voice}, ${storyboard.narration.durationMs} ms, starts at ${storyboard.narration.startMs} ms`,
  );
  console.log(
    `Evidence: ${storyboard.evidence
      .map(
        (entry) =>
          `${entry.id} ${entry.ttftMs} ms TTFT / ${entry.totalMs} ms total (${entry.runs} runs)`,
      )
      .join('; ')}`,
  );
  console.log(`Captions:\n${result.srt.trim()}`);
  console.log(`Checked assets: ${result.checkedAssets.length}`);

  for (const warning of result.warnings) console.warn(`WARN  ${warning}`);
  for (const issue of result.issues) console.error(`ERROR ${issue}`);

  if (result.issues.length > 0) {
    process.exitCode = 1;
    return;
  }
  console.log('Storyboard preflight passed.');
}

if (process.argv[1] && process.argv[1].endsWith('validate-storyboard.js')) {
  main().catch((error: unknown) => {
    if (error instanceof StoryboardValidationError) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  });
}
