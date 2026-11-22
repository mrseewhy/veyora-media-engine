# ToolPilot voice identity — locked production requirement

## Approved narrator
The operator confirmed on 2026-11-22 that the **earlier AI Agents in 100 Seconds narration** is the desired voice. The later **Claude Code in 100 Seconds** narration is explicitly **rejected** and must not be used as a reference.

Source configuration currently recorded in `fixtures/storyboards/toolpilot-agents-100s.json` and `packages/renderer/src/agents-voice.ts`:
- Provider: `gemini-flash-tts` (Gemini Flash TTS)
- Voice: `Puck`
- Style prompt: `Conversational, witty technology educator. Brisk but articulate. Smile slightly at beautiful checklist and no eggs. Natural pauses at the end of each thought. Clear contrast between chatbot and agent; no theatrical announcer voice.`
- Postprocess: FFmpeg 48 kHz mono WAV.
- Historical preview audio output: `public/generated/agents-0-30.wav` (may be local/generated and absent from Git; verify before using).

## Production rules
1. Treat `Puck` on Gemini Flash TTS as the **locked default voice identity for ToolPilot**, not a setting the episode-generating agent may improvise.
2. For new episode narration, use the same provider, voice and consistent general delivery instruction: **conversational, witty technology educator; brisk but articulate, natural pauses, never theatrical, robotic, or old-fashioned announcer style**. Episode-specific word emphasis may vary, but voice identity must not.
3. Never silently substitute local TTS, another Gemini voice, another provider, or a generic system voice when Gemini is unavailable. Stop the narration stage, report the blocker, and request explicit approval for a substitute.
4. Preserve the original AI Agents approved narration WAV as a reference asset once the exact file has been located and its provenance verified. Do not mistake the rejected Claude Code upload for this asset. Prefer a stable channel-scoped path such as `channels/toolpilot/assets/voice/reference.wav` if repository size/licensing permit, or a manifest with verified durable asset location and SHA-256.
5. Save provider/model version when available, exact voice name, delivery prompt, sample rate, audio-processing settings, and reference audio hash in channel configuration. Reference audio is for **human A/B listening and QA**, not proof that the API supports voice cloning or reference-conditioned synthesis.
6. Before full rendering, produce a short new-episode voice sample for operator review. Do not render three full videos with an unapproved new voice. Audio QA includes intelligibility, pacing, naturalness and consistency with the approved sample; machine QA alone cannot guarantee voice match.
7. This applies to ToolPilot only. Do not impose the voice on other Veyora channels.

## Implementation status
The approved **configuration** has been identified in source; the actual original audio reference has **not yet been verified or committed**. Locking the config does not guarantee identical prosody between TTS generations. Implement enforcement and reference-asset capture in the production pipeline before claiming automatic voice consistency.
