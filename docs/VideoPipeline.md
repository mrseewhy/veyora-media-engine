# Video Pipeline Contract

## Proposed episode JSON (version 1)
```json
{
  "schemaVersion": 1,
  "slug": "toolpilot-example",
  "title": "An AI Tool in 100 Seconds",
  "format": {"width": 1920, "height": 1080, "fps": 30, "targetSeconds": 100},
  "voice": {"engine": "piper", "model": "local-model-path"},
  "scenes": [
    {
      "id": "hook",
      "kind": "title",
      "startMs": 0,
      "durationMs": 5000,
      "narration": "What does this AI tool actually do?",
      "headline": "AI Tool in 100 Seconds",
      "assets": [],
      "sources": []
    }
  ]
}
```
This is a contract sketch, not a complete valid 100-second episode. The implemented latency contract is stricter and lives in `packages/shared/src/storyboard.ts`.

## Render stages
Validate schema and media rights -> synthesize narration -> measure timings -> align/adjust timeline -> generate scenes -> compose video/audio -> emit captions -> ffprobe -> QA report.

## Renderer decision (updated 2026-11-22)
- **Visual composition:** Remotion 4.0.545 + React/TypeScript for the 10-second latency proof. Scenes are pure functions of validated props and frame time; reusable components share theme tokens, typography and safe areas.
- **Media processing and validation:** FFmpeg/ffprobe remain authoritative for trimming, silence detection, loudness normalisation, muxing, probing and contact sheets.
- **Why:** the earlier FFmpeg-only proof could compose clips but made intentional interface motion and frame-accurate overlays expensive to iterate. Remotion gives deterministic React scenes while preserving FFmpeg for the media contract.
- **Licence:** reviewed for this use; see [Licensing](Licensing.md). A company licence is required outside Remotion's free-use terms.

## 10-second Remotion pipeline
1. `latency:measure` starts a local streaming endpoint, performs five measured requests and writes `fixtures/storyboards/toolpilot-latency-measurement.json` plus a local copy under `data/renderer10/`.
2. `voice:latency` generates the Gemini Flash TTS take (Puck) into `data/renderer10/narration-raw.wav`.
3. `latency:sync` trims leading/trailing silence, normalises to 48 kHz mono PCM, synthesises the original SFX, measures the sentence pause, updates caption/beat timings in the storyboard and writes the asset manifest.
4. `storyboard:validate` checks the data contract, required assets, caption/scene overlap and disclosure.
5. `scene:render` renders the Remotion composition at 1920×1080/30 fps, then runs a two-pass FFmpeg loudnorm to -16 LUFS, writes SRT/transcript/QA/render metadata and builds a ten-frame contact sheet.
6. `qa.json` must pass before the artifact is considered machine-verified. Human review is separate.

### Implemented scene primitives
- **ScreenDemo:** simulated assistant UI, measured network panel, camera push-in and a labelled reveal of the request trace.
- **MetricTimeline:** TTFT/total metric cards, left-to-right request timeline, perceived-vs-actual comparison and hidden-latency bracket.
- **Callout:** measured 2.51 s verdict with a UI-vs-API strip and the "measure the API call" instruction.
- **BrandOutro:** available in the contract for future episodes; not used in the 10-second proof.

### Time contract
- Storyboard time is integer milliseconds.
- Frames are derived only at the render boundary with `msToFrame(ms, fps)`.
- Scenes and beats must cover the full duration without accidental gaps or overlaps.
- Captions are measured from the actual audio, never estimated from character count.
- Narration starts at 300 ms; the two cues are 260–3,610 ms and 3,730–6,370 ms.

## Output layout (ignored by Git)
`data/episodes/<slug>/<run-id>/{video.mp4,captions.srt,manifest.json,qa.json,thumbnail.png,intermediates/}`

The 10-second proof uses `data/renderer10/`:
`{toolpilot-latency-10s.mp4,toolpilot-latency-10s-raw.mp4,toolpilot-latency-10s.srt,transcript.txt,qa.json,render-metadata.json,asset-manifest.json,contact-sheet.png}`.

## Required QA
Resolution 1920x1080; expected frame rate; H.264 video/AAC audio; duration within agreed tolerance; frame count; 48 kHz audio; caption intervals within video; integrated loudness near -16 LUFS; true peak at or below -1 dBTP; assets exist; no accidental long silent gaps; licensed media manifest present; disclosure visible for simulated UI or data.

## Future contracts
Source citations and confidence/review status per factual claim, publishing approval state, retryable job identifiers and channel-specific branding.


## Visual Director stage (planned contract, approved 2026-11-23)
The older short render-stage list above omits the new editorial requirement. Target orchestration is **research with cited claims → script → approved narration take/timing → Visual Director shot list → rights-reviewed/generated assets → shot animatic + creative QA → Remotion/FFmpeg full assembly → native format adaptations → technical/factual/creative QA → human approval**. Mixed footage, photos, illustrations, caricatures, screenshots and short generated motion may be used when story-appropriate. Avoid title-card fallback and no mandatory blue palette. Missing assets or rights yield blocking statuses, never fabricated evidence. Preserve approved narration across visual revisions. Full schema, examples and rollout in [VisualDirector.md](VisualDirector.md). This is **not yet an executable pipeline stage**.



## Latest full-episode production contract (2026-11-23)
The next task is **not** a short proof: follow [FullEpisodeProduction.md](FullEpisodeProduction.md) for the entire Singularity Explained episode. Sequence: verify existing assets/audio/reference → story acts and narration-timed *observable-action* shot list → rights-cleared asset acquisition/creation → action-based Remotion edit → vocal FX, SFX and licensed/original music mix → full landscape render → contact sheets, captions, technical and creative QA → timecoded revisions → operator review → native vertical/square versions. Preserve locked narration and existing quality baseline. A static image with zoom/colour changes is not a narrative action. No Ollama dependency. No silent paid API calls. The prior 15-second design proof is superseded as a delivery milestone.
