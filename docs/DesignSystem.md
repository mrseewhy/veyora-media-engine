# Design System

## Brand
ToolPilot: clear, modern, energetic AI-tool education. Tagline: **Smarter Tools. Better Work.**
Use existing official ToolPilot logo/banner as reference; do not recreate an unrelated icon.

## Video template
- Start with a strong visual hook in first 3–5 seconds.
- Short readable on-screen phrases; high contrast dark backgrounds and restrained blue/cyan/purple accents.
- Fast cuts, deliberate zooms, product UI demonstrations and concise animated diagrams.
- Narration drives scene pacing; captions remain legible and inside safe areas.
- End with a clear takeaway and restrained branded outro.
- Initial output: 1920×1080, 16:9, ~100 seconds; vertical adaptation later.
- Original motion design, not copied animations, scripts or brand assets from other creators.

## Editorial concept explainer preview
The **AI Agents in 100 Seconds** opening uses warm paper, dark ink, cyan and ToolPilot lime across distinct comic, diagram and kitchen shots. Original illustrated characters and props carry the analogy; interface panels are reserved for actual technical evidence later in the episode. Short stamps, match cuts and purposeful character motion should follow narration. The 30-second cut is a review artifact, not a new universal template. See [AgentsEpisode](AgentsEpisode.md).

## Video layout and safe areas (authoritative rule)
Applies to **every ToolPilot video scene**, including future episodes. The AI Agents 30-second preview revealed that content can feel crowded even when animations are strong. **Preserve the approved editorial style, scene structure and animation; adjust layout, not art direction.**

### 1920 × 1080 landscape baseline
- **Horizontal safe margin:** 150 px minimum on **each** side for important foreground content (safe content x-range: **150–1770**).
- **Vertical safe margin:** 100 px minimum at top and bottom (safe content y-range: **100–980**).
- Keep headlines, subtitles/captions, illustrations, labels, logos, UI callouts and critical action **inside** these boundaries throughout their visible animation, including entrance/exit frames.
- Use generous negative space and consistent gaps between headline, subject and supporting text. Avoid oversized elements pressing against the frame edge or crowding one another.
- The safe area is a **minimum inset**, not a target to fill. Prefer more breathing room when a composition benefits.
- Background colors, textures, ambient decoration and deliberate full-bleed transitions **may** extend to the frame edges; meaningful text or subjects must not.
- For alternative aspect ratios, scale the insets proportionally from the 1920 × 1080 reference, then inspect and adjust for platform UI overlays (especially vertical video). Do not assume proportional scaling alone makes a vertical layout safe.

### Implementation guidance (not yet implemented by this document)
- Define one shared source of truth in `remotion/theme.ts`, for example `videoSafeArea: { left: 150, right: 150, top: 100, bottom: 100 }`, and consume it from the shared `Stage` layout and all scene components.
- Prefer shared content containers and spacing tokens over one-off scene offsets; avoid magic numbers in individual scenes.
- Keep camera transforms and animated elements within safe bounds at their most extreme positions; use clipping only for intentional masked effects.
- Keep the current 30-second scene visuals and motion unchanged apart from spacing and any resulting readability adjustments.

### Validation and review
- Add layout assertions or frame-bound checks where practical, plus representative frame captures at scene starts, transitions, animation extremes and end frames.
- Review the complete video at desktop and mobile sizes; verify no clipped captions, logos, headlines, key illustrations or technical evidence.
- Treat a safe-area violation as a visual QA failure; allow explicit, documented exceptions only for decorative/full-bleed elements.
- Documentation alone does not enforce this: implement shared Remotion tokens and tests as a **separate code change**, then rerender the same 30-second clip for comparison.

## Dashboard (later phase)
- Minimal dark/light UI with accessible contrast, clear statuses and visible render progress.
- Pages: Queue, Episodes, Editor/Storyboard, Assets, Render jobs, Approvals, Publishing, Settings.
- Distinguish draft, needs review, failed, approved and published states.
- Do not begin UI polish until renderer quality is validated.

## Acceptance
At least one human review on mobile and desktop; no clipped text, unreadable captions, accidental silence or inconsistent branding.


## Updated visual language: story over brand palette (2026-11-23)
**This section supersedes earlier suggestions that blue/cyan/purple or dark backgrounds should dominate all scenes.** In educational content **there is no mandatory background colour or persistent blue treatment**. The logo, voice, typography, pacing, clear editing and approved bumper sequences carry ToolPilot identity. Any appropriate cinematic, warm, neutral, vibrant, monochrome, photographic or illustrative colour scheme is permitted, provided contrast and safe areas pass. Use real subjects (including correctly identified people), contextual imagery and intentional composition. Do not recycle title-card or dashboard layouts as the default treatment for narration. Implement mixed media and shot-level palette direction per [VisualDirector.md](VisualDirector.md). Original artwork requirements still apply; licensed assets and clearly framed AI generations are allowed with provenance and rights reviews.

