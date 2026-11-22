# Veyora Media Engine Interface Plan

## Goal
Build a local-first browser UI controlling the existing ToolPilot production pipeline. Preserve existing Remotion compositions, storyboards, intro/outro, narration presets and export formats. Do not rewrite the engine.

## Stack
Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui; local Ollama HTTP API; existing Remotion and TTS tooling. Add PostgreSQL + Drizzle only when durable multi-entity data needs justify it; begin with repository-compatible storage and inspect current code before choosing.

## Delivery phases
1. Audit existing repository and capture baseline fixtures and QA results.
2. App shell, navigation, dashboard, episode listing and details.
3. Ollama connectivity, model discovery, selection, health and script generation.
4. Production Studio: editable script/storyboard, render jobs, previews, per-stage retry, approved voice/assets.
5. Media library, QA gates and exports (landscape, vertical, square as supported).
6. Publishing integrations only after local production is reliable.

## Constraints
Local-first, no mandatory paid APIs, avoid model duplication, no unapproved publishing, no destructive changes to existing pipeline. Background rendering must not block UI. Validate actual available local resources.

## First milestone
From browser, connect to local Ollama, select a detected model, generate/edit/save a ToolPilot episode script, with explicit error and timeout states.
