# Visual Director & Editorial Visual Production Standard
Status: **approved direction / implementation specification**, 2026-11-23. The software described here is **not implemented** by this documentation change. Applies to Veyora's shared production engine; ToolPilot is the pilot, and visual identity remains channel-specific.

## The problem we are fixing
The 132-second *Singularity Explained* landscape draft had strong research, narration and story but was judged worse than a slideshow: repeated cards, tiny diagrams, empty backgrounds, flat colour, and visuals that stated rather than **showed** the narration. Do not treat successful TTS, coherent writing or technically passing MP4 as proof of a watchable video. **A video must tell its story visually.**

## Non-negotiable editorial rules
1. **Show the subject, not a label for the subject.** When Elon Musk is mentioned, deliberately propose an authentic, licensed photo/clip or a visually recognizable, explicitly illustrated caricature, not an abstract “person” icon. When AI recursively improves itself, animate a developing machine/network/process, not three boxes saying “AI”. Any person/image must be correctly identified; never fabricate quotation, endorsement, participation or documentary evidence.
2. **Visuals follow the spoken sentence.** Each shot has a specific narration phrase, subject, reason to exist, reveal or action, and time range. No unrelated filler or looping backgrounds.
3. **Brand consistency is not a colour overlay.** ToolPilot blue is **optional inside content**, never a universal background. Intro and outro can carry branding. Use warm, monochrome, photographic, natural, red, yellow, dark, bright, documentary or cinematic palettes as the story requires; maintain legibility and restrained typography/cut rhythm rather than a single background.
4. **Remotion assembles and animates assets; it is not the entire imagery source.** Use real images, licensed stock footage, screenshots, self-made SVG/2D art, AI-generated illustrations or clips, kinetic type and accurate diagrams according to the scene. No obligation to use all types in every episode.
5. **No “presentation mode”.** A full-screen title/card/diagram is an intentional brief punctuation, not a fallback template for most beats. Avoid generic card-grid composition, repeated centre headings, text that duplicates captions, and decorative AI robot silhouettes.
6. **Narrative continuity beats novelty.** A purposeful sustained visual can work better than excessive cuts. Introduce new evidence, angle, location, camera language, scale, motion, or visual subject when meaning advances. No arbitrary shot-count quotas.
7. **Use original or cleared media with explicit provenance.** Do not search/download and assume it can be redistributed. Do not generate misleading photorealistic “historical” or “real” footage. Label recreation/simulation when material to viewer understanding.
8. **Preserve verified audio.** Fix visual defects by changing storyboard/assets/edits without regenerating an approved narrator take. ToolPilot's Gemini Flash TTS/Puck voice contract and 5s intro + 100–120s narration + 8s outro remain in force.
9. **Human creative approval is required.** Passing ffprobe, loudness, schema validation and captions does not mean the imagery is good.

## Visual Director Agent: inputs, outputs and job boundaries
Place a dedicated **Visual Director** after research/script and before asset acquisition and Remotion rendering. Do not implement it as an unconstrained prompt that silently chooses random layouts.

**Inputs:** channel/series/episode IDs; channel design and safety rules; sourced claims; finalized script with phrase-level audio timings; approved voice take; source references; available/licensed asset library; target formats; platform-safe margins; offline/API cost budget; prior feedback and approved visual lessons.

**Outputs:**
- Ordered, timestamped **shot list** connecting each narration fragment to a concrete visual.
- Visual intent: `show_person`, `show_location`, `show_object`, `show_process`, `show_evidence`, `show_interface`, `contrast`, `mood_transition`, or `brief_typography`.
- Per-shot **visual mode**: `licensed_photo`, `licensed_footage`, `original_recording`, `screenshot`, `original_illustration`, `ai_image`, `ai_video`, `motion_graphic`, `data_diagram`, `kinetic_type`; combinations are allowed when composed intentionally.
- Exact subject, source query or generation brief, composition/framing, action/animation, camera move, palette *per shot*, foreground/background layers, transition, safe-area needs, aspect-ratio adaptations and fallback.
- Asset requirements with a stable asset ID, file URI after acquisition, provenance, rights, generation provider/model (if applicable), original/synthetic/simulated flags, factual/likeness review, and cost estimate.
- Blocking `needs_asset`, `needs_rights_review`, `needs_fact_review`, `needs_cost_approval`, or `needs_human_review` states. Never replace absent evidence with a hallucinated screenshot.
- QA notes and contact-sheet/video-preview approval status tied to a storyboard + asset version.

### Suggested *future* typed shot record (design sketch, NOT the current validated schema)
```json
{
  "shotId": "singularity-elon-01",
  "beatId": "people-discussing-ai",
  "audio": {"startMs": 24000, "endMs": 28500, "quote": "Elon Musk has warned about advanced AI."},
  "visualIntent": "show_person",
  "visualMode": "original_illustration",
  "subject": {"name": "Elon Musk", "treatment": "editorial caricature"},
  "asset": {"id": "elon-caricature-01", "status": "needs_asset", "sourceType": "ai_image", "rightsStatus": "pending_review"},
  "direction": {"composition": "recognizable face in close-up; contextual AI imagery behind", "palette": ["warm gray", "amber"], "motion": "slow push-in", "onScreenText": null},
  "truthfulness": {"isIllustration": true, "noImpliedQuoteOrEndorsement": true},
  "alternates": {"portrait": "face + contextual imagery in native 9:16 composition", "square": "medium crop with room for captions"},
  "review": "proposed"
}
```
The time/text is illustrative, **not** a quote from or verified timing in the actual episode. No pipeline should ingest this sketch without mapping and validation.

## Shot-planning procedure
1. Parse each sentence and claim: who/what is named; what is changing; what physical or conceptual process must be understood?
2. Select the strongest concrete visual: evidence/screen recording for factual demonstrations; authentic footage/photo for real people/events where legally usable; clear illustration for abstract concepts. Let visual mode follow the explanation, not provider availability.
3. Break narration into coherent shots with in/out timestamps anchored to the **measured approved audio**; specify what changes on screen and why. Avoid a separate title slide for every sentence.
4. Generate **search requests** for real media and **prompts/storyboard reference art** for illustrated concepts. Include source/credit rights and exact intended use.
5. Propose contrasting palettes based on mood, geography, material and story. Check shot-to-shot continuity and text contrast. The palette must not be inherited from intro/outro by default.
6. Build an asset manifest; distinguish `licensed`, `created_original`, `generated`, `permission_pending`, `unusable`. If an asset is unresolved, stop that scene and request review; never publish on a guess.
7. Render a **visual-only animatic/contact sheet**, optionally with existing narration, before final export. Review 5–15-second stretches around major changes. Replace weak imagery **without** redoing the narrator take.
8. Reframe *natively* for 16:9, 9:16, 1:1 using actual assets/layers and per-platform safe areas. Do not just crop/letterbox the landscape composition.
9. Run technical/factual/creative checks, record failures and repair selected shots. Human approves the exact output before publishing.

## Asset selection & practical cost control
**Priority order (context-dependent, not absolute):** (A) source-authentic footage/screenshots from permitted sources; (B) owned/original recordings or original illustrated/motion assets; (C) appropriately licensed photos/stock clips; (D) AI-generated stills; (E) AI-generated short clips selectively for motion that illustrations cannot achieve. Explicitly assess truthfulness and cost rather than picking the cheapest tool regardless of result.

- Start with **real footage and still images plus Remotion camera motion**. A photograph with purposeful pan/zoom, foreground cut-outs, animated annotations and cross-cuts can look excellent and is cheaper to run than fully generated video.
- Prefer short AI clips for imaginative transitions and scenes requiring real action, subject to provider terms, feasibility, review and spend approval.
- Avoid downloading watermarked, restricted, rights-unknown, social-media reuploads or copyrighted broadcast clips without a clear licence/permission. Record author, source URL, licence type, attribution requirements, use restrictions and access date.
- AI-generated images/clips need generator/model/version, prompt hash or saved prompt, disclosure decision and factual review. Celebrity likeness should be respectful, clearly illustrative when synthetic, and must not imply a real statement/event; obtain rights and permissions when needed.
- Keep assets in ignored local episode storage; keep versioned *metadata/recipes* in repo as appropriate. Reuse cached approved assets where permitted. Never silently invoke a metered API or paid stock service.
- Remotion remains composition/animation; FFmpeg/ffprobe handles finishing/probing. Local AI-video generation on M1 16 GB is **experimental**, not an assumed free production dependency.

## ToolPilot aesthetic
**Continuity:** official ToolPilot logo in approved intro/outro, stable typography, voice personality, editorial confidence, purposeful energetic pacing, readable captions, well-designed transitions. No persistent blue tint, no mandatory blue backgrounds, no recurring dashboard/card motif, no watermark through the teaching portion. Content scenes are free to become cinema, documentary, comic, high-contrast illustration, real camera footage or credible product demos.

**Safe area:** for 1920×1080 important foreground stays within left/right 150 px and top/bottom 100 px at every frame, except deliberately full-bleed background; see [DesignSystem](DesignSystem.md). Add separate portrait/square content placement and platform-UI checks.

## Concrete test: Singularity Explained (illustrative visual pitch)
| Spoken idea | Weak current pattern | Required visual treatment proposal |
| --- | --- | --- |
| Named real person such as Elon Musk | Text name/icon/person card | Cleared editorial photo, permitted footage, or explicit caricature with recognizable likeness and accurate context |
| AI becomes more capable | “SMARTER AI” heading/3 boxes | Image or motion sequence of expanding network capability, real model demo, changing capability timeline with evidence |
| Recursive self-improvement | Repeated circular arrows labelled AI | Animated sequence showing a system improving the next version, meaningful state changes; clearly conceptual |
| Fast technological acceleration | Static arrow chart | Time-compressed montage of credible milestones, physical technology, research labs, robotics, annotated sourced visuals |
| Unknown future | More branded cards | Art-directed speculative imagery with distinct mood, clearly framed as speculation, not documentary prediction |

## Creative QA: reject before expensive full renders
Run on **scene list + contact sheet + preview**, not only on the finished video:
- **Semantic relevance:** Does the shot physically/visually depict the named person, entity, action or claim? If not, why is an abstraction better?
- **Visual diversity:** Inspect repeated composition signatures, not simply counts of different colours. Flag long runs of the same card template, identical camera move, repetitive zooms, empty flat backgrounds and narration reprinted as headings.
- **Rhythm:** Are cuts and holds motivated by story and voice? Is anything static for too long *without* editorial reason? No rigid mandatory cut frequency.
- **Colour freedom:** Verify no compulsory blue content palette; inspect deliberate contrast and legibility.
- **Asset truthfulness:** Do any images imply an invented public statement, real event, measurable benchmark or endorsement? Are generated scenes presented honestly?
- **Source/rights:** All external assets have inspectable rights, provenance and attribution requirements before final export.
- **Mobile/desktop:** Caption-safe room, subject visibility, framing, text legibility and native portrait/square arrangements.
- **Continuity:** Keep audio/voice locked and scene timing synced; don't accidentally regenerate approved TTS.
- **Human scorecard (0–5):** storytelling relevance, subject specificity, visual variety, pacing, polish, factual trustworthiness. **Any score below 3 is a revision request**, not automatic approval. Human approval is still separate from numerical score.
- **Regression:** preserving 10s latency proof/approved 30s assets must not be sacrificed to implement this standard.

## Incremental implementation path and acceptance
**Phase A, immediate:** add typed Visual Director proposal + asset manifest validation on top of existing storyboard, without restructuring working scene code. Generate a **15-second singularity visual proof** with at least a sourced/cleared or clearly illustrated named-person shot and a non-card process/montage shot; use previously approved audio if available. Render contact sheet and human-review preview. No need for new TTS.

**Phase B:** implement asset discovery/acquisition adapters, rights review, original illustration/AI-image adapters with budget gates and caching. Produce a mixed-media 30-second proof, compare against prior slideshow-style section.

**Phase C:** optional approved AI-video provider adapter; integrate asset-mode transitions, 3-format re-composition, per-format QA and resumable jobs.

**Release gate:** One researched episode should move script → sound → visually specific storyboard → cleared/generated assets → Remotion assembly → native formats → technical + editorial QA → operator-reviewed draft. A coherent voice over repetitive slides is a **failed production**.

## Existing documents and precedence
Read [AGENTS.md](../AGENTS.md), [ToolPilotBrandMotion](ToolPilotBrandMotion.md), [ToolPilotVoice](ToolPilotVoice.md), [StoryboardSystem](StoryboardSystem.md), [VideoPipeline](VideoPipeline.md), [Licensing](Licensing.md), and [Tasks](Tasks.md). This document refines **content visuals**; it does not alter fixed ToolPilot bumper durations, voice, licensing duties or per-format requirements. Other Veyora channels must supply their own identity and artistic rules.


## Latest production priority (2026-11-23)
For the next delivery, [FullEpisodeProduction.md](FullEpisodeProduction.md) supersedes the earlier 15-second proof rollout: produce the **complete Singularity Explained** episode. Visual Director output must describe observable **start state → action → changed end state** per shot, fast-paced story-led visual progression (often 1–3 seconds per new visual idea, not arbitrary cuts), and precise vocal FX/SFX/music cues. Preserve approved narration; do not use Ollama as a compulsory planning dependency. The approved earlier `agents-0-30.mp4` is the minimum quality benchmark. Do not merge the unverified PR #4 foundation as if it had solved creative quality.
