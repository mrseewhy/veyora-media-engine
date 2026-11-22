# Viewer Experience & Narrative Journeys
Status: creative specification for ToolPilot. The target is an original, concise, fast-moving technology explainer. Reference Fireship for **clarity, pacing and demonstration density**, never copy scripts, voice identity, footage, transitions or proprietary design.

## Promise to the viewer
In roughly 100 seconds, answer one practical question and leave the viewer with a useful mental model or action. The video must **show evidence**. Narration explains meaning; visuals demonstrate what is happening. Avoid a narrated slideshow.

## Shared experience rules
- First 3–5 seconds: a concrete tension, result or visual surprise. No slow logo intro.
- One main idea per beat; one visual purpose per scene. Every scene must answer **What does the viewer learn from seeing this?**
- Prefer authentic product UI, screen recordings, code, before/after, benchmarks and simple diagrams over decorative footage.
- Visual changes follow meaning and speech, not arbitrary 2-second cuts. Allow enough dwell time to read code and data.
- Avoid long full-screen paragraphs, generic glowing gradients, fake dashboards passed off as real, excessive captions competing with interface text.
- Captions supplement speech, do not replace visual storytelling; emphasize key terms selectively.
- Branded outro should be brief and never crowd out the verdict.
- Tone: precise, curious, occasionally witty, not breathless hype. No invented metrics or unsupported claims.
- Duration is a **target**, not an excuse to accelerate speech or omit necessary caveats.

## Template A: AI tool review (default 100s)
| Time | Beat | Viewer question | Preferred evidence |
|---|---|---|---|
| 0–5 | Hook | Why care? | Problem/result on screen, striking real demo |
| 5–15 | Tool in one sentence | What is it? | Product identity + real interface |
| 15–45 | Demonstration | How does it work? | Actual workflow: input → interaction → output |
| 45–75 | Practical use case | Can I use it? | Before/after, real task, constraints |
| 75–90 | Limits/trade-offs | What is the catch? | Pricing/latency/accuracy comparison with source |
| 90–100 | Verdict | Who should try it? | Decision summary + short ToolPilot sign-off |
**Pass:** viewer sees at least one genuine end-to-end workflow, not only claims about features.

## Template B: AI concept explained
| Time | Beat | Viewer question | Preferred evidence |
|---|---|---|---|
| 0–7 | Counterintuitive hook | What's misunderstood? | Failed assumption or surprising behavior |
| 7–25 | Mental model | What is it? | Original animated diagram |
| 25–55 | Mechanism | How does it work? | Step-by-step data flow, code or trace |
| 55–80 | Worked example | Where is it useful? | Real input/output and constraints |
| 80–95 | Pitfall | What can go wrong? | Failure case or comparison |
| 95–100 | Takeaway | What should I remember? | One actionable sentence |
**Pass:** animation makes an abstract mechanism easier to understand.

## Template C: AI tool comparison
| Time | Beat | Viewer question | Preferred evidence |
|---|---|---|---|
| 0–8 | Stakes | What are we deciding? | Shared task and criteria |
| 8–22 | Contenders | What are the options? | Real products, comparable setup |
| 22–65 | Same-task test | How do they perform? | Side-by-side real results, timings and conditions |
| 65–85 | Trade-offs | Which strengths matter? | Clear criteria table, cited prices |
| 85–100 | Recommendation | Which for whom? | Conditional verdict, no fake winner |
**Pass:** same inputs, honest limitations and source/date for changing pricing.

## Template D: AI tutorial
| Time | Beat | Viewer question | Preferred evidence |
|---|---|---|---|
| 0–8 | Finished result | What will I build? | Working result |
| 8–20 | Prerequisites | What do I need? | Real setup/versions |
| 20–70 | Steps | How do I do it? | Actual screen/code walkthrough |
| 70–90 | Verification | Did it work? | Test/output/error check |
| 90–100 | Next action | What now? | Link/reference or one improvement |
**Pass:** viewer can reproduce core steps; if 100s is too short, narrow the task or use a longer format.

## Micro-storyboard example: 10-second latency hook
- **0.0–2.0s:** Show a real or explicitly simulated chat UI appearing instant, then overlay an actual measured network request timeline. Narration: “A slick AI demo can hide terrible latency.”
- **2.0–5.5s:** Zoom into developer network panel / terminal request. Highlight request start and response arrival. No made-up benchmark presented as real.
- **5.5–8.5s:** Two synchronized tracks: UI animation versus API latency; visual gap reveals the difference.
- **8.5–10.0s:** Freeze on measured call duration and key message: “Measure the API call.” No extra logo or clutter.
If metrics are illustrative, label **Example / simulated** in-frame.

## Audio and pace
Gemini Flash TTS is the leading candidate based on user samples, not a permanently locked provider. Prefer a confident, conversational voice with deliberate emphasis. Script to **spoken duration**; do not assume character count equals seconds. Generate short segments, measure actual waveform duration, then align scenes/captions. Music/SFX optional and quiet; speech intelligibility first. Do not imitate a specific narrator's unique vocal identity.

## Visual evidence hierarchy
1. Real screen capture of the actual tool/task (best).
2. Genuine screenshots and code/logs from reproducible example.
3. Original explanatory diagram or clearly labeled simulation.
4. Licensed stock/AI-generated illustrative B-roll only when relevant.
5. Typography-only beat as rare punctuation, never default.

## Accessibility and trust
Readable text, contrast, safe margins, no flashing, captions timed to speech, code shown long enough to inspect, source links in description. Disclose simulated screens, approximate figures and AI-generated visuals when needed. Do not overclaim that a free trial is commercially licensed or that monetization is guaranteed.

## Review scorecard (1–5 each)
Hook relevance; factual accuracy/evidence; demonstration value; narrative clarity; visual craft; pacing; voice clarity; originality; readability/accessibility; useful conclusion. **Automatic codec checks are not substitutes for these judgments.** Reject a video with any critical factual, licensing or fake-evidence problem regardless of average score. For the initial 10-second proof, require reviewer approval of clarity, craft and evidence authenticity before expanding duration.

## Anti-patterns
Random UI widgets unrelated to narration; endless text cards; stock clips of glowing robots; transitions hiding weak content; repeating the narration word for word on screen; unlicensed music; fabricated comparisons; scene changes without narrative reason.
