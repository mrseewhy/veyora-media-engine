# Production Intelligence v1

Status: implemented as a local PostgreSQL + Drizzle service and CLI. It records feedback and evaluation history without changing the Remotion, Gemini, storyboard or FFmpeg pipelines. No dashboard, model fine-tuning, paid service or automatic prompt rewriting is included.

## Database and migration

The migration in `drizzle/0000_material_master_chief.sql` creates `episodes`, `render_versions`, `scene_feedback`, `production_lessons`, `evaluation_runs` and `lesson_applications`. The sixth table records which approved lesson was placed into a script or storyboard planning context for a specific episode and storyboard version. All tables are additive; the database had no public application tables before this migration.

`episodes.id` uses the existing storyboard `episodeId`. `render_versions` stores artifact paths, SHA-256, version, storyboard version, QA snapshot and approval status. `scene_feedback.scene_id` uses existing storyboard scene IDs, or is null for whole-video feedback. The storyboard itself remains in its existing JSON file; the database records its path and version rather than duplicating its structure. Foreign keys use `RESTRICT` deletes to preserve review history.

```bash
npm ci
npm run db:migrate
npm run intelligence -- db check
```

The CLI loads the existing ignored `.env` only when `DATABASE_URL` is not already set. It does not print the connection string. `db:generate` is available for future additive schema changes. Avoid `drizzle-kit push` on the production database; review generated SQL and apply migrations.

## Feedback and render review

Register an episode and a render using the existing storyboard and QA artifact:

```bash
npm run intelligence -- episode register --storyboard fixtures/storyboards/toolpilot-latency-10s.json --title "ToolPilot Latency"
npm run intelligence -- render register --episode toolpilot-latency-10s --artifact data/renderer10/toolpilot-latency-10s.mp4 --qa data/renderer10/qa.json
npm run intelligence -- render list --episode toolpilot-latency-10s
```

`render register` hashes the actual MP4, requires a matching hash in QA, and records an automated technical evaluation from the QA checks. It never marks the render approved. If another render has overwritten either file under ignored `data/`, regenerate or restore a matching artifact/QA pair before registering it. To rate a scene, write a JSON file outside Git (for example `data/feedback.json`):

```json
{
  "renderId": "RENDER_UUID",
  "sceneId": "s2-trace",
  "rating": 2,
  "problemCode": "scene_variety",
  "comment": "The loop resembles the preceding card layout.",
  "requestedCorrection": "Use a distinct visual metaphor for the loop.",
  "reviewer": "operator"
}
```

Then run:

```bash
npm run intelligence -- feedback add --file data/feedback.json
npm run intelligence -- feedback list --render RENDER_UUID
npm run intelligence -- render compare --left OLD_RENDER_UUID --right NEW_RENDER_UUID
npm run intelligence -- render status --id RENDER_UUID --status needs_changes --actor operator --reason "Scene variety needs work"
```

Omit `sceneId` to rate the whole video. Ratings are integers 1–5. A rating of 1 or 2 requires a problem code. Supported codes: `visual_storytelling`, `scene_variety`, `narration`, `pacing`, `readability`, `technical`, `factual_accuracy`, `other`. Comparison returns both artifact hashes, statuses, durations, feedback, evaluations and changed QA checks. To approve, use `--status approved` with an actor and reason. Approval is blocked if technical QA fails or a newer render version exists. The local CLI assumes its operator is authorized; multi-user authentication is future work.

## Lessons and planning context

`lesson extract` groups repeated low-rated corrections by journey template and problem code. It creates **candidate** lessons after at least two matching feedback records. It does not call an AI model. Approved and rejected lessons are never silently rewritten by a later extraction. A reviewer can also propose a preference or successful pattern from a JSON file:

```json
{"category":"successful_pattern","scope":"concept-explainer","statement":"Use an original comic reaction to clarify a technical contrast."}
```

```bash
npm run intelligence -- lesson extract --min 2
npm run intelligence -- lesson propose --file data/success-pattern.json
npm run intelligence -- lesson list --status candidate
npm run intelligence -- lesson review --id LESSON_UUID --status approved --actor operator
npm run intelligence -- lesson context --episode NEXT_EPISODE_ID --kind storyboard --apply-by operator
npm run intelligence -- lesson usage --episode NEXT_EPISODE_ID
```

Only **approved** lessons appear in context. `--apply-by` records an application in `lesson_applications` for that episode, storyboard version and context kind. Omitting it previews context without recording use. A caller can pass the returned text to a future script or storyboard generator; there is no generator to wire into yet. It remains editorial guidance, never an automatic rewrite of prompts or code. No lesson becomes an approved production rule without a deliberate `lesson review` command.

### Example: one video informs the next storyboard

The PostgreSQL integration test uses a private temporary artifact and a copy of the AI Agents storyboard. It records two low ratings for the `agent-loop` and `missing-eggs` scenes, both tagged `scene_variety`. Extraction proposes “Use a distinct visual metaphor.” The test explicitly approves that candidate, registers a *different* concept-explainer episode, obtains its storyboard context, and records that the lesson was applied. All test writes roll back. In real use, the next episode's planner receives the approved lesson text; the operator still checks whether it fits that episode. This demonstrates cross-episode retrieval without silently modifying any storyboard JSON.

## Evaluation

Automated evaluation records only measurable QA checks from the render's existing QA JSON. Human evaluation records six separate 1–5 creative scores: visual storytelling, scene variety, narration quality, pacing, readability and factual accuracy. `technicalResult` stays separate from `creativeScores`; machine QA does not claim to judge craft or facts. A human evaluation JSON file looks like:

```json
{
  "renderId":"RENDER_UUID",
  "evaluator":"operator",
  "scores":{"visualStorytelling":4,"sceneVariety":3,"narrationQuality":4,"pacing":4,"readability":5,"factualAccuracy":4},
  "factualNotes":"General tool-use explanation checked against primary documentation."
}
```

```bash
npm run intelligence -- evaluation run --file data/evaluation.json
npm run intelligence -- evaluation list --render RENDER_UUID
```

The schema can record a model version and `ai_proposed` evaluator type later, but v1 uses only deterministic QA and human scoring. A creative score of 1 or 2 yields `needs_review`; failed technical checks yield `fail`. Neither result automatically approves or rejects a render.

## Verification and limits

The migration was applied to the configured local `veyora-engine` PostgreSQL database. The rollback-only integration test covers registration, two render versions, scene feedback, comparison, candidate extraction, explicit lesson approval, context retrieval for a second episode, application tracking, human evaluation history and render status. `npm test` covers pure validation and existing video regressions; run `RUN_DB_TESTS=1 node --test dist/tests/intelligence-db.test.js` for the local database test. The test creates its own artifact and QA snapshot so concurrent video renders cannot change its inputs, and it leaves no episode or lesson rows.

Outstanding: actual script/storyboard generation services do not exist yet, so context is exported through a service function and CLI. There is no automatic subjective scoring, factual verification, authentication or full dashboard. Existing production dependency audit warnings concern `@huggingface/transformers`, `kokoro-js` and `sharp`; the new `drizzle-orm`/`pg` packages were not listed in that audit.
