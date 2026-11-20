# Veyora Media Engine

Local-first media production application for **ToolPilot Daily**.

**Status:** Foundation in progress. Autonomous publishing, AI research, and video generation are **not yet implemented**.

## Direction
- Management app: Laravel 12, Inertia React, Tailwind CSS 4, SQLite, database queue.
- Processing: local Python worker for research/AI/voice; Remotion + FFmpeg for video composition.
- Production: research → evidence verification → script/storyboard → narration/assets → render → QA → approval → platform-specific export → approved publish.
- v1: one ToolPilot Daily brand, one 30–60 second template-driven video per production cycle.

## Project docs
- [Plan](docs/Plan.md)
- [Product requirements](docs/PRD.md)
- [Implementation tasks](docs/Tasks.md)
- [Design system](docs/DesignSystem.md)
- [Automation contract](docs/Automation.md)

All external credentials belong only in local environment variables or encrypted local configuration, never in Git. No publishing is enabled by default.
