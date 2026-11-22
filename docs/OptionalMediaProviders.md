# Optional Media Provider Design Notes

**Status:** Future enhancement only. **No integration authorized or installed.** This document records two reusable ideas from [ZeroLu/Ultimate-AI-Media-Generator-Skill](https://github.com/ZeroLu/Ultimate-AI-Media-Generator-Skill) (MIT-licensed repository). It is not a dependency, an endorsement of CyberBara pricing, or a change to the current production workflow.

## Current system stays unchanged
- **Remotion 4 + React/TypeScript** remains the visual renderer.
- **FFmpeg/ffprobe** remains the audio processing and technical QA layer.
- **Gemini Flash TTS** remains the preferred narration test provider, with existing local alternatives.
- **Typed storyboard and real/simulated evidence disclosures** remain authoritative.
- Existing scene fixtures, video templates, CLI commands, tests, assets, approvals, and milestone order are unchanged.
- No new packages, accounts, environment variables, credits, database tables, or network calls are required by this document.

## Idea 1: Quote cost before a paid media generation
The source project uses a quote → confirm → generate → poll → download flow. Adopt only the **quote-and-approval policy** if/when an optional paid image/video/audio generator is introduced.

Proposed behavior:
1. User selects provider/model, scene purpose, resolution, duration and quantity.
2. Adapter returns a provider quote where supported; otherwise return `estimateUnavailable` and require explicit approval before spending.
3. UI/CLI displays estimated **currency**, credits, quantity, expiry/assumptions, remaining budget and whether the quote is provider-confirmed or approximate. Never equate credits with USD without an exchange rate from the provider.
4. Check per-job and monthly budget caps; reject or pause when exceeded.
5. Require explicit operator approval **for the exact request and cost** before submission. Changing the model, quantity or settings invalidates the approval.
6. Record actual usage/cost after completion; show differences from the quote.
7. Retries that could incur new charges require a fresh cost check and explicit approval.

**No hidden spending:** automatic scene regeneration, failed-job retry, batch generation and fallback providers must never silently consume credits.

## Idea 2: Interchangeable optional media generators
A future media generation boundary should isolate provider-specific authentication, request schemas, asynchronous task IDs and download URLs. **This does not replace Remotion.** Generated clips/images are optional storyboard assets that Remotion can assemble alongside real screen recordings and original diagrams.

Illustrative TypeScript contract (not production code):
```ts
type MediaKind = "image" | "video" | "sound";
type Quote = {
  provider: string;
  model: string;
  estimatedAmount?: number;
  currency?: string;
  estimatedCredits?: number;
  confirmedByProvider: boolean;
  estimateUnavailable?: boolean;
  expiresAt?: string;
};
type GenerationRequest = {
  kind: MediaKind;
  model: string;
  prompt: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  references?: string[];
  episodeId: string;
  sceneId: string;
};
type GenerationResult = {
  providerTaskId: string;
  status: "queued" | "running" | "completed" | "failed";
  localAssetPath?: string;
  actualCost?: number;
  currency?: string;
  licenseMetadata?: Record<string, string>;
};
interface OptionalMediaProvider {
  quote(request: GenerationRequest): Promise<Quote>;
  submitApproved(request: GenerationRequest, approvalId: string): Promise<GenerationResult>;
  getStatus(taskId: string): Promise<GenerationResult>;
}
```

Provider implementation is intentionally deferred. Do **not** add a CyberBara SDK, clone the external repository, or hardcode its API format. If selected later, independently verify pricing, provider terms, commercial rights, service reliability and API behavior.

## Asset and workflow guardrails
- Generated media enters the existing **asset manifest** with provider, model, prompt/version, generation date, source, usage rights, cost and `generated: true`.
- Storyboard scenes reference those assets through the existing typed contract; never bypass scene validation or editorial approval.
- Never present generated product interfaces, benchmarks, statistics or demonstrations as real. Clearly label illustrative material where appropriate.
- Retain local copies when license permits, hash files, validate format/size and fail gracefully if an external service is unavailable.
- Secrets remain in ignored environment configuration; do not write credentials to source, logs, manifests or Notion.
- Prevent duplicate charged submissions with idempotency keys and persisted task IDs where supported.

## When to revisit
Only after the existing **10-second Remotion quality gate** is approved and an actual ToolPilot storyboard needs an asset that cannot be created effectively from real footage, screenshots, original graphics or Canva. Compare a single optional provider with existing tools on **quality, rights, price and repeatability** before implementation.

## Source provenance
Inspired by the external repository's credit guard (`src/cyberbara_cli/policies/credit_guard.py`), layered gateway/use-case separation, and asynchronous generation/task-polling workflow. We adopt **concepts**, not its code or CyberBara dependency. Source repository is MIT licensed; retain attribution if code is ever copied in a future, separately approved change.
