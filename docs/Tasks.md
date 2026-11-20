# Development Tasks

Status: all tasks are **planned** until code/tests demonstrate completion. Work in dependency order. Check off only after verification.

## M1: Application foundation
- [ ] Initialize a clean, bootable Laravel 12 + Inertia React + TypeScript project.
- [ ] Configure SQLite, database queue, migrations and first administrator account.
- [ ] Implement login/logout, prevent public signup, protect all internal routes.
- [ ] Implement Brand model and seed ToolPilot Daily.
- [ ] Implement Topic model, create/list endpoints and validation.
- [ ] Implement durable production run records and queued topic-intake job.
- [ ] Render dashboard and research UI with **real** persisted data.
- [ ] Add feature tests for authorization, intake, queue and failure paths.
- [ ] Run migrations, unit/feature tests, frontend build and smoke test.

## M2: First real video
- [ ] Add typed script/storyboard JSON contract and verified sample script.
- [ ] Add Python subprocess contract and local TTS voice generation.
- [ ] Build one ToolPilot Daily Remotion template.
- [ ] Render one correct 1080x1920 MP4 from the app.
- [ ] Add captions, asset license ledger, FFprobe QA and local preview.
- [ ] Run repeatability and failure/retry tests.

## M3: Research + per-platform variants
- [ ] RSS source registry, timestamps, canonicalization, deduplication.
- [ ] LLM provider adapter; budget-aware generation and evidence mapping.
- [ ] Editorial approval state and factual verification hold.
- [ ] Four platform export presets, metadata and audio/caption checks.
- [ ] Regression suite over sample videos.

## M4: Publishing
- [ ] YouTube OAuth and video upload adapter.
- [ ] Instagram professional-account Reels adapter.
- [ ] Facebook Page publishing adapter.
- [ ] TikTok adapter only where app audit and consent requirements permit.
- [ ] Scheduling calendar, platform state polling, idempotency and retries.
- [ ] Sandbox/private test publications with explicit approval.

## M5: Autonomous operations
- [ ] Scheduler with configured time zone and daily limits.
- [ ] Run gating: factual checks, QA, budgets, permissions and duplicate checks.
- [ ] Analytics ingestion using available authorized APIs.
- [ ] Recovery playbook, backup/restore and operations documentation.

## Do not do yet
Payments, SaaS user roles, Redis, Docker orchestration, cloud hosting, infinite research agents, self-learning scripts or unattended public posting.
