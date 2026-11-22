# Veyora Media Engine

Local-first video production engine for **ToolPilot** (Veyora House), starting with the **AI Tools in 100 Seconds** series.

## Status
**The 10-second latency proof remains a regression composition.** A separate 30-second opening preview of **AI Agents in 100 Seconds** is rendered for review. The complete 100-second script and storyboard are drafted; the remaining 70 seconds have not been implemented or rendered.

## Chosen architecture
- **CLI + worker:** Node.js, TypeScript
- **Visual composition:** Remotion 4.0.545 + React/TypeScript for the 10-second proof
- **Media and QA:** project-local FFmpeg / ffprobe for trimming, loudness, muxing, probing and contact sheets
- **Voice:** Gemini Flash TTS test adapter for the latency proof; Kokoro remains the local baseline
- **Management UI (later):** Next.js
- **Database (later):** local PostgreSQL + Drizzle
- **Storage:** local filesystem
- **AI:** provider-agnostic, with claim/source review
- **Publishing (later):** YouTube API with explicit approval

Remotion is now the visual layer for the proof. Its licence was reviewed for this use; see [Licensing](docs/Licensing.md). A paid company licence is required if the producing organisation falls outside Remotion's free-use terms.

## Build order
1. Review and approve the rendered 10-second latency proof before expanding duration.
2. Automate structured episode JSON -> MP4, captions and QA report.
3. Add AI research and script generation with source review.
4. Add Next.js dashboard, PostgreSQL and durable worker jobs.
5. Add approved YouTube upload/publishing.
6. Add multi-channel templates and analytics.

## Documentation
- [Plan](docs/Plan.md)
- [Product requirements](docs/PRD.md)
- [Tasks](docs/Tasks.md)
- [Design system](docs/DesignSystem.md)
- [Automation](docs/Automation.md)
- [Video pipeline](docs/VideoPipeline.md)
- [Testing](docs/Testing.md)
- [Remotion renderer](docs/RemotionRenderer.md)
- [Licensing](docs/Licensing.md)
- [AI Agents episode script and storyboard](docs/AgentsEpisode.md)
- [AI Agents asset attribution](docs/AgentsAssetManifest.md)
- [Production Intelligence v1](docs/ProductionIntelligence.md)

## Production Intelligence v1

The local PostgreSQL + Drizzle layer stores episodes, render versions, scene or whole-video feedback, reviewed production lessons and evaluation history. It uses the existing storyboard IDs and QA artifacts. Run `npm run db:migrate`, then `npm run intelligence -- db check`. Feedback and lesson commands are documented in [Production Intelligence v1](docs/ProductionIntelligence.md). The visual renderer and narration workflow are unchanged.

## First next action
Review the rendered first 30 seconds of **AI Agents in 100 Seconds** on desktop and mobile. Record visual defects and approve or request changes before implementation of the remaining 70 seconds.

## AI Agents first 30 seconds

The [100-second storyboard](fixtures/storyboards/toolpilot-agents-100s.json) covers the whole episode. Five original editorial scenes cover the first 30 seconds. They use a comic chatbot, a tool-carrying agent, a four-step loop and a kitchen detour. The later scenes remain planned. The earlier `ToolPilotLatency10s` composition and fixture remain unchanged and are covered by regression tests.

```bash
npm ci
npm run agents:voice         # Gemini API key in ignored .env; regenerates 0–30s narration
npm run agents:render        # Remotion render, FFmpeg loudnorm, SRT, QA, contact sheet
npm test
npm run typecheck:remotion
```

Outputs are ignored under `data/agents100/`: `agents-0-30.mp4`, `agents-0-30.srt`, `qa.json`, `contact-sheet.png`, and `asset-manifest.json`. The rendered artifact is 1920×1080, 30 fps, 30 seconds. Review status is `proposed`.

No paid third-party account is required for the initial local renderer proof; future model/API and licensing costs must be checked before use.

## Experience and production specifications
- [Production user journey](docs/UserJourney.md)
- [Viewer experience and video templates](docs/VideoExperience.md)
- [Storyboard and scene system](docs/StoryboardSystem.md)

**Quality-first next milestone:** audit the actual renderer, build one evidence-based 10-second latency scene with real or labeled simulated visuals, and obtain human visual approval before expanding to 30 or 100 seconds. Remotion is the proposed visual layer subject to license verification; Gemini Flash TTS is the preferred voice candidate, not a guaranteed free production dependency.

## Renderer proof
Run `npm install`, then `npm test` and `npm run episode:render -- fixtures/toolpilot-chatgpt.json`. The example uses local Kokoro neural TTS and downloads model files on first use. Output is written under ignored `data/episodes/`. Project-local FFmpeg/ffprobe binaries are installed through npm.

## 10-second Remotion latency proof
The scene answers one question: **does a polished AI interface prove the API is fast?** It shows a simulated assistant UI, then reveals a real local request trace measured five times (median 858 ms to first token, 2,506 ms to completion). The UI is labelled simulated; the timing is labelled measured.

Commands (run in order on a fresh checkout):
```bash
npm install
export GEMINI_API_KEY=...      # only needed to regenerate the narration take
npm run latency:measure        # optional: refresh the measured evidence fixture
npm run voice:latency          # regenerate the Gemini Flash TTS raw take
npm run latency:sync           # trim, normalise, build SFX and sync captions
npm run storyboard:validate    # schema, assets, disclosure and caption checks
npm run scene:render           # Remotion -> FFmpeg loudnorm -> SRT/QA/contact sheet
```

`npm run scene:studio` opens the composition for preview. The rendered artifacts are written under ignored `data/renderer10/`:

- `toolpilot-latency-10s.mp4` — 1920×1080, 30 fps, 10.006 s, H.264/AAC, 300 frames, -16.0 LUFS
- `toolpilot-latency-10s.srt` — measured caption timings
- `qa.json` — machine checks, probe data, loudness and SHA-256
- `render-metadata.json` — commands, toolchain and input hashes
- `contact-sheet.png` — ten one-second frames for review
- `transcript.txt` — narration, captions and disclosure

The narration WAV, SFX and final MP4 are generated artifacts and are not committed. `data/renderer10/narration-raw.wav` is required by `latency:sync`; without a Gemini key, restore that take from a previous run or use the committed fixture only for schema/renderer work.

## Gemini Flash voice test
Create an ignored `.env` file with `GEMINI_API_KEY=...`, or export that variable in your shell. Run `npm run voice:sample:gemini` to generate a short WAV sample from the first scene using Gemini 3.8 Flash TTS and the Puck voice. The request uses Google’s Gemini API; usage may count toward your API quota. The full render can use this adapter by setting `voice.engine` to `gemini-flash` and `voice.name` to a Gemini voice name in a separate episode JSON.

Run `npm run voice:sample:technical` for a 30-second Gemini Flash technical narration test. It uses three delivery styles and writes `data/gemini-technical-sample.wav`; the script is in `fixtures/gemini-technical-sample.json`. The sample is time-aligned to 30 seconds with a small FFmpeg tempo adjustment.

## Technical video proof
Run `npm run video:technical` after generating the 30-second Gemini narration. The video uses six Chrome captures of the original local demo UI in `media/demo/` and exports to `data/technical-video/toolpilot-technical-30s.mp4`. The UI contains illustrative sample metrics, labeled on-screen.
