# Testing and Acceptance

## Automated
- Unit: schema validation, time math, scene overlaps/gaps, asset existence, caption boundaries.
- Integration: synthesize short voice fixture, render 5–10-second video, inspect with ffprobe.
- Repeatability: same inputs generate valid outputs on successive runs.
- Failure injection: missing file, malformed scene, TTS failure, FFmpeg exit, partial render.
- Later: job retry/idempotency, Drizzle migrations, YouTube upload state handling.

## Manual quality gate
Watch the entire 100-second MP4. Check pacing, voice pronunciation, music/SFX rights, factual claims, screenshots, legibility, audio levels, transitions and ending. Approve or record issues and rerender.

## Evidence to record
Command used, software versions, input manifest, output path, duration/resolution/codecs, QA JSON, reviewer decision and outstanding defects.

## Definition of proven
A real video is produced and reviewed. Passing unit tests alone is not proof of visual quality; no 100% guarantee of factual or platform outcomes.
