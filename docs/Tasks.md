# Implementation Tasks

## Phase 1 — Renderer proof (DO THIS FIRST)
- [ ] Confirm local Node.js, pnpm, FFmpeg/ffprobe and Piper availability; document versions.
- [ ] Choose an actual ToolPilot episode topic and approve a source-backed 100-second script.
- [ ] Confirm rights/licenses for every visual, sound and voice model.
- [ ] Create workspace packages: shared schema and CLI renderer.
- [ ] Define episode JSON schema and one example fixture.
- [ ] Generate local narration and capture segment timings.
- [ ] Implement 3–5 reusable scene primitives (title, comparison, screenshot zoom, diagram, outro).
- [ ] Compose scenes with FFmpeg and export H.264/AAC MP4.
- [ ] Generate SRT captions and manifest.
- [ ] Validate duration, resolution, audio, subtitles and missing assets.
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
- [ ] Audit the current implementation and reconcile the earlier FFmpeg/Piper plan with actual code; preserve working assets.
- [ ] Verify Remotion licensing for automated commercial production; choose renderer accordingly.
- [ ] Adopt the viewer journey templates in [VideoExperience](VideoExperience.md).
- [ ] Implement typed storyboard/scene contract in [StoryboardSystem](StoryboardSystem.md).
- [ ] Define real or explicitly simulated evidence assets for the 10-second latency hook.
- [ ] Implement ScreenDemo, MetricTimeline and Callout scenes with meaningful motion.
- [ ] Use the selected Gemini Flash TTS take with measured audio/caption timing; retain provider fallback.
- [ ] Render a **10-second scene only**, run machine QA and review on desktop/mobile.
- [ ] Record visual defects and iterate until explicitly approved; **do not expand duration or build the full UI before approval**.
- [ ] After approval, implement the storyboard editor journey in [UserJourney](UserJourney.md), reusing the same data contract.

**Note:** Earlier tasks mentioning Piper/FFmpeg as the sole renderer describe the original baseline, not the revised quality target. Do not mark any task complete without verifying code and output.
