# Multi-channel architecture and incremental migration

## Product boundary
Veyora Media Engine is one production platform serving **13 planned channels**. ToolPilot is the first pilot, not the default brand for all future jobs. The other 12 channel identities and production rules must be supplied or verified before implementation.

## Current state (checked on main, 2026-11-22)
- Root `remotion/` and `packages/renderer/` contain ToolPilot-specific implementations.
- `packages/shared/` contains shared storyboard schemas; `packages/intelligence/` contains production intelligence.
- `fixtures/storyboards/toolpilot-agents-100s.json` is the current episode fixture.
- `agents:render` is a 30-second preview; `agents:render:all` is a 30-second three-format preview, with fitted 16:9 scenes rather than responsive native layouts.
- `validateEditorialStoryboard` currently enforces a 100-second 1920x1080 storyboard, a Gemini preview provider, first 30 seconds implemented, later scenes planned, and preview-only captions.
- Existing latency and editorial regression tests must remain green.

## Proposed boundaries (build when needed)
```text
apps/
  dashboard/                 # future Next.js management app
  worker/                    # future durable production jobs
channels/
  toolpilot/
    channel.json             # brand, content rules, safe areas, platforms
    series/
      ai-tools-100s.json     # voice, format, pacing and style defaults
episodes/
  toolpilot/
    ai-agents-100s.json      # source script/storyboard/episode overrides
packages/
  core/                      # config resolution, job lifecycle, orchestration
  research/                  # source-backed research and script/storyboard
  audio/                     # TTS, music/SFX, alignment, loudness
  renderer/                  # existing Remotion/FFmpeg adapters and QA
  publishing/                # future channel-aware platform integrations
  shared/                    # common contracts and validation
  intelligence/              # existing feedback/evaluation
remotion/                    # reusable compositions + channel-specific scene modules
data/episodes/<channel>/<episode>/ # ignored generated media
```

This is a **target layout**, not a claim these directories or capabilities already exist. Prefer a working vertical slice over empty folders.

## Configuration precedence
`engine defaults < channel defaults < series defaults < episode overrides < CLI flags`. Validate resolved config before any paid or long-running stage. Include `channelId`, `seriesId`, `episodeId`, `format`, `configVersion` in manifests and job keys. Separate provider configuration from brand configuration.

## Pipeline
1. Select channel, series, episode and formats.
2. Research/claim verification and script review where applicable.
3. Validate storyboard, rights and assets.
4. Generate/cache narration, timing, captions and SFX.
5. Render each format from shared timing and responsive scene layouts.
6. Run independent per-format QA; generate SRT, contact sheets and manifests.
7. Request human visual/factual approval before publishing.
8. Upload/publish only with explicit authorization.

Use resumable jobs, deterministic keys, stage-level caches, bounded retries and truthful status. Never silently substitute a short preview for a full episode.

## Safe implementation sequence
1. Complete ToolPilot's 100-second production as an end-to-end acceptance test without breaking existing proofs.
2. Extract channel/series/episode config resolution and generic production command while keeping old CLI aliases working.
3. Remove ToolPilot hardcoding from shared validation, orchestration, output paths and format selection; retain ToolPilot-specific scene art under a ToolPilot module.
4. Add a second **test channel fixture** (not a fabricated real Veyora channel) to prove no brand bleed or path collisions.
5. Only then implement dashboard, queue, publishing and additional real channel presets as requirements are confirmed.

## Acceptance criteria
- ToolPilot pilot renders three full-length formats with independently checked outputs.
- A second synthetic channel can resolve different branding without importing ToolPilot assets.
- Old 10s and 30s proof commands still work until intentionally deprecated.
- No paid service or publication occurs without approval.
- Code/test/render claims are based on actual execution.
