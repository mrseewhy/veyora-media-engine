# Implementation Plan

## Goal and non-goals
Build an internal app that creates and manages short educational videos for ToolPilot Daily, a Veyora House media brand. One operator, local development, zero additional paid subscriptions as a **target**, not a promise. Do not build client billing, multi-tenancy, mobile applications, cloud deployment or a general-purpose video editor.

## Stack
Laravel 12 / PHP 8.2+, Inertia + React 19 + TypeScript, Tailwind 4, SQLite, Laravel database queue and scheduler. Python 3.12+ for research, sourcing and narration. Remotion/React and FFmpeg for rendering. Local filesystem for original assets and outputs.

### Process ownership
1. Laravel owns authoritative data, approval status, scheduling, audit events and queue retries.
2. Python is invoked as a supervised subprocess via Symfony Process with one JSON job manifest and one machine-readable result. It has no independent scheduler and does not write application DB tables.
3. Remotion receives a validated scene manifest; FFmpeg handles media probing, audio normalization and platform transcodes.
4. Publisher adapters are independently authorized per account, and only operate on approved, validated exports.

## First vertical slice
A manually supplied, source-checked script generates narration and a 1080x1920 MP4 with synchronized captions. Store assets, job state and a reviewable result in the app. Research discovery and publishing are attached only after video quality is proven.

## Milestones and exit criteria
1. **App foundation:** admin login, ToolPilot Daily brand record, topic intake, job queue, dashboard and audit trail; feature tests run.
2. **Research + creative:** RSS ingest, canonical source URLs, duplicate detection, primary-source evidence, structured script/storyboard, editorial review.
3. **Rendering:** offline voice, Remotion theme, captions, render previews, quality checks, revisions and four exports.
4. **Publishing:** account authorization, channel capability checks, upload/processing state, scheduling, retries, error report and post IDs.
5. **Autonomy:** configurable daily runs, budget caps, source trust rules, mandatory hold conditions, analytics feedback.

## Repository layout
- `app/`, `routes/`, `resources/`, `database/`, `tests/`: Laravel application
- `worker/`: Python script, provider adapters, tests
- `video/`: Remotion project, compositions, assets and templates
- `docs/`: source-of-truth requirements and implementation contracts
- `storage/app/media/`: ignored local media and per-job artifacts

## Controls
- Default: manual publication approval; autonomous public posting disabled.
- Every factual claim keeps evidence URL, capture timestamp, and claim-to-source association.
- Fail closed for unsupported source, copyright uncertainty, missing files, API rejection or dangerous output.
- Store account tokens encrypted at rest, redact credentials from logs, use platform OAuth scopes, never bypass platform rules.
- Bound API calls and retries, add idempotency keys and prevent duplicate publishing.
- Verify Remotion license applicability and platform API rights before commercial unattended use.

## Developer bootstrapping
Use Laravel's conventional project structure and dependency installation. PHP, Composer, Node, Python, FFmpeg and a compatible local TTS installation are required for their respective milestones. No paid services are required for foundation.

## Decision record
- 2026-11-20: app-first architecture, Laravel/Inertia + Python worker + Remotion. Initial brand ToolPilot Daily. Production runs locally. Feature growth must not displace the first working video.
