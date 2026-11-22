# Automation Workflow

## Pipeline
1. Topic candidate: manual initially; AI discovery later.
2. Research: official documentation and other credible sources, URL + retrieval date.
3. Claims: extract verifiable statements; flag unknowns for human review.
4. Script: concise narration, hook, demo and takeaway; timed segments.
5. Storyboard: structured scenes with assets, transitions and captions.
6. Asset acquisition: original graphics or permissioned screenshots, license manifest.
7. Narration: local TTS, timed segments and pronunciation checks.
8. Render: Remotion visual timeline; FFmpeg audio processing, muxing and export.
9. QA: ffprobe + missing asset checks + full human viewing.
10. Approval: explicit operator signoff.
11. Upload: YouTube API (later); private/unlisted test first.
12. Publish: separate explicit action; retain logs and provenance.

## Failure behavior
Every step stores its inputs, outputs, version and errors. Rerun failed steps without duplicating completed uploads. Missing sources or licenses block automated approval. No publish on failed QA.

## AI boundaries
AI may propose claims and scenes, not assert unverified facts as checked. Never generate fake product screenshots and present them as real. Never scrape private accounts or bypass platform terms.

## Cost and operational controls
Keep rendering local. Gemini narration regeneration requires an API key and may incur usage costs; an existing local take can be reused for rendering. Record provider costs, limit concurrent renders and disk usage, and keep secrets only in environment variables.

## Observability
Job ID, episode ID, step, duration, output location, warnings, retry count and approval actor/time.
