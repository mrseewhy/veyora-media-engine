# ToolPilot reusable intro and outro — revised production contract (2026-11-22)

## Brand identity
- Use only the official [`/toolpilot-icon.png`](../toolpilot-icon.png); never recreate or replace it with the legacy arrow BrandMark.
- Handle: **@mytoolpilot**.
- No persistent video watermark, logo, episode timer, or repeating branding over the educational content.
- Channel-specific to ToolPilot, not a global Veyora default.

## Locked timeline
- **Intro: exactly 5 seconds (150 frames at 30 fps)**. Attractive, restrained logo + ToolPilot text motion. **Music/tune and optional subtle SFX only; no narration, spoken words, or TTS.**
- **Content: minimum 100 seconds and maximum 120 seconds (3000–3600 frames at 30 fps)**. Narration belongs here, with synchronized captions.
- **Outro: exactly 8 seconds (240 frames at 30 fps)**. First **5 seconds (150 frames)** animate the official logo, channel identity and CTA; final **3 seconds (90 frames)** hold a completely still, readable end card. **Music/tune and optional subtle SFX only; no narration, spoken words, or TTS.**
- **Total video duration: 113–133 seconds**, including the 13 seconds of branding. Do not compress content to 87 seconds or count intro/outro toward the 100–120 seconds.
- The intro/outro should use a short, tasteful, coherent instrumental signature, not synthetic speech or an intrusive jingle. Use licensed/original audio and avoid clipping. Fade naturally into/out of the main content.
- YouTube CTA: **Subscribe for more AI tools** + **@mytoolpilot**; TikTok, Instagram, Facebook: **Follow @mytoolpilot**. The outro's last 3 seconds must be perfectly static (no particles, scaling, fades, background motion or text motion).

## Production implementation
- The current intro/outro result was **explicitly rejected by the operator**. Do not preserve or reuse its appearance or soundtrack as approved.
- Rebuild once as reusable versioned Remotion components, then render a 5-second intro and 8-second outro **for human review before** finalizing the episode.
- Keep branding assets reusable across episodes. Do not regenerate the motion design every time; only vary platform CTA and aspect-ratio layout.
- Render native 1920×1080, 1080×1920 and 1080×1080 layouts; use safe areas and original approved logo. Do not simply letterbox a landscape render.
- Sequence as **thesis cold open → intro → remaining content → outro** for episodes with an approved hook. Keep the exact five-second, speech-free intro and eight-second outro; split the approved content take only at a configured frame, without regenerating or overlapping speech. Derive captions and soundscape offsets from the episode timeline. An episode without a suitable approved hook must explicitly use `intro-first` until one is approved.
- Add tests for duration/frame counts, static final 90 frames, platform CTA, absence of bumper speech, no persistent watermark, and total duration.
- Preserve unrelated regression compositions; don't redesign approved educational scenes without reason.

## Status
These revised timings and audio rules supersede earlier 2–3 second intro, 3–4 second outro, and 100-second total rules. **Requirements are approved; the revised animations themselves are not yet implemented or visually approved.**
