# Product Requirements Document

## Product
Veyora Media Engine is an internal, single-operator application for managing research, narrated short videos and authorized distribution for ToolPilot Daily.

## Roles
- **Administrator:** full editing and approval rights. No public signup.
- **Automation service:** machine identity restricted to running allowed jobs; cannot approve content or change publishing credentials.

## Core lifecycle
Topic draft → researching → evidence review → script draft → editorial approved → rendering → QA → awaiting publication approval → scheduled → publishing → published or failed.

## Functional requirements
### R1. Dashboard
List today's jobs and counts for discovered topics, scripts, renders, pending approvals, scheduled publications, failures, and recent events. Never show mock analytics as real results.

### R2. Research
Manually add topics, configure approved RSS feeds, deduplicate by canonical URL/title, inspect source capture date, verify primary-source evidence and block unsupported claims.

### R3. Creative studio
Create typed script and storyboard records: video format, duration, opening hook, scenes, narration, on-screen text, source references, asset attribution and call to action. Edit and request partial regeneration.

### R4. Production
Render a reproducible 1080x1920 MP4, caption file, audio and thumbnail. Report job progress, elapsed time, errors and artifacts. Keep completed source material when retrying failed stages.

### R5. Platform variants
Generate YouTube Shorts, TikTok, Instagram Reels and Facebook Reels exports with individual hooks, subtitles, safe-area constraints and metadata. Do not assume every connected account permits public API publishing.

### R6. Publishing
Only publish explicitly approved, QA-passing variants through authorized platform API routes. Support schedule changes, state polling, retries with idempotency checks, rate limits, expired-token handling and manual fallback when access is unavailable.

### R7. Settings
Brand style, allowed research sources, video templates, generation budgets, API/provider settings, approval requirements and time zone. Never expose tokens to client-side pages.

## Data model
brands, topics, research_sources, research_evidence, content_items, scenes, media_assets, production_runs, publications, social_accounts, automation_rules. Add tables as their owning feature is implemented; avoid speculative schemas.

## Non-functional
- Secure, private local-by-default access, single admin, no public signup.
- Idempotent jobs; retry-safe subprocesses; fail-closed publishing.
- Strong input validation and tests covering authorization, state transitions and errors.
- Clear provenance for facts and copyright/license metadata for every third-party visual.
- Easy backup of SQLite and generated media; secrets outside version control.

## First acceptance test
From the web UI, create a topic, queue an intake job, see its persisted status, and later use an approved sample script to produce a real MP4. A queued job is not proof that AI research or video generation already works.

## Out of scope
Commercial SaaS subscriptions, general video editing, multi-tenant client access, premium generative footage, automatic monetization, fabricated product demos, unapproved posting and scraping behind authentication.
