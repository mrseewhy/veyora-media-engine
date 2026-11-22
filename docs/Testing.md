# Testing and Acceptance

## Automated
- Unit: schema validation, time math, scene overlaps/gaps, asset existence, caption boundaries.
- Storyboard contract: strict discriminated-union validation, beat/scene coverage, scene-in-beat containment, evidence references, simulated-data disclosure, caption/narration text coverage, emphasis phrases, caption/scene overlap, SRT formatting.
- Render QA: H.264/AAC presence, 1920×1080, 30 fps, frame count, duration tolerance, 48 kHz audio, caption bounds, two-pass loudness, true peak.
- Integration: synthesize a short voice fixture, render a 5–10-second video, inspect with ffprobe.
- Repeatability: same inputs generate valid outputs on successive runs.
- Failure injection: missing file, malformed scene, TTS failure, FFmpeg exit, partial render.
- Later: job retry/idempotency, Drizzle migrations, YouTube upload state handling.

## Commands
```bash
npm test                       # build + 18 repository tests
npm run typecheck:remotion     # Remotion/React TypeScript check
npm run storyboard:validate    # fixture, assets, captions, disclosure
npm run latency:prepare        # verify measured narration timing without editing
npm run scene:render           # full 10-second Remotion render + FFmpeg QA
npm run scene:studio           # interactive preview
```

`npm run latency:sync` updates the fixture's measured caption timings. It should be run only after regenerating the narration take and reviewing the diff; it is not part of a normal validation run.

## 10-second latency proof evidence (2026-11-22)
- Output: `data/renderer10/toolpilot-latency-10s.mp4`.
- Probe: 10.006 s, 1920×1080, 30 fps, 300 frames, H.264 video, AAC audio, 48 kHz stereo.
- Loudness: -16.01 LUFS integrated, -2.97 dBTP true peak, 6.8 LU range.
- Captions: c1 260–3,610 ms; c2 3,730–6,370 ms. Both inside the video and ordered.
- Machine QA: 15/15 checks passed (`data/renderer10/qa.json`).
- Repository tests: 18/18 passed, including storyboard contract, SRT, frame conversion and video-QA unit tests.
- Visual spot-check: ten-frame contact sheet plus full-resolution frames at 0.5 s, 1 s, 3.7 s, 4.5 s, 5.5 s, 6.5 s, 8.6 s and 9.5 s. No clipped interface text or caption collisions observed in those frames.
- Audio spot-check: speech begins at 0.38 s; the trimmed narration ends around 6.22 s; the verdict impact lands at 8.2 s. The caption lead/trail is within the measured tolerance.
- Remaining gate: full playback on desktop and mobile by a human reviewer, factual/brand sign-off, and explicit approval of the exact artifact.

## Manual quality gate
Watch the entire MP4, not only the contact sheet. Check pacing, voice pronunciation, caption sync, interface legibility, disclosure clarity, factual claims, SFX rights, audio levels, transitions and ending. Record defects with timestamps and rerender. Machine QA cannot approve craft, accuracy or brand fit.

## Evidence to record
Command used, software versions, input manifest, output path, duration/resolution/codecs, QA JSON, reviewer decision and outstanding defects.

## Definition of proven
A real video is produced and reviewed. Passing unit tests alone is not proof of visual quality; no 100% guarantee of factual or platform outcomes.
