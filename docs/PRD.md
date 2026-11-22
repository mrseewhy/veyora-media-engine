# Product Requirements Document

## Primary user
Single operator producing ToolPilot AI-tool explainers; later support other Veyora channels without mixing their identities.

## Episode lifecycle
Idea -> Research -> Claims reviewed -> Script reviewed -> Storyboard -> Assets ready -> Rendering -> QA -> Approved -> Upload queued -> Uploaded -> Published (optional).

## Phase 1–2 requirements
- Accept a versioned JSON episode with title, format, narration segments, scenes, asset references, timing and source links.
- Validate schema, scene durations, missing assets and license metadata before rendering.
- Produce MP4 (H.264/AAC), captions (SRT), transcript, thumbnail candidate, manifest and QA report.
- Narration and captions follow a common timing source; support manual timing correction.
- Deterministic scene assembly, progress logs, retryable steps and recoverable failures.
- Avoid external copyrighted music/footage without clear permission.
- First template: fast-paced ToolPilot 100-second landscape explainer. Vertical variant later.

## Phase 3 requirements
- AI proposes topics, sources, factual claims, script and scene instructions.
- Every material claim has a retrievable source and review status.
- AI cannot silently mark claims verified or publish content.

## Phase 4–5 requirements
- Next.js dashboard for episodes, scripts, assets, render jobs and approval.
- PostgreSQL/Drizzle persistence with migrations and status history.
- Worker claims queued jobs, records attempts and supports safe retries.
- YouTube upload only after explicit approval, with channel authorization and publishing state visible.

## Nonfunctional
- Local macOS development, clear install instructions, secrets in .env, no secrets committed.
- Video and audio quality checked with ffprobe; duration, codecs, resolution, missing assets, silence and caption timing validated.
- Idempotent jobs; errors surfaced with actionable messages.
- Keep original sources and provenance in manifest.
- Unit tests for validation and timeline; integration test with short render fixture; one full 100-second acceptance render.

## Out of scope until proven
Fully autonomous publication, guaranteed virality, unrestricted generative footage, universal fact verification, multi-channel orchestration and analytics dashboards.

## Acceptance for first milestone
One reproducible, visually acceptable ~100-second ToolPilot MP4, valid audio/captions and a QA report. Human reviews visual polish and factual accuracy.
