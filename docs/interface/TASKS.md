# Interface Implementation Tasks

## Phase 0: Baseline
- [ ] Inspect existing repo structure, package scripts, branches and docs
- [ ] Identify production pipeline entry points and canonical assets
- [ ] Record current rendering outputs and tests; preserve approved voice, intro and outro
- [ ] Choose non-conflicting app directory after audit

## Phase 1: Application shell
- [ ] Scaffold Next.js UI within repository without replacing existing packages
- [ ] Create responsive navigation and dashboard
- [ ] Implement episode list, detail, create and edit screens
- [ ] Add accessible loading, empty, error and success states

## Phase 2: Ollama integration (first working milestone)
- [ ] Add server-side Ollama adapter with configurable base URL (default localhost:11434)
- [ ] Health check and installed model discovery using Ollama API
- [ ] Model selector and task assignment UI
- [ ] Script generation endpoint with streaming or progress feedback
- [ ] Save editable script and generation metadata
- [ ] Test offline, unavailable server, slow response, cancellation and malformed output

## Phase 3: Production
- [ ] Connect existing storyboard generation and scene previews
- [ ] Lock approved voice presets and asset hashes
- [ ] Introduce persistent job state and background rendering worker
- [ ] Add audio preview and per-stage retry
- [ ] Enforce intro 5s, outro 8s, narration 100–120s
- [ ] Render and verify each supported aspect ratio
- [ ] Add QA reports and approval gate

## Phase 4: Operations
- [ ] Media library and version history
- [ ] Export/download interface
- [ ] Optional publishing integrations after approval
- [ ] Setup guide, test suite and regression checklist

## Definition of done
Every task includes functional UI, error handling, tests, and verified integration; no silent changes to the existing production pipeline.
