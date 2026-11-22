# Production User Journey (Operator UX)
Status: specification, not evidence that these screens exist. Audience: one ToolPilot producer; later multiple Veyora channels. The operator controls editorial quality and publishing. See [VideoExperience](VideoExperience.md), [StoryboardSystem](StoryboardSystem.md), [PRD](PRD.md).

## Product principle
The interface is a **production cockpit**, not a generic AI chat window. Every episode has a visible stage, next action, blockers, cost estimate and preview. Automation creates proposals; operator can override them. Preserve revisions, source provenance and approval history. Local-first Next.js + PostgreSQL/Drizzle when dashboard phase begins; until then, mirror these transitions in typed JSON/CLI.

## Information architecture
Navigation: **Production Queue** (home), **New Episode**, **Episode Workspace**, **Asset Library**, **Templates**, **Jobs & Errors**, **Publishing**, **Settings**. Do not build analytics or team administration in v1.

### Queue / home
Table or cards with thumbnail, title, channel, series, template, lifecycle status, last update, duration, estimated cost, blocked reason and next action. Filter by status/channel, search title, sort last update. Actions: Create, Resume, Preview, Duplicate as new draft, Archive (confirmation). Empty state points to Create Episode. A failed render shows **Retry render** and its error, not an unexplained spinner.

### New Episode wizard
1. Choose channel/series (default ToolPilot / AI Tools in 100 Seconds).
2. Choose **video category**: tool review, concept explainer, comparison, tutorial. Each has a different viewer journey.
3. Enter topic, target audience, learning outcome, target duration, desired tone, mandatory points, forbidden claims, optional URLs and example media.
4. Choose **Manual script** or **AI-assisted research**. Show estimated cost and available provider; no silent paid call.
5. Create draft and open workspace. Allow saving partial draft; validate only required fields for the chosen action.

### Episode workspace (primary screen)
Header: title, status, template, duration budget, autosave state, cost, last render. Tabs:
- **Brief & Sources**: topic, audience, outcome, source URLs, retrieval dates, evidence/claims, unsupported-claim warnings.
- **Script**: narration grouped by beat, pronunciation notes, word count and estimated spoken duration; edit/rewrite per beat; version history; approve script.
- **Storyboard**: ordered scene cards and timeline; visual preview; assets, captions, camera, transition, audio, timing; regenerate **one scene**, not whole episode.
- **Voice & Assets**: provider/voice sample, narration per beat, real screenshot/screen capture, source/license metadata, missing asset flags.
- **Preview & QA**: draft MP4 player, timeline annotations, audio and caption checks, automated report, reviewer notes and rerender.
- **Publishing**: title, description, tags, thumbnail, destination channel, upload visibility, scheduling; disabled until approval and integration ready.
Persistent primary CTA changes with stage: **Review sources → Approve script → Review storyboard → Render draft → Review draft → Approve → Upload**. Never hide blockers.

## End-to-end happy path
1. Create episode and choose a journey template.
2. Research or supply facts. For each claim, see citation, evidence status (proposed/verified/rejected), source and retrieval date. Human resolves important claims.
3. Edit script with spoken-duration estimate and playback of voice samples. Approve a specific version; changes invalidate downstream approvals.
4. Auto-propose scenes from beats. Operator sees what the viewer sees at each timestamp and whether it demonstrates rather than repeats the narration.
5. Resolve missing visuals: attach screenshot/recording, build original diagram, or mark intentional text-only moment. Record usage rights.
6. Render preview (prefer low-res/short segment first); worker reports step, progress, logs and estimated completion. Preview can be replayed without rerender.
7. Annotate scene/timecode defects, revise scene or narration, rerender affected scope if supported.
8. Full QA: machine checks + human watch-through; explicitly approve **this render version**.
9. Prepare metadata, upload private/unlisted for review, then separate explicit public-publish action. Preserve YouTube ID and results.

## Alternate/error journeys
- Research unavailable: continue with manual sources; mark unverified claims and block approval.
- Script too long: show target vs estimated duration; offer trimming, never silently speed voice unnaturally.
- TTS quota/error: keep script and scenes; retry or select alternative provider with cost confirmation.
- Asset missing/unlicensed: show exact scene and file; block render/approval as appropriate.
- Render failed: retain logs, stage and intermediates; retry idempotently, never duplicate job/upload.
- Video quality rejected: reviewer marks timestamp + reason (pacing, visual mismatch, readability, voice, technical error); return to affected scene; do not label complete.
- Provider cost exceeds cap: pause for explicit confirmation; no account rotation to evade quotas.
- Upload fails: keep approved artifact; retry only after checking prior upload status to prevent duplicates.
- User exits mid-flow: draft persists with next-action cue.

## State machine and permissions
Draft → Researching → SourcesReviewed → ScriptApproved → StoryboardApproved → AssetsReady → Rendering → NeedsQA → RenderApproved → UploadReady → UploadedPrivate → Published.
Side states: NeedsChanges, Blocked, Failed, Cancelled. Each transition records actor, time, input version, output version and reason. Editing approved script/storyboard invalidates dependent approval; render approval is tied to artifact hash. **Only the operator** can approve factual claims, final render and public publishing. AI proposals never self-approve.

## Core data objects (conceptual, not a schema migration)
Channel; Series; Episode; Brief; Source; Claim; ScriptVersion; Beat; StoryboardVersion; Scene; Asset; NarrationTake; RenderJob; RenderArtifact; QAResult; Approval; UploadRecord. Assets include path, provenance, license, owner and usage scope. Job includes input hash, attempts, status, errors and output references.

## Interaction/UX requirements
- Desktop-first editor; readable on laptop; mobile supports queue/review but not full timeline editing initially.
- Keyboard-friendly scene navigation, drag reorder with accessible alternatives, autosave indicator and explicit version snapshots.
- Preview at selected scene/timecode, waveform/caption track and safe-area overlay.
- Distinguish **Generate**, **Regenerate**, **Render**, **Approve**, **Upload**, **Publish** as separate operations.
- Never imply AI-generated mock UI is a real screenshot. Mark simulations visibly.
- Cost/credits displayed before provider calls; secret keys stored outside DB/logs where possible.

## Implementation order
First define CLI JSON contracts and scene preview for the 10-second quality benchmark; later build storyboard workspace, then queue/approval/jobs, then publishing. Do not build full UI before an accepted visual scene.

## Acceptance scenarios
- Operator creates a tool-review draft and can see the proposed six-beat journey.
- Operator rejects one unverified claim; publishing remains blocked.
- Operator swaps a scene's screenshot and rerenders without losing the script.
- Operator compares two render versions and approves only the chosen artifact.
- Render failure has clear recovery and no duplicate upload.
- No public video can be published without a deliberate confirmation.
