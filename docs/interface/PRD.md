# Interface Product Requirements

## Users and jobs
Initially one operator; later multiple channels. Manage episode lifecycle from idea to approved export in one interface.

## Navigation
Dashboard, Channels, Episodes, Production Studio, Media Library, Models, Publishing, Settings.

## MVP workflows
- Show Ollama connectivity and list installed models, sizes and availability when provided by API; choose model per task.
- Create episode from topic, target audience and duration; generate draft script; edit and save revisions.
- View episode states: idea, scripting, storyboard, audio, rendering, QA, approved, exported, published.
- Preview production artifacts; rerun individual failed stages without overwriting approved assets.
- Pin an approved voice configuration and reuse it across episodes; never silently substitute a voice.
- Manage existing intro/outro and brand templates without replacing them automatically.
- Export requested formats and report actual duration and QA status.

## ToolPilot rules
Content narration target 100–120 seconds; intro 5 seconds with music only; outro 8 seconds with music only (5 seconds animation plus 3 seconds static). Keep narration and intro/outro separate. Enforce these constraints in validation and report exceptions.

## Quality and safety
Human approval before publishing; versioned script and media artifacts; visible failures; avoid exposing local model server publicly; restrict tool execution and filesystem access. Never promise model compatibility based solely on file extension.

## Acceptance
Operator can connect to Ollama, select an installed model, create/edit a script, and see clear errors when Ollama is unavailable. Later phases require passing render regression tests against existing outputs.

## Out of scope initially
Direct GGUF upload, building an inference engine, cloud hosting of local models, automated posting, multi-user billing.
