# Interface Technical Architecture

## Boundaries
Next.js web app (UI + authenticated local API routes) -> application services -> Ollama adapter / existing episode pipeline -> background render worker -> local artifact storage. Reuse current Remotion and TTS code, not parallel implementations.

## Ollama
Connect server-side to configurable OLLAMA_BASE_URL (default http://127.0.0.1:11434). Query /api/tags for models, /api/generate or /api/chat for text, and optional /api/ps for loaded models. Handle timeouts, unavailable runtime, and explicit cancellation. Never expose Ollama port to public internet or send secrets in prompts.

## Agent layer
Initially use deterministic pipeline steps, not unrestricted autonomous agents. Each step has validated inputs, bounded tools, execution logs, retry policy and human review. Tool use is an application feature, not a capability implied by importing a model.

## Storage
Keep large media artifacts and downloaded models outside git. Store artifact paths, hashes, approval status, model identifier, prompt version and voice preset identifier. Evaluate current repo storage before introducing PostgreSQL/Drizzle. Use job persistence before implementing long-running render queues.

## Render workflow
Episode -> script -> storyboard -> voice -> scenes -> Remotion renders -> QA -> approval -> exports. Each stage has independent state, input hash, output hash and retry. An approved voice/intro/outro is immutable for a job unless explicitly changed. Validate content narration 100–120s, separate 5s intro and 8s outro (5s animated + 3s still).

## Local development
Run UI, Ollama and worker as separate processes managed by a documented development command. Browser talks to web app; server calls Ollama. Include health checks and resource warnings suitable for 16GB Apple Silicon.

## Security and tests
Bind local services to loopback by default, validate file paths, restrict executable tools, avoid arbitrary shell commands from model output, require explicit publishing approval. Test adapters, workflow transitions, approved asset invariants and representative video regressions.
