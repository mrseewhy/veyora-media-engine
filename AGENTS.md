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
- Deliver a full, watchable, accurate 100-second episode, **not** the existing 0–30s preview.
- Audit `fixtures/storyboards/toolpilot-agents-100s.json`, `remotion/Root.tsx`, `remotion/agents/`, narration scripts and `packages/renderer/src/` before coding.
- Complete missing original React/SVG scenes while preserving approved opening visuals and the 10-second latency regression.
- Use the existing voice pipeline and legitimate local/free fallbacks where practical. Never invent narration files or falsely report an available provider.
- Synchronize narration, scenes, captions, transitions, music/SFX; avoid missing scenes, placeholders, clipped audio and offscreen text.
- Render three full-length formats, SRT, contact sheets, probe/loudness/technical QA and production report. Fix detected defects and rerender affected outputs.
- Machine checks are not human visual approval. Report any blocked or unverified item explicitly.
- Current repository caveat: existing `agents:render:all` targets **30-second previews**, and alternate ratios currently fit a landscape canvas. Do not mistake this for the finished responsive 100-second pipeline. The editorial storyboard validator also enforces preview-only assumptions; generalize carefully with regression tests.

## Future AI media generation
Pinokio is an application installer/launcher, **not a video model**. Wan2GP/WanGP is a local video-model execution interface; LTX-2 is a video-generation model family. Treat them as optional, benchmarked **asset providers**, never mandatory dependencies or replacements for Remotion's deterministic assembly. On an M1 16GB Mac, verify memory, speed, model/license and quality before selecting them. Do not assume usable performance or zero cost.

## Tests, QA and delivery
Run relevant tests, typechecks, render smoke tests and full requested renders whenever execution is available. Check files, dimensions, duration, audio, captions, asset provenance, safe areas and contact sheets. Never mark subjective quality as approved automatically. Record executed commands, passing/failing checks, artifact paths and remaining blockers.

Do not push changes or publish videos when the task explicitly requires review first. If operating via a GitHub-only connector without a local runtime, distinguish committed source changes from **unexecuted** code and unrendered outputs.

See `docs/MultiChannelArchitecture.md` for the migration strategy. Keep this file updated when the operational contract actually changes.
