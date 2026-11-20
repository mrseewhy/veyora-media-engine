# Automation Contract and Safety

## Responsibility boundary
Laravel is the sole authority over workflow state and publication. The Python worker and Remotion renderer are deterministic subprocessors from the perspective of the queue.

## Pipeline contract
Each stage receives a versioned JSON manifest in a job-specific directory and returns a JSON result with `run_id`, `stage`, `status`, `artifacts`, `errors`, `warnings`, `timings`. No secrets in manifests or logs. Runtime provider keys come from process environment only.

## Proposed transitions
- intake → research → evidence_review → scripting → editorial_review → voice → render → QA → variants → publication_approval → schedule → publish → analytics
- Any stage may transition to `held` or `failed`; retries reuse the same run and idempotency key.
- A rejected claim, missing asset license, or failed QA cannot transition to publishing.
- External publishing is **off** by default and can never bypass an explicit approval gate in M1–M4.

## Research rules
Use allowlisted RSS, official product sites, permitted APIs and documented publication dates. Keep canonical URL, extraction timestamp, source reliability, exact claim mapping and any uncertainty. Avoid unverified performance/pricing claims and invented tool demonstrations.

## Job processing
- Laravel dispatches one job for one stage with a DB transaction around state writes.
- Job manifest path includes stable run UUID; worker writes outputs atomically.
- Set per-stage timeouts, attempt caps, exponential backoff, file size limits and maximum run concurrency of one initially.
- Validate returned JSON and required files before committing a completed stage.
- Logs are structured, redact tokens and private data, and preserve actionable errors.

## Publishing API adapters
- YouTube: authorized upload; preserve platform processing and visibility status.
- Instagram: only professional accounts with required Meta access and media conditions.
- Facebook: supported Page publishing with appropriate permissions.
- TikTok: permit only authorized, compliant content-posting workflows; manual handoff if app cannot meet review/consent requirements.
- Post key: unique per (`content_id`, `platform`, `variant_version`); lookup prior remote post before retrying unknown results.

## Scheduling
Use Laravel Scheduler plus a local queue worker and macOS launchd to keep processes running. Scheduled job trigger does not automatically mean public posting is allowed.

## Cost guardrails
Default to locally installed/offline providers. Explicit per-run token and external API budgets. Paid model fallback must be opt-in. Record estimated cost per job and stop on budget exceedance.

## Test plan
Mock provider interfaces; do not make real publication API calls in CI. Test invalid manifest, subprocess timeout, missing output, malformed JSON, out-of-order transition, revoked token, duplicate retry and QA hold.
