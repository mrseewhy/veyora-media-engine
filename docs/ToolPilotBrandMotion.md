# ToolPilot reusable intro and outro (approved channel contract)

## Source of truth
- Official logo: [`/toolpilot-icon.png`](../toolpilot-icon.png). Use **this exact artwork**, not an AI recreation or the legacy arrow icon in `remotion/components/BrandMark.tsx`.
- Channel handle: **@mytoolpilot**.
- Scope: **ToolPilot only**. Other Veyora channels require their own brand-motion assets and configurations.
- No permanently embedded logo, watermark, `TOOLPILOT / AI AGENTS / 100` counter, or repeating branding over the main educational content. YouTube's channel watermark is managed separately.

## Reusable branded motion
**Intro (target 2–3 seconds):** Animate the official icon with a subtle click / signal-wave reveal, then show **ToolPilot** text. Transition quickly into episode content. No extra voiceover. Prefer an immediate content hook before the bumper when appropriate.

**Outro (target 3–4 seconds):** Matching or complementary motion, using the same logo and brand typography. Platform-aware call to action:
- YouTube: **Subscribe for more AI tools** and **@mytoolpilot**.
- TikTok / Instagram / Facebook: **Follow @mytoolpilot**.
- Other platforms: explicit configuration, not an assumed call to action.

Keep sound effects restrained and properly licensed. No copyrighted music without permission. Render native responsive layouts for 16:9 (1920×1080), 9:16 (1080×1920), and 1:1 (1080×1080), observing platform safe areas.

## Engineering requirements
- Implement intro/outro as **reusable Remotion channel components or a versioned shared media asset**, not as hand-built per-episode scenes.
- Expose a ToolPilot brand-motion configuration with logo path, handle, animation version, intro/outro durations, per-platform CTA, safe areas and enabled flag.
- Assemble each episode from content plus the reusable bumper components; use one timing source for narration, scenes, captions and music.
- For **AI Tools in 100 Seconds**, total runtime is **100 seconds including intro and outro**. Allocate approximately 2–3 seconds for intro and 3–4 seconds for outro, leaving the rest for the hook and content. Do not append them outside the duration budget.
- No voiceover or captions over bumper segments unless explicitly designed and synchronized. Caption timings must follow actual final narration, not predetermined scene estimates.
- Cache/reuse the same approved motion across episodes and platforms; do not regenerate artwork each time.
- Unit/smoke tests should verify brand asset exists, durations sum to target, platform CTA selection, safe-area placement and no persistent logo overlays.
- Preserve existing latency and preview regression compositions while migrating. Legacy `BrandMark` must not be used as the official ToolPilot icon.

## Approval and implementation status
The **creative direction and reuse rules are approved**. The **actual intro/outro animations have not yet been generated, rendered, visually inspected or approved**. The production agent can implement the reusable Remotion components directly from this specification; there is **no need to wait for manually generated montage video files**. Review the first rendered intro/outro once, then lock its version and reuse it. Do not mark it approved or publication-ready without that review.
