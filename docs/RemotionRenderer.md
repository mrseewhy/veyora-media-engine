# Remotion Renderer

Status: the 10-second latency composition is preserved as a regression baseline. A separate 30-second editorial preview for **AI Agents in 100 Seconds** is also implemented. Remotion remains the visual composition layer; FFmpeg remains the media-processing and QA layer.

## Why Remotion
The scene needs a believable developer interface, a request trace that reveals in sync with narration, and frame-accurate camera moves. Remotion lets those elements be React components driven by validated data and the current frame. It does not replace FFmpeg: trimming, silence detection, loudness normalisation, muxing, probing and contact sheets stay in the FFmpeg pipeline.

## Project structure
```text
remotion/
  index.ts                     registerRoot entry point
  Root.tsx                     composition + calculateMetadata
  theme.ts                     colour, type, radius and shadow tokens
  fonts.tsx                    local font loading with delayRender
  lib/animation.ts             easing, springs, entrances, formatting
  components/
    Stage.tsx                  grid, brand header, progress bar
    BrandMark.tsx              ToolPilot arrow + wordmark
    BrowserChrome.tsx          browser frame and address bar
    ChatPanel.tsx              simulated assistant interface
    NetworkPanel.tsx           measured request trace and stream chunks
    LatencyTimeline.tsx        left-to-right request timeline
    ComparisonTracks.tsx       perceived-vs-actual bars
    MetricCard.tsx             counted metric cards
    CalloutCard/Disclosure     labelled evidence badges
    CaptionTrack.tsx           measured caption cues
  scenes/
    ScreenDemoScene.tsx        hook: UI then network reveal
    MetricTimelineScene.tsx    proof: metrics, timeline, comparison
    CalloutScene.tsx           verdict: measured 2.51 s
    BrandOutroScene.tsx        reusable signature (not used here)
  compositions/
    LatencyVideo.tsx           audio, scene series, captions, stage
```

## Data contract
`packages/shared/src/storyboard.ts` is the single source of truth. It validates:

- schema version, 1920×1080, 30 fps and total duration;
- beats and scenes cover the full timeline without gaps or overlaps;
- every scene sits inside its beat and references a declared beat;
- every ScreenDemo/MetricTimeline/Callout measurement references declared evidence;
- captions concatenate to the narration text and emphasis phrases occur in their cue;
- every caption is referenced by a scene and overlaps that scene;
- simulated timing says "simulated" in its disclosure;
- beat narration ranges cover their referenced captions.

Time is integer milliseconds in the fixture. `msToFrame()` is called only at the render boundary. `calculateMetadata()` derives the composition duration from the fixture, so changing the storyboard changes the render length deliberately.

## Composition
`ToolPilotLatency10s` is the original registered composition. It renders:

1. the shared `Stage` background, brand header and progress bar;
2. the narration WAV from `public/generated/latency-narration.wav`, starting at 300 ms;
3. the original synthesized SFX from `public/generated/latency-sfx.wav`;
4. a `Series` of the three scenes;
5. the measured `CaptionTrack` above all scenes.

The scene sequence is derived from scene durations: 3,720 ms (ScreenDemo), 4,480 ms (MetricTimeline) and 1,800 ms (Callout). At 30 fps these become 112, 134 and 54 frames, exactly 300 frames.

`ToolPilotAgents30s` is the new review composition. Its 100-second editorial storyboard reuses the format, brand, caption and review types from the existing contract, with scene kinds for the new visual language. Only scenes before 30 seconds may be marked `implemented`; later scenes stay `planned`. The first 30 seconds contain five original code-native illustrations, Gemini narration, captions and synthesized sound cues. Render with `npm run agents:render`; regenerate the take with `npm run agents:voice` using the existing Gemini key. Outputs and asset attribution are in `data/agents100/`. The full script and shot plan are in [AgentsEpisode](AgentsEpisode.md).

## Motion
- Camera push-in and a slight pan toward the network panel during the ScreenDemo.
- Network panel slides in at 1,500 ms; the request timeline reveals left-to-right with a playhead.
- Metric values count from zero over 26 frames; comparison bars reveal after the trace.
- The verdict uses a short clip-path headline wipe, a counted 2.51 s figure and a measured hidden-latency bracket.
- All motion is a pure function of frame time; no random positions.

## Audio and captions
- Gemini Flash TTS / Puck generated the raw take. `latency:sync` trims leading/trailing silence, writes a 48 kHz mono PCM WAV and measures the sentence pause.
- Captions are derived from FFmpeg silence detection, not character counts.
- The final mix is normalised with two-pass FFmpeg `loudnorm` to -16 LUFS / -1.5 dBTP; the measured result is -16.01 LUFS / -2.97 dBTP.
- The assistant UI is explicitly labelled `UI SIMULATED`; the network timing is labelled `MEASURED`; the footer says `UI SIMULATED · TIMING MEASURED`.

## Fonts
Inter and JetBrains Mono are loaded from `public/fonts/` with `FontFace` and `delayRender`. The render blocks until the fonts are ready, so fallback fonts cannot silently change layout. Both are SIL Open Font License 1.1; licence files are beside the fonts.

## Commands
```bash
npm run scene:studio          # interactive preview
npm run storyboard:validate   # contract + assets + disclosure
npm run latency:prepare       # verify measured timing without editing
npm run scene:render          # render + loudnorm + SRT/QA/contact sheet
npm run typecheck:remotion    # TypeScript check for Remotion/React
```

`scene:render -- --skip-render` reuses the existing raw MP4 and reruns FFmpeg/QA, which is useful when tuning audio or documentation.

## Outputs
`data/renderer10/` (ignored by Git):
- `toolpilot-latency-10s.mp4` — final deliverable;
- `toolpilot-latency-10s-raw.mp4` — Remotion output before loudnorm;
- `toolpilot-latency-10s.srt` — measured captions;
- `transcript.txt` — narration, captions and disclosure;
- `qa.json` — 15 checks, probe data, loudness and SHA-256;
- `render-metadata.json` — exact command, toolchain and input hashes;
- `asset-manifest.json` — narration/SFX hashes and measured timings;
- `contact-sheet.png` — ten one-second frames.

## Current limits
- The new episode has only a 30-second rendered preview; the remaining 70 seconds await approval and implementation.
- No editor UI, dashboard, database or publishing integration.
- The assistant interface and response text are simulated, not a real product recording. This is disclosed in-frame and in the storyboard.
- The measured endpoint is a local demo with a known delay, not a third-party AI provider benchmark.
- Human visual, factual and brand review is still required. The storyboard review state is `proposed`.
