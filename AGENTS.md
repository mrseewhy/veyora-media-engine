# AGENTS.md — Veyora Media Engine

## Mission and scope
This repository is the **shared production platform for Veyora House's 13 planned media channels**, not a ToolPilot-only application. ToolPilot is the first implementation and production acceptance test. Do not assume other channels share ToolPilot's branding, duration, topics, voices, visual style, content rules or distribution platforms. The other 12 channels' full configurations are not yet specified: never invent them.

## Default operating behavior
- Work autonomously from implementation through execution, testing, renders, technical QA and a clear handoff. Do not stop at a prompt, checklist, documentation or a 30-second proof when the requested deliverable is a full episode.
- Read the current repository, existing assets, configs and tests before changing anything. Respect the user's latest request over this file.
- Make routine engineering decisions without asking the operator to execute commands the agent can run.
- Do not silently use paid services, install untrusted software, consume metered APIs, change sharing, publish, or upload videos. Request approval where needed.
- Never claim that code has been run, audio generated, MP4s rendered, QA passed, or files exist without checking.
- Keep source code and repository documentation in this repository. Keep generated media in ignored local storage; record exact artifact paths.
- Preserve working approved artwork, compositions, scene timing and regression tests. No wholesale redesign or destructive restructure without a verified migration.
- Never commit credentials. Honor provider licensing, attribution and original-content requirements.

## Architecture boundary: shared engine vs channels
Target modular boundaries (migrate incrementally; do not pretend these already exist):
- `packages/core/`: channel/series/episode identities, typed configs, state machine, jobs and orchestration.
- `packages/research/`: sourcing, claim provenance, script and storyboard generation with factual review.
- `packages/audio/`: provider adapters, local/free TTS, caching, normalization, music/SFX and timing.
- `packages/renderer/`: Remotion/FFmpeg rendering, caption export, format variants and QA; existing code lives here.
- `packages/publishing/`: optional platform adapters, draft uploads and explicit approval gates.
- `channels/<channel-id>/`: channel-specific brand, content policy, templates, voice defaults, platform presets and series.
- `episodes/<channel-id>/<episode-id>/` or versioned episode config: source content and overrides, not generated videos.
- `apps/`: future dashboard/worker interfaces to the same pipeline, not duplicate render logic.
These are boundaries, **not instructions to create empty packages**. Refactor only when delivering functioning code with tests. Existing `remotion/`, `fixtures/`, `packages/shared/`, `packages/intelligence/`, and proof compositions remain valid until safely migrated. Never move files just for aesthetics.

Every job must carry `channelId`, `seriesId`, `episodeId`, `format`, `configVersion` and a reproducible artifact manifest. No hard-coded ToolPilot defaults in reusable orchestration. Channel-specific implementations may use ToolPilot identifiers.

## Reusable production contract
Aim for `npm run episode:produce -- --channel toolpilot --episode ai-agents-100s`, with a compatible noninteractive API for a future dashboard/worker. One command must preflight dependencies/config, generate or reuse assets, synthesize narration, align captions/timing, assemble scenes, render requested formats, produce SRT and contact sheets, run machine QA, retry recoverable failures, and output an artifact manifest. Keep stages idempotent and resumable. Reuse shared narration/storyboard/timing across aspect ratios; do not merely crop/letterbox landscape as a finished portrait design.

Required default format presets: 1920x1080 (16:9), 1080x1920 (9:16), 1080x1080 (1:1), 30fps, H.264/AAC. Adapt layout, typography, illustration and captions to platform-safe areas. Maintain per-format QA and human visual review before publication.

Generated outputs: `data/episodes/<channel-id>/<episode-id>/final/`, `captions/`, `qa/`, `metadata/`. Do not commit large outputs by default.

## ToolPilot pilot: AI Agents in 100 Seconds
- First series: **AI Tools in 100 Seconds**; first episode: **AI Agents in 100 Seconds**.
- Deliver a full, watchable, accurate episode with **100–120 seconds of narrated content, plus a 5-second intro and 8-second outro** (113–133 seconds total), **not** the existing 0–30s preview.
- Audit `fixtures/storyboards/toolpilot-agents-100s.json`, `remotion/Root.tsx`, `remotion/agents/`, narration scripts and `packages/renderer/src/` before coding.
- Complete missing original React/SVG scenes while preserving approved opening visuals and the 10-second latency regression.
- Use the approved Gemini Flash TTS / Puck voice only for ToolPilot. Never silently use a local/free voice fallback. Never invent narration files or falsely report an available provider.
- Synchronize narration, scenes, captions, transitions, music/SFX; avoid missing scenes, placeholders, clipped audio and offscreen text.
- Render three full-length formats, SRT, contact sheets, probe/loudness/technical QA and production report. Fix detected defects and rerender affected outputs.
- Machine checks are not human visual approval. Report any blocked or unverified item explicitly.
- Current repository caveat: existing `agents:render:all` targets **30-second previews**, and alternate ratios currently fit a landscape canvas. Do not mistake this for the finished responsive 100-second pipeline. The editorial storyboard validator also enforces preview-only assumptions; generalize carefully with regression tests.

## ToolPilot permanent brand-motion rules (revised 2026-11-22)
Read [`docs/ToolPilotBrandMotion.md`](docs/ToolPilotBrandMotion.md) before producing ToolPilot videos. Use official root `toolpilot-icon.png`, not the legacy BrandMark. The existing intro/outro was rejected and must be rebuilt as reusable, versioned components. **Exactly 5s intro** with a tasteful instrumental tune and no voiceover; **100–120s narrated content**; **exactly 8s outro** with music and no voiceover, first 5s animated and final 3s completely still. Total **113–133s**. CTA is Subscribe/Follow **@mytoolpilot** depending on platform. No persistent branding during the content. Render and obtain approval for new bumper previews before reusing them. These rules supersede all prior shorter-bumper and 100-second-total instructions.

## ToolPilot motion and caption QA rules (approved 2026-11-22)
Read `docs/ToolPilotBrandMotion.md` for the full motion/caption contract before producing ToolPilot scenes. Use fast, demonstrative in-scene motion rather than still slide layouts. Target a meaningful change about every 2–4 seconds when narratively appropriate. Keep the existing brisk speaking pace. For all three exports, reserve a bottom caption lane and position main animations above it; any caption/essential-visual overlap fails QA. Captions generally stay within two lines. Before another full episode, render and review a representative 15-second content sequence and obtain operator approval. These requirements apply to the **video pipeline only**, not to `apps/`, the dashboard, or the UI implementation roadmap. Do not claim the rules are implemented until they have been coded and rendered.

## ToolPilot permanent voice identity (operator-approved)
Read [`docs/ToolPilotVoice.md`](docs/ToolPilotVoice.md). ToolPilot's approved earlier AI Agents narrator uses **Gemini Flash TTS / Puck**; preserve that voice and delivery style across episodes. The later Claude Code voice was explicitly rejected. Never silently switch TTS provider or voice, even to a free fallback. Generate a short audio sample for approval before full video rendering; preserve and verify the earlier audio reference when accessible. Voice configuration is locked, but original reference WAV has not yet been committed or verified.

## Future AI media generation
Pinokio is an application installer/launcher, **not a video model**. Wan2GP/WanGP is a local video-model execution interface; LTX-2 is a video-generation model family. Treat them as optional, benchmarked **asset providers**, never mandatory dependencies or replacements for Remotion's deterministic assembly. On an M1 16GB Mac, verify memory, speed, model/license and quality before selecting them. Do not assume usable performance or zero cost.

## Tests, QA and delivery
Run relevant tests, typechecks, render smoke tests and full requested renders whenever execution is available. Check files, dimensions, duration, audio, captions, asset provenance, safe areas and contact sheets. Never mark subjective quality as approved automatically. Record executed commands, passing/failing checks, artifact paths and remaining blockers.

Do not push changes or publish videos when the task explicitly requires review first. If operating via a GitHub-only connector without a local runtime, distinguish committed source changes from **unexecuted** code and unrendered outputs.

See `docs/MultiChannelArchitecture.md` for the migration strategy. Keep this file updated when the operational contract actually changes.


## Visual direction: approved editorial standard (2026-11-23)
**Required reading:** [`docs/VisualDirector.md`](docs/VisualDirector.md). The script and narrator can be excellent while the video fails creatively. Insert a **Visual Director** planning/asset/creative-QA stage between scripting and Remotion assembly. Show named real people, objects, events and physical processes with accurate sourced/cleared media or explicitly illustrative assets, rather than generic title cards. **ToolPilot blue is not a mandatory content colour**; branding belongs predominantly in approved bumpers, typography, voice and edit style. Use mixed footage, images, caricatures, screenshots, original art, AI visuals and meaningful motion based on story needs. Treat source/likeness truthfulness, media rights and metered generation as blocking approval gates. Keep locked narration while revising visuals. Do not mark a video done merely because audio, script and machine QA pass. This is an approved **design requirement**, not evidence the Visual Director software has been implemented.

