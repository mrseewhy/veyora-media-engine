# Licensing and Provenance

Status: review notes for the 10-second latency proof. This is not legal advice; verify current terms before commercial publication.

## Remotion
- Version used: `4.0.545`.
- Remotion's published licence permits free use by individuals, for-profit companies with up to three employees, non-profit organisations and evaluation use. Larger for-profit companies require a paid company licence.
- This project treats the current render as an evaluation/internal proof. Before commercial production, confirm the producing organisation fits the free-use terms or purchase the appropriate company licence.
- Source: <https://www.remotion.dev/license>. Record the licence review date and purchaser/account in the production manifest if a paid licence is used.

## Fonts
- **Inter** — SIL Open Font License 1.1. Source: <https://github.com/rsms/inter>. Licence file: `public/fonts/LICENSE-Inter.txt`.
- **JetBrains Mono** — SIL Open Font License 1.1. Source: <https://github.com/JetBrains/JetBrainsMono>. Licence file: `public/fonts/LICENSE-JetBrainsMono.txt`.
- Fonts are bundled locally, not fetched from a third-party CDN at render time.

## Voice
- The narration was generated with Gemini Flash TTS using the prebuilt **Puck** voice through the Gemini API.
- The script is original to this project. No speaker cloning, celebrity voice or copied narrator identity is used.
- Gemini API usage is subject to Google's terms, quotas and pricing. Confirm that generated audio may be used in the intended distribution channel before publishing.
- The API key lives in an ignored `.env` file and must never be committed or written into storyboard JSON.
- The earlier Kokoro `am_michael` baseline remains available for local/offline tests; its model card is Apache-2.0.

## FFmpeg and ffprobe
- Project-local binaries are installed through `@ffmpeg-installer/darwin-arm64` and `@ffprobe-installer/darwin-arm64` (FFmpeg/ffprobe 4.4).
- FFmpeg licensing depends on the build configuration (LGPL or GPL and included codecs). Distributing the binaries or a product that bundles them may carry obligations. The rendered MP4 itself is an output, not a redistribution of FFmpeg, but confirm compliance before shipping an installer or hosted service.
- The pipeline calls FFmpeg/ffprobe as separate processes; it does not link them into the Node application.

## Visuals and sound
- The ToolPilot assistant interface is an original React simulation, not a screenshot of a third-party product. It is labelled `UI SIMULATED`.
- The ToolPilot wordmark and arrow are the project's existing brand assets. Confirm ownership before external publication.
- The SFX are synthesised in `packages/renderer/src/prepare-latency.ts` (click, riser, low impact). No third-party samples, music or stock footage are used.
- The request trace is a real measurement of a local demo endpoint. It is not a benchmark of OpenAI, Anthropic, Google or any other provider, and the video does not claim that it is.

## Evidence and disclosure
- Evidence fixture: `fixtures/storyboards/toolpilot-latency-measurement.json`.
- Method: five sequential POSTs to `http://127.0.0.1:4317/v1/chat/completions`; the endpoint waits 850 ms before the first token, then emits 18 tokens at 90 ms intervals. The client measures time to first byte and total stream duration with `performance.now()`. The median run is shown.
- In-frame disclosure: `UI SIMULATED · TIMING MEASURED`; the storyboard's evidence disclosure also states that the assistant interface and response text are simulated.
- Do not remove the disclosure when reusing the scene, and do not present the local timing as a provider benchmark.

## Pre-publication checklist
- [ ] Confirm Remotion licence fits the producing organisation.
- [ ] Confirm Gemini API terms allow the intended commercial use of the generated narration.
- [ ] Confirm brand ownership for the ToolPilot marks.
- [ ] Confirm FFmpeg binary compliance for the distribution model.
- [ ] Keep `.env`, raw takes and generated media out of Git.
- [ ] Obtain human visual, factual and brand approval of the exact artifact.
