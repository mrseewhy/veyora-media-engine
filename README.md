# Veyora Media Engine

Local-first video production engine for **ToolPilot** (Veyora House), starting with the **AI Tools in 100 Seconds** series.

## Status
**Planning / renderer proof not yet implemented.** This repository has been reset to a renderer-first specification. Do not assume video generation or automated uploads work until acceptance tests pass.

## Chosen architecture
- **CLI + worker:** Node.js, TypeScript
- **Media:** FFmpeg / ffprobe; Piper local TTS (check model license)
- **Management UI (later):** Next.js
- **Database (later):** local PostgreSQL + Drizzle
- **Storage:** local filesystem
- **AI:** provider-agnostic, with claim/source review
- **Publishing (later):** YouTube API with explicit approval

Remotion is an optional future renderer subject to licensing review, not a dependency for the first proof.

## Build order
1. Produce and review one real ~100-second 1080p ToolPilot MP4.
2. Automate structured episode JSON -> MP4, captions and QA report.
3. Add AI research and script generation with source review.
4. Add Next.js dashboard, PostgreSQL and durable worker jobs.
5. Add approved YouTube upload/publishing.
6. Add multi-channel templates and analytics.

## Documentation
- [Plan](docs/Plan.md)
- [Product requirements](docs/PRD.md)
- [Tasks](docs/Tasks.md)
- [Design system](docs/DesignSystem.md)
- [Automation](docs/Automation.md)
- [Video pipeline](docs/VideoPipeline.md)
- [Testing](docs/Testing.md)

## First next action
Implement the renderer CLI and a source-backed, manually approved ToolPilot episode fixture. Validate the MP4 with ffprobe and watch it in full. No dashboard or database work until this succeeds.

No paid third-party account is required for the initial local renderer proof; future model/API and licensing costs must be checked before use.
