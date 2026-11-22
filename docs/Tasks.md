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
