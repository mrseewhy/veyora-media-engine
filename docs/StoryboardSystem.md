# Storyboard & Scene System
Status: the latency contract is implemented in `packages/shared/src/storyboard.ts`. The AI Agents episode extends the shared format, brand, caption and review types with an editorial scene contract in `packages/shared/src/editorial-storyboard.ts`. Its full 100-second plan is validated while only 0–30 seconds is implemented. Depends on [VideoExperience](VideoExperience.md) and [UserJourney](UserJourney.md).

## Core model
**Episode** has one journey template and versioned **storyboard**. Storyboard is ordered **beats** (narrative intent) containing one or more **scenes** (visual execution). Scene has timeline, narration reference, visual recipe, real assets, motion, captions, source/evidence and review state. A beat may span several shots. Rendering must not invent a scene type silently.

## Scene types (v1)
1. **ScreenDemo**: real recorded UI/screenshot; crop, cursor, pan/zoom, step highlights. Require provenance and timestamp/URL.
2. **CodeTerminal**: real or clearly labeled sample code/terminal; syntax highlighting, line focus, typed sequence. Never invent a successful execution.
3. **DiagramFlow**: nodes, arrows, labels, progressive reveal of real data flow.
4. **Comparison**: synchronized side-by-side evidence, same scale/conditions, readable labels.
5. **MetricTimeline**: API/latency/benchmark visual with unit, measurement method and actual-vs-simulated label.
6. **Callout**: brief large text/key number layered over meaningful footage or diagram, not default full-screen slide.
7. **BrandOutro**: short ToolPilot signature with existing logo, no logo replacement.

Do not implement 20 generic templates. Prove **ScreenDemo + MetricTimeline + Callout** on the 10-second latency scene first, then add others as real episodes need them.

## Example scene contract (illustrative, not validated schema)
```json
{
  "schemaVersion": 1,
  "episodeId": "toolpilot-latency",
  "storyboardVersion": 1,
  "journeyTemplate": "concept-explainer",
  "format": {"width": 1920, "height": 1080, "fps": 30},
  "beats": [{
    "id": "hook",
    "intent": "Reveal the difference between perceived speed and API latency",
    "narration": {"text": "A slick AI demo can hide terrible latency.", "audioAssetId": "voice-hook", "startMs": 0, "endMs": 3000},
    "scenes": [{
      "id": "latency-compare",
      "type": "MetricTimeline",
      "startMs": 0,
      "durationMs": 3000,
      "visual": {"metricUnit": "ms", "dataAssetId": "network-trace", "simulated": false},
      "motion": {"preset": "reveal-then-focus", "intensity": "medium"},
      "caption": {"mode": "emphasis", "safeArea": true},
      "assets": ["network-trace"],
      "claims": ["claim-latency-01"],
      "review": "proposed"
    }]
  }]
}
```
Use discriminated unions for scene-specific `visual` props and runtime validation (e.g., Zod). The example covers only a partial storyboard. Do not hard-code timing to the illustrative values.

## Scene card in the editor
Thumbnail/preview, start/end time, beat intent, narration, visual type, asset picker, source/license badge, motion preset, caption mode, render status, warnings, review comments. Controls: play scene, edit, split, duplicate, reorder, replace asset, regenerate proposal, rerender preview. Provide undo/versioning and accessible non-drag reorder controls.

## Timeline and synchronization
- Time unit: integer milliseconds in data; convert to frames at render boundary.
- Single timeline authority: actual audio timings + manually approved beat boundaries. Never guess caption sync from character length.
- No accidental gaps/overlaps; intentional overlaps explicitly represented as transition or layered tracks.
- Separate tracks: narration, visuals, captions, music/SFX, annotations.
- Maintain 16:9 1920×1080 at 30fps initially; preview can render lower resolution but must preserve layout.
- Recompute dependent scene timings when narration changes; show diff and require approval.
- Avoid cutting away from readable code before viewers can inspect it.

## Motion language
Camera: zoom to evidence, follow cursor, pan between relevant UI regions, focus one data point. Animation: reveal a process, compare states, show causal relationship. Transitions: cuts or short contextual moves; avoid gratuitous spins/particle backgrounds. Use motion easing consistently. Avoid frame-dependent random positions; seeded deterministic behavior if needed.

## Rendering architecture
- **Remotion + React/TypeScript** is the proposed visual composition layer following quality feedback, pending verification of licensing for the actual use case. FFmpeg/ffprobe remains for media preprocessing, muxing and QA.
- Implement scene components as pure functions of validated props and frame/time, with reusable typography, safe areas, theme tokens and media utilities.
- Gemini Flash TTS is the preferred **test** narration adapter; preserve replaceable provider interface and check quota/cost/terms. Never store API keys in episode JSON or Git.
- Use real local assets referenced by IDs and an asset manifest. Original recordings and licensed materials only.
- Scene preview renders one scene or range, not the entire episode. Cache by content hash (script, assets, template version, voice take).
- Render output includes video, SRT, transcript, source/license manifest, QA report and render metadata.

## AI planner contract
Input: approved brief, journey template, source-backed claims, script beats, available assets, visual rules.
Output: typed proposed scenes, visual intent, required assets, evidence mapping, timing proposal and warnings.
**Hard rules:** No unverified product claims, invented screenshots, fake benchmarks, arbitrary visual type, or silent source substitution. If a required asset is missing, return `needs_asset`, not a fabricated replacement. Human approves storyboard version before full render.

## Review and quality gates
1. **Preflight:** schema valid; assets available; license/provenance recorded; source-backed claims; no unresolved blocking flags.
2. **Technical:** expected codecs/resolution/fps, nonempty audio, caption bounds, scene coverage, no missing frames or invalid duration.
3. **Creative:** each scene has a visual purpose, no prolonged text-only slides, legible interface, purposeful camera moves, pacing and brand consistency.
4. **Editorial:** facts match evidence; any simulated data clearly marked; no misleading demonstrations.
5. **Approval:** human signs off exact render artifact/version; changes invalidate approval.

## Scene acceptance test: latency hook
Narration: “A slick AI demo can hide terrible latency. Measure the API call, not just the animation.”
Required: a real or visibly labeled simulated interface, actual or clearly simulated request timing, meaningful zoom into the measured event, legible comparison, accurate synced captions. Reject if it is only floating text on a generic background. Produce a 10-second scene, inspect on desktop and phone, and fix before attempting 30/100 seconds.

## Implementation tasks
1. Audit current repository renderer and reconcile docs with code (do not delete working implementation without a migration).
2. Implement scene schema and validation tests.
3. Build a storyboard fixture for the latency hook with explicit asset manifest.
4. Build three scene primitives and scene-only preview.
5. Render and manually review 10 seconds.
6. Add editor UI only after the scene quality is accepted; reuse the exact schema in CLI and dashboard.


## Shot-level Visual Director expansion (approved requirement; implementation pending)
The current scene types are **not an exhaustive creative menu**. The Visual Director layer described in [VisualDirector.md](VisualDirector.md) may plan photographs, footage, cut-outs, recognizable editorial caricatures of named people, original/AI illustration and limited generated video alongside existing Remotion primitives. Each proposed shot maps an exact narration phrase to subject, visual intent, visual asset type, actual asset provenance, rights/disclosure state, motion, shot-level palette, safe area, alternative formats and human review. Prefer meaningful evidence or recognizable subjects to generic boxes; do not present synthetic people as real documentary footage. No “blue” default for content. Maintain versioned audio timing, source claims and schema compatibility when implementing; the illustrative JSON is not the current runtime contract.

