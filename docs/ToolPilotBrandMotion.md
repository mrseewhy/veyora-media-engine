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
- Sequence as **intro → content → outro**, without cutting or overlapping narrated content. Audio/music on bumpers must not contain voices. Captions must align to narration inside the content segment, offset by the 5-second intro in the final export.
- Add tests for duration/frame counts, static final 90 frames, platform CTA, absence of bumper speech, no persistent watermark, and total duration.
- Preserve unrelated regression compositions; don't redesign approved educational scenes without reason.

## Status
These revised timings and audio rules supersede earlier 2–3 second intro, 3–4 second outro, and 100-second total rules. **Requirements are approved; the revised animations themselves are not yet implemented or visually approved.**


## Fast-paced motion and caption-safe production standard (operator-approved, 2026-11-22)
These are production and rendering rules, **not dashboard/interface requirements**. Apply them to ToolPilot's episode scene compositions, shared renderer primitives and per-format export QA only.

### Motion direction
- Produce **fast-paced, information-dense, original technical motion storytelling**, inspired by Fireship's energy without copying its original assets or recognizable creative elements.
- The reviewed Claude Code episode was rejected as **too still and slideshow-like**. Do not use a slideshow of static panels, oversized title cards, or occasional transitions as a substitute for animation.
- Aim for a meaningful visual event roughly every **2–4 seconds**, tied to narration rather than an arbitrary cut timer. Animate **inside** each scene: terminal commands typing/executing, code edits/diffs, editor focus, authentic product UI interactions, diagram changes, zoom/pan on evidence, and before/after states.
- Avoid constant movement, spinning/zooming for its own sake, transitions obscuring code, or animation that competes with comprehension. Keep code/UI legible long enough to understand. Narration and visual demonstration must tell the **same** story.
- Vary visual types: real demo/capture, terminal, code editor, annotated screenshot, original diagram, and brief kinetic typography. No repetitive generic dark cards.

### Caption-safe composition
- Reserve a **dedicated bottom caption lane** in every content scene. **Move the main animation/content higher** so captions do not overlap code, diagrams, controls, or other essential visual elements.
- Create and test **format-specific layout and caption-safe guides** for **1920×1080 landscape, 1080×1080 square, and 1080×1920 portrait**. Recompose natively for each format, accounting for platform overlays; never just crop a landscape frame.
- Captions should generally be **one or two lines**, synchronized to narration, with clear contrast and optional restrained word emphasis. Avoid giant captions, long unbroken text and subtitles over the visual evidence.
- Caption space is reserved in the **content segment**; intro and outro follow their separate approved brand templates. Captions begin with narration at the content start, including the 5-second intro offset in final outputs.
- Treat any overlap between captions and essential visuals as a **render QA failure**. Inspect representative frames and contact sheets in all three formats in addition to automated bounds tests.

### Narration and timing
- **Keep the current fast speaking speed**. Do not slow narration to compensate for weak visuals; improve synchronization and visual density instead.
- Preserve the **approved earlier AI Agents Gemini Flash TTS / Puck voice identity** under `docs/ToolPilotVoice.md`. The rejected Claude Code voice is not approved. Pace preference does not authorize changing provider/voice.
- Preserve existing locked structure: **5-second music-only intro**, **100–120 seconds narrated content**, **8-second music-only outro** (5 seconds animation followed by a completely static 3-second hold).

### Acceptance gate for the next episode
1. Implement or reuse actual Remotion scene motion primitives and responsive caption lanes; do not treat documentation alone as implementation.
2. Render a **15-second representative content excerpt** featuring continuous in-scene animation, synchronized captions in the reserved lower lane, and the intended narration delivery.
3. Review for motion quality, clarity, voice, caption overlap and composition; **obtain operator approval before** producing another full episode.
4. Then render the full episode in all three native formats, inspect frames/contact sheets, and run audio/caption/technical QA.
5. Report separately: documented, coded, rendered, machine-QA checked, and human-approved. Never mark unrun renders as passed.
