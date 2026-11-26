# Full-Episode Fast-Paced Storytelling Production Standard
Status: **approved process specification; implementation and full render not yet verified**. This document supersedes the 15-second proof as the *next production deliverable*. Applies to Veyora's shared engine, with ToolPilot/Singularity Explained as the immediate production case.

## Definition of success
Produce the **entire Singularity Explained episode**, preserving its approved story and narration, as a fast-paced, visually intelligible editorial video. It must not be a slideshow, generic AI imagery loop, one illustration with a Ken Burns effect, or captions over repeated templates. A viewer should follow the central causal story with the sound muted. A technically valid MP4 is **not** a creative pass. Benchmark against the earlier best `agents-0-30.mp4` for motion quality, audio, pacing and visual confidence; it is a **quality floor, not a template to copy**.

## Opening order
Establish the episode's specific thesis or question before the brand bumper. Plan a short, narration-locked cold open with a concrete visual and a reason to keep watching, then transition into the channel's bumper and continue the story. Store the opening mode and cold-open frame count in episode configuration; derive narration, caption, music and shot timestamps from the same timeline. A channel may explicitly choose `intro-first` when its format calls for it. Do not invent a hook or regenerate approved audio to satisfy this rule. Singularity Explained uses the first 258 frames of its locked claim segment before the 150-frame ToolPilot intro, ending after the opening question.

## Object-led scene direction
Illustrated shots should contain relevant, recognizable objects and a plausible setting, with enough layers to avoid isolated symbols on an empty field. Use rights-cleared photographs, premade objects, shapes and original motion together when they help explain the narrated action. Drag, stack, overlap and reveal objects quickly, but make each movement change what the viewer understands. Do not use a rising curve as a default substitute for progress or repeat the same icon with new colours. Label archival and illustrative imagery so physical analogies cannot be mistaken for evidence of an AI event.

## Change-control and proven baseline
1. Inspect current `main`, `AGENTS.md`, existing Remotion compositions, original source files, previous accepted/best preview and available approved Singularity audio. Identify exactly what exists locally; do not invent missing media.
2. Do **not** merge PR #4 (`feat/visual-director-foundation`) as the production solution. Its Ollama planning layer and offline asset staging are not proof of improved visuals. Do not require Ollama or introduce another LLM to solve creative direction. Use existing agent/Codex capabilities for development, and add external providers only for demonstrated, approved asset needs.
3. Preserve the approved narrator take, voice identity, working animations, 5-second intro, 8-second outro (if the channel/episode uses ToolPilot bumpers), safe margins, captions and regression tests. Do not silently change audio provider or regenerate a locked take.
4. Avoid broad architecture refactors. Implement the smallest reusable capabilities that materially improve the *full* rendered video.

## Production workflow: every full episode
**0. Intake and lock:** Confirm topic, final sourced script, approved voice take, measured audio duration, channel identity, format(s), licensing constraints, budget and available reference assets. If audio missing, report blocker rather than synthesizing an unapproved substitute. Reuse already approved narration without paying for it again.

**1. Story analysis:** Divide the **entire** narration into narrative acts and cause/effect beats. For each phrase answer: what changes, what can be seen, what proof is needed, what does the audience learn? Identify real people, locations, products, interfaces, comparisons and abstract processes. Maintain factual source-to-claim mapping.

**2. Shot-level direction:** Convert acts into a timestamped edit decision list. Aim for fresh **visual information** about every 1–3 seconds where narration/action supports it, but avoid mechanical cuts and hold longer when comprehension requires it. Each shot requires: exact narration phrase and audio in/out; visual subject; **observable on-screen action** (start state → action → changed end state); shot scale/angle; framing; camera/character/object movement; transition/cut motivation; colour/palette; asset IDs; caption-safe layout; sound cue; expected learning. A change of colour, title, background, zoom or slide is not by itself a new storytelling beat. Do not equate shot count with quality.

**3. Asset acquisition/creation:** Prioritize authentic/cleared photos and footage for real people/events, permitted product screenshots or screen recordings for real tools, original 2D/3D illustrations and motion for explanations, and generated images/video only when they improve the story. For Elon Musk, show a properly identified, rights-cleared photo or clearly illustrative recognizable caricature when narration refers to him; never fabricate a quotation or endorsement. For recursive improvement, depict a system creating a successor, the successor demonstrating a new capability, and later generations accelerating; do not substitute labelled boxes or a generic factory loop. Build shot-specific layered assets that can *change* and interact. Every asset needs origin, author, rights/license, usage, attribution, generation disclosure and approval status. Unknown rights or unavailable assets block the affected shot; no random filler.

**4. Animations and editorial assembly:** Remotion handles deterministic character/object action, transitions, composites, captions and format-aware staging. Use real editorial grammar: jump cuts, match cuts, inserts, close-ups, reveals, time compression, juxtaposition, wipes only when motivated, camera pushes/pans sparingly. Vary photographic/illustrated/screen/diagram modes to fit the actual script, not an arbitrary quota. Avoid persistent blue, repeated grids, title cards, generic neon robots, unchanged hero images, identical camera moves and caption-duplicating headings. Animate a *state change*, not merely the position of a slide. Preserve safe areas (landscape critical content at least 150 px sides and 100 px top/bottom; adjust natively for other formats).

**5. Voice performance and vocal effects:** Preserve approved narrator identity and underlying take. Add **selective** non-destructive effects where they help meaning: emphasis/ducking, short pauses, tempo shaping within intelligibility, occasional whispered/filtered/robotic/telephone/echo voice treatment for clearly dramatized dialogue or contrast. Never process the full narration into a robotic voice. Never fabricate the real voice of Elon Musk or another person, or imply a real quote was spoken when it was not. For a distinct character voice, use an approved original performance or permitted synthetic character voice, clearly distinguished from the narrator and appropriately disclosed. If the approved recording lacks needed expressive delivery, prefer editing/timing and ask before regenerating. Record every effect with start/end, source, processing parameters and editorial purpose. A vocal effect should make the story clearer, not simply louder.

**6. Sound design and music:** Cue original/licensed clicks, impacts, whooshes, glitches, mechanical sounds, risers, room tone and music *to actual actions*, not every cut. Use short silence or music dropouts deliberately for contrast. Use the approved instrumental-only intro/outro, no bumper voiceovers. Duck music/SFX under narration, control peaks, avoid fatigue, check integrated loudness and true peak, prevent clipping, and keep captions accurate to the audible words. Record sound asset licensing. Do not add sound merely to simulate energy.

**7. Whole-episode edit:** Render **the complete Singularity Explained landscape episode**, not a 5-, 15- or 30-second substitute. Match the full existing narration length; do not invent a 100-second target if the actual approved recording is longer. For ToolPilot standard episodes, the separate contract is 5s intro + 100–120s narrated content + 8s outro; document any deliberate exception for this specific episode rather than silently truncating. Finish full landscape first; then adapt to native 9:16 and 1:1 after landscape review, with actual recomposition, not crop/letterbox.

**8. Automated QA:** Check file existence, media rights manifest, actual duration/fps/dimensions/codecs, audible narration, audio-video alignment, SRT/caption timing, safe-area clipping, silence/loudness/true peak, missing assets, repeated near-identical frames, prolonged still-image stretches, duplicate templates, repetitive palette/camera moves and missing causal visual actions. Generate whole-episode contact sheet and per-act sampled strips. Machine checks can flag issues, not certify storytelling.

**9. Human creative review and revision:** Compare the full result with `agents-0-30.mp4` and the prior rejected Singularity render. Review pacing, subject relevance, causal action, variety, readability, visual truthfulness, vocal effects, music balance and overall watchability. List timecoded defects; fix only the affected shots and re-render. A technically passing video remains **pending** until the operator explicitly approves it.

**10. Delivery and Git:** Commit only code, fixtures, shot recipes, QA rules and documentation to a feature branch; keep large MP4s, audio and licensed assets in ignored local storage. Run tests and full render locally where execution is possible; record exact commands, paths, frame counts, scores and remaining blockers. Push branch and open PR; do not merge to `main` or publish a video before review/approval. If local execution unavailable, explicitly state no render or QA was run.

## Required shot specification
For each shot record: `shotId, actId, startMs, endMs, narrationText, factualClaimIds, subject, visualIntent, startState, action, endState, assetIds, sourceAndRights, layers, composition, camera, transition, palette, captionSafeRegion, sfxCues, vocalEffectCues, musicCue, nativeFormatOverrides, reviewStatus`. Timings derive from approved audio, not word counts. SFX and vocal effects include exact offsets, gain/mix, provenance and intended purpose. Block unresolved claims, likenesses, rights, costs and absent files.

## Creative rejection conditions
Reject a render for any of these even if technical QA passes:
- Repeated still illustration/stock shot used to cover distinct narration ideas without meaningful change.
- Text/card/diagram replaces a named person, physical action, interface or real evidence that should be shown.
- Colour or camera zoom is the primary difference between shots.
- Fast cuts with no causal progression, or motion that competes with comprehension.
- Generic filler visuals that do not match the spoken phrase.
- Character voice impersonation, fabricated documentary evidence or unsourced attribution.
- Vocal FX/music overpowering narration or unnatural processing of the approved narrator.
- Regressed visual clarity, pacing or sound compared with the earlier best reference.
- Full episode truncated to a short proof or declared done based only on ffprobe/tests.

## Implementation order and acceptance
1. Audit actual existing audio, best reference and rejected render; map gaps in current scene/asset/audio code.
2. Create **full-episode** act/shot/action/sound plan tied to real narration.
3. Source/create actual assets and implement reusable action-based Remotion scenes; no compulsory Ollama.
4. Implement layered vocal FX/SFX/music timeline with safe mixing and provenance.
5. Render complete landscape MP4, full contact sheet, captions, technical QA and creative defect list.
6. Revise to clear identified defects; seek operator review.
7. Only then render native vertical/square versions and open a tested PR.

**Done means:** an inspectable full-length video exists, is materially more dynamic than the rejected version, all claims/media are reviewable, and the operator has approved it. Otherwise report partial completion accurately.
