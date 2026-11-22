# Veyora Media Engine — Implementation Plan

## Mission
Local-first, repeatable production engine for ToolPilot's **AI Tools in 100 Seconds**. Target: high-quality, fact-checked explainers using real product demonstrations, motion graphics, voiceover and captions. Initial output is a draft MP4, not autonomous publication.

## Architecture
- **Runtime:** Node.js + TypeScript monorepo (pnpm workspaces).
- **Renderer:** FFmpeg baseline, with programmatic scenes and overlays; evaluate Remotion only after verifying license for our intended automated commercial use.
- **Narration:** Piper local TTS, verify voice-model license. Replaceable speech adapter.
- **Media:** local files under ignored data directory; manifest tracks source and license.
- **App:** Next.js dashboard after CLI pipeline is proven.
- **DB:** local PostgreSQL + Drizzle, added with job management; database is not a prerequisite for renderer proof.
- **Workers:** separate Node process for durable queued jobs; never render in Next.js request handler.
- **AI:** provider-agnostic research/script adapters with explicit budgets, source capture and review gates.
- **Publishing:** YouTube Data API only after explicit approval; credentials via environment variables, never committed.

## Sequence and exit gates
1. **Renderer proof:** a human-approved 100-second script + licensed assets -> playable 1920x1080 MP4, synchronized voice/captions, valid duration and no missing frames.
2. **One-command pipeline:** typed episode JSON -> narration, scene assets, captions, render, metadata, validation report. Rerunnable with stable output IDs.
3. **AI-assisted preparation:** source-backed topic discovery, claim verification queue, script and scene planning; no unsourced claims automatically approved.
4. **Dashboard and persistence:** PostgreSQL, Drizzle migrations, projects, episodes, assets, jobs, review states, preview/rerender; background worker with retries.
5. **Publishing:** authenticated upload, metadata, thumbnail, private/unlisted-first validation, explicit publish approval; respect YouTube API quota/audit restrictions.
6. **Scale:** templates, multiple channels, scheduling and analytics only after stable production.

## Definition of done
Each phase must demonstrate its exit gate on a real output and pass tests. Reliability means observable success rates, not a promise of 100% autonomous factual or creative quality.

## Risks / decisions to validate
- FFmpeg animation quality vs Remotion licensing/complexity.
- Piper voice quality and specific voice-model licenses.
- Screenshot capture permission, attribution, trademark/copyright.
- Source quality and changing product interfaces.
- YouTube API restrictions, monetization/originality policies.
- Local CPU/RAM rendering time and storage consumption.

## Working principles
CLI-first; local-first; reproducible; human review before publication; no paid provider required for renderer proof; no credentials in Git.
