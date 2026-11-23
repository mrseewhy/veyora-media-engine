# Implementation Tasks

## Production Intelligence v1
- [x] Add additive PostgreSQL/Drizzle migrations for episodes, render versions, scene feedback, production lessons, evaluation runs and lesson applications.
- [x] Verify the existing local `DATABASE_URL` connection and apply migrations.
- [x] Add CLI workflows for whole-video and scene feedback, render comparison and approval status.
- [x] Extract repeated problems as candidate lessons; require human approval before retrieval as production guidance.
- [x] Record approved lesson use in script or storyboard planning context for a specific episode version.
- [x] Keep automated technical QA separate from human creative and factual scores.
- [x] Test the cross-episode feedback-to-lesson workflow in a rolled-back PostgreSQL transaction.
- [ ] Integrate approved lesson context with a future script/storyboard generator when one exists.
- [ ] Add multi-user authorization and operator identity checks before a shared dashboard is built.


## AI Agents in 100 Seconds — current review gate
- [x] Preserve the 10-second latency composition and add a regression test for its 300-frame evidence story.
- [x] Write a complete 100-second script and storyboard proposal; keep 30–100 seconds marked planned.
- [x] Build reusable editorial scene components for the opening 30 seconds.
- [x] Generate Gemini Flash TTS narration for 0–30 seconds, captions, and original sound cues.
- [x] Render the 30-second H.264/AAC preview and run machine QA.
- [x] Inspect a contact sheet and revise scene timing to match narration.
- [ ] Operator reviews the exact 30-second render for storytelling, visual quality, factual framing, captions and brand.
- [ ] Only after approval, implement and render the remaining 70 seconds.


## Phase 1 — Renderer proof (DO THIS FIRST)
- [x] Confirm local Node.js, pnpm, FFmpeg/ffprobe and Piper availability; document versions.
- [ ] Choose an actual ToolPilot episode topic and approve a source-backed 100-second script.
- [ ] Confirm rights/licenses for every visual, sound and voice model.
- [x] Create workspace packages: shared schema and CLI renderer.
- [x] Define episode JSON schema and one example fixture.
- [x] Generate local narration and capture segment timings.
- [x] Implement 3–5 reusable scene primitives (title, comparison, screenshot zoom, diagram, outro).
- [x] Compose scenes with FFmpeg and export H.264/AAC MP4.
- [x] Generate SRT captions and manifest.
- [x] Validate duration, resolution, audio, subtitles and missing assets.
- [ ] Watch full video, note defects and rerender until approved.
**Gate:** 100-second video exists and passes machine checks plus human visual review.

## Phase 2 — One-command automation
- [ ] Implement `pnpm episode:render <episode.json>`.
- [ ] Cache intermediate artifacts; support reruns and error recovery.
- [ ] Export thumbnail candidate and publish metadata.
- [ ] Test three different scripts and repeated renders.
**Gate:** one command creates consistent draft deliverables.

## Phase 3 — AI-assisted research and scripts
- [ ] Provider interface and spending controls.
- [ ] Source retrieval, citations, claim-review checklist.
- [ ] Structured script/storyboard generation and validation.
- [ ] Approval gate before rendering.
**Gate:** one researched topic -> reviewed script -> draft video.

## Phase 4 — App and PostgreSQL
- [ ] Scaffold Next.js UI and local PostgreSQL.
- [ ] Add Drizzle migrations for channels, episodes, sources, assets, jobs, approvals and uploads.
- [ ] Build background Node worker with retries and status tracking.
- [ ] Implement review, preview and rerender screens.
**Gate:** operator manages complete production lifecycle in UI.

## Phase 5 — YouTube
- [ ] Set up Google OAuth and YouTube API access.
- [ ] Upload private/unlisted test; verify quota and API-project restrictions.
- [ ] Implement explicit approval and publish action, no silent public posting.
**Gate:** approved episode successfully uploaded and verified.

## Phase 6 — Scale
- [ ] Vertical templates and multiple channel profiles.
- [ ] Scheduling, analytics and production health metrics.
- [ ] Review monetization/originality compliance.

## Immediate quality reset (takes priority over the original Phase 1 order)
- [x] Audit the current implementation and reconcile the earlier FFmpeg/Piper plan with actual code; preserve working assets.
- [x] Verify Remotion licensing for automated commercial production; choose renderer accordingly. See [Licensing](Licensing.md).
- [x] Adopt the viewer journey templates in [VideoExperience](VideoExperience.md).
- [x] Implement typed storyboard/scene contract in [StoryboardSystem](StoryboardSystem.md).
- [x] Define real or explicitly simulated evidence assets for the 10-second latency hook.
- [x] Implement ScreenDemo, MetricTimeline and Callout scenes with meaningful motion.
- [x] Use the selected Gemini Flash TTS take with measured audio/caption timing; retain provider fallback.
- [x] Render a **10-second scene only** and run machine QA.
- [ ] Review the exact render on desktop/mobile, record visual defects and iterate until explicitly approved; **do not expand duration or build the full UI before approval**.
- [ ] After approval, implement the storyboard editor journey in [UserJourney](UserJourney.md), reusing the same data contract.

**Note:** Earlier tasks mentioning Piper/FFmpeg as the sole renderer describe the original baseline, not the revised quality target. Do not mark any task complete without verifying code and output.

## Phase 1 evidence (2026-11-22)
- Draft episode: Better ChatGPT Prompts in 100 Seconds. Script cites official OpenAI prompting guidance in the JSON fixture; human editorial approval remains pending.
- Toolchain: Node v22.23.3, pnpm 11.25.0, project-local FFmpeg 4.4 and ffprobe; Piper unavailable. macOS Samantha voice used for this local proof. Check Apple voice redistribution terms before external distribution.
- Original programmatic graphics and no music, external footage, or screenshots. No third-party visual/audio asset licenses are needed for this draft, apart from voice terms still to confirm.
- Output: `data/episodes/chatgpt-better-prompts/98b60151a807/video.mp4` (100.022 s, 1920×1080, 30 fps, H.264/AAC, 3000 frames). Captions, transcript, thumbnail, manifest, and QA JSON are alongside it.
- Automated tests: 5/5 passing, including a 2-second H.264/AAC integration render. Machine QA passes; silence detection found no gaps of 2 seconds or longer.
- Remaining gate: watch the full video on desktop and mobile, review voice and pacing, verify claims and brand treatment, confirm voice terms, and explicitly approve or request revisions.

## Revision after operator feedback (2026-11-22)
- Operator rejected the first video for robotic voice and weak visual design. That draft is superseded.
- Replaced macOS speech with locally generated Kokoro `am_michael` voice; model provenance: `hexgrad/Kokoro-82M`, Apache-2.0 ([model card](https://huggingface.co/hexgrad/Kokoro-82M)). No speaker cloning or Fireship audio was used.
- Replaced plain text screens with original SVG scene layouts, examples, colored cards, a grid texture, and camera motion.
- Revised output: `data/episodes/chatgpt-better-prompts/d6b4578b7bfd/video.mp4`; machine QA passes at 100.022 seconds. Human approval is still pending.

## Gemini Flash voice test
- Added a Gemini 3.8 Flash TTS adapter and short voice sample command. The API test succeeded with the configured key: `data/gemini-flash-sample.wav` is a 10.36-second, 24 kHz mono PCM WAV using Gemini 3.8 Flash TTS and Puck. The previous Kokoro video remains the current full render until the voice sample is reviewed.

## Gemini technical voice sample
- Generated a new 79-word technical script with three distinct delivery directions: punchy hook, faster technical walkthrough, and slightly slower takeaway.
- The Gemini 3.8 Flash TTS raw take was 33.28 seconds. A 1.1093× FFmpeg tempo adjustment produced a 30.00-second, 24 kHz mono PCM WAV at `data/gemini-technical-sample.wav`. Human listening review is pending.

## 30-second technical video (2026-11-22)
- Built an original local browser demo UI and captured six actual Chrome screens: run overview, network trace, token budget, response JSON, retrieval, and rate limits. Its figures are illustrative and labeled in the UI.
- Used the approved-for-testing Gemini 3.8 Flash TTS Puck narration sample, kinetic typography, animated zooms, five transitions, and original synthesized click/riser sound effects.
- Export: `data/technical-video/toolpilot-technical-30s.mp4`; machine QA: 30.000 seconds, 1920×1080, 30 fps, 900 frames, H.264/AAC. No silence lasting one second or more was detected at -45 dB.
- Visual spot-check of six frames passed for readable layout. Full operator playback and creative approval remain pending.

## 10-second Remotion latency proof (2026-11-22)
- Replaced the speculative renderer note with a working Remotion 4.0.545 composition. FFmpeg remains the media/QA layer; the existing 100-second and 30-second FFmpeg renders were preserved.
- Storyboard contract: `packages/shared/src/storyboard.ts`; fixture: `fixtures/storyboards/toolpilot-latency-10s.json`. Time is integer milliseconds in data; frames are derived only at the Remotion boundary. Validation covers beat/scene coverage, scene-in-beat containment, caption coverage and emphasis, evidence references, simulated-data disclosure and caption/scene overlap.
- Evidence: five sequential POSTs to a local streaming endpoint, measured with `performance.now()`. Median TTFT 858 ms; median total 2,506 ms. The assistant UI and response text are simulated and labelled in-frame; the timing is measured and labelled.
- Narration: Gemini Flash TTS / Puck. Raw take 6.56 s; trimmed to 6.104 s starting at 300 ms. Captions measured from FFmpeg silence detection: c1 260–3,610 ms; c2 3,730–6,370 ms. Original synthesized SFX only.
- Scenes: ScreenDemo (simulated assistant UI + measured network panel), MetricTimeline (TTFT/total cards, request timeline, perceived-vs-actual comparison), Callout (2.51 s verdict). Reusable components live in `remotion/components/`.
- Render: `data/renderer10/toolpilot-latency-10s.mp4`; 10.006 s, 1920×1080, 30 fps, 300 frames, H.264/AAC, -16.01 LUFS, -2.97 dBTP, 2,266,606 bytes. SHA-256 `2fee962cb0cc92059da98d5888340a78a9b0feb989008ad1646cf18092f1a6d6`.
- Machine QA: 15/15 checks passed. Repository tests: 18/18 passed. Artifacts: SRT, transcript, QA JSON, render metadata, asset manifest, contact sheet.
- Commands: `npm run latency:measure`, `npm run voice:latency`, `npm run latency:sync`, `npm run storyboard:validate`, `npm run scene:render`. Preview with `npm run scene:studio`.
- Remaining gate: human visual, factual and brand review of the exact artifact on desktop and mobile. The storyboard review state is still `proposed`; no 30- or 100-second expansion is approved.
- Reproducibility caveat: `data/` and `public/generated/` are ignored. The raw Gemini take and final MP4 must be regenerated (API key/quota required) or restored from the recorded artifact hashes.

## Multi-platform rendering for ToolPilot episodes (approved 2026-11-22)
- [ ] Register landscape (1920×1080), vertical (1080×1920) and square (1080×1080) Remotion compositions using one shared episode timeline.
- [ ] Refactor existing scenes to respond to aspect ratio, repositioning captions, artwork and typography without stretching or cropping essential content.
- [ ] Define and test per-platform safe areas and ensure important visuals/captions stay visible.
- [ ] Add a single render command to export three H.264/AAC MP4s with shared narration, scenes and timing.
- [ ] Produce separate contact sheets and QA results for each format; verify resolution, duration, audio, captions and missing assets.
- [ ] Visually review all three formats on target devices and correct defects before publishing.
- [ ] Preserve existing artwork and 10-second regression composition; do not add paid dependencies without approval.

**Done when:** the complete 100-second AI Agents episode renders and passes QA and human review in all three aspect ratios. No publishing automation is implied.


## Visual Director and mixed-media quality reset (approved 2026-11-23; not yet implemented)
- [x] Document the approved artistic direction and Visual Director contract in [VisualDirector.md](VisualDirector.md).
- [ ] Map the existing editorial storyboard schema and asset manifest to a versioned shot-level Visual Director output without breaking the regression scene.
- [ ] Validate named-entity relevance, claimed authenticity, asset type, provenance, cost approval and real asset existence.
- [ ] Add original-illustration / licensed-photo / stock-video / permitted screenshot / AI-image asset acquisition workflows with explicit rights and spending checks; cache reusable approved assets.
- [ ] Generate a 15-second **Singularity Explained** visual-only or existing-voice proof with a deliberately sourced real-person/caricature shot and purposeful non-slide visual storytelling.
- [ ] Render a representative contact sheet and judge against the previous repetitive-card look; get operator approval before full-length renders.
- [ ] Integrate per-scene creative feedback and shot-level rerender, preserving the accepted voice take.
- [ ] Produce 30-second mixed-media validation and human creative quality review; then native 16:9, 9:16 and 1:1 full episodes.
- [ ] Add creative QA flags for repetitive card composition, excessive empty backgrounds, palette lock-in, weak subject relevance and misleading synthetic documentary imagery.
- [ ] Preserve existing ToolPilot intro/outro duration, voice and regression assets; do not silently pay for image/video generation.



## Current highest priority: full-episode storytelling reset (2026-11-23)
**Specification:** [FullEpisodeProduction.md](FullEpisodeProduction.md). This supersedes the earlier 15-second Singularity proof as the next deliverable; retain historical task entries for traceability.
- [ ] Audit current main, approved full Singularity audio/script, earlier best `agents-0-30.mp4`, rejected render and rights-cleared assets; preserve working code.
- [ ] Do not adopt PR #4/Ollama as production solution; avoid unnecessary new LLM/dependency.
- [ ] Produce narration-timed **full-episode** acts and shot list with visible start state → action → changed end state and sound cues.
- [ ] Source/create concrete, rights-reviewed mixed-media assets; no generic filler, repeated slide layouts or fabricated likeness/quotes.
- [ ] Implement fast-paced action-led Remotion scenes and editorial transitions, preserving voice/brand/safe margins.
- [ ] Add selective **vocal effects**, character dialogue treatment only when appropriate, original/licensed SFX and dynamically ducked music; preserve approved narrator.
- [ ] Render complete Singularity Explained landscape video, captions, contact sheet, asset/audio manifests, technical QA and timecoded creative defect list.
- [ ] Fix failed shots and audio mix, rerender, compare to best earlier reference, and obtain operator approval.
- [ ] After landscape approval, produce native 9:16 and 1:1 adaptations and per-format QA.
- [ ] Push tested implementation branch and open PR; merge only after approval. No publishing.
