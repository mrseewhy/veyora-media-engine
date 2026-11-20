# Design System: ToolPilot Daily

Provisional brand language for first implementation. Visual choices are working defaults; revise after the first rendered video review.

## Visual identity
- Personality: editorial, technical, readable, precise; avoid generic glowing AI imagery.
- App UI: dark-neutral base, crisp borders, high-contrast typography and restrained accent.
- Proposed palette: background `#0B1117`, surface `#141D27`, border `#253341`, primary text `#F3F7FB`, muted `#A2B3C5`, accent `#50E3C2`, alert `#FFB86B`, error `#FF6B77`.
- Typography: system sans for app; freely licensable sans for Remotion with bundled/installed license checked before distribution.
- Radius: 8px controls, 12px cards; 1px borders; no excessive gradients.

## App shell
Left navigation: Dashboard / Research / Studio / Library / Publishing / Automation / Settings. Main content uses consistent cards, clear actions and status labels. Always show real job state and next user action.

## Video template v1
- Canvas: 1080 × 1920, 30fps, 30–60 seconds.
- Content: top headline, scene-specific focal visual, 1–2 short text fragments, synchronized bottom captions and final CTA.
- Captions: high contrast, maximum two lines, avoid platform overlays; use cautious safe zones and verify per target.
- Scenes: opener (0–3s); 3–5 evidence-backed points; conclusion and brand end card.
- Motion: spring/opacity/position, no flashing, modest transitions, no fake product UI. Keep a shot's content intelligible at phone size.
- Audio: intelligible speech ahead of background bed; audio licenses recorded.
- Export: platform-specific titles, optional cover, metadata and approved caption styles.

## Component vocabulary
App: PageHeader, StatCard, TopicCard, SourceEvidence, JobStatus, ReviewPanel, MediaPreview, PlatformVariant, ApprovalGate.
Video: HookScene, EvidenceScene, ToolCardScene, ComparisonScene, OutroScene, CaptionOverlay.

## Quality bar
Every video is checked for source accuracy, copyright, word clipping, silent sections, unexpected black frames, misaligned captions, resolution and export playability. Strong editorial work beats automation volume.
