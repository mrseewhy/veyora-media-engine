# Video Pipeline Contract

## Proposed episode JSON (version 1)
```json
{
  "schemaVersion": 1,
  "slug": "toolpilot-example",
  "title": "An AI Tool in 100 Seconds",
  "format": {"width": 1920, "height": 1080, "fps": 30, "targetSeconds": 100},
  "voice": {"engine": "piper", "model": "local-model-path"},
  "scenes": [
    {
      "id": "hook",
      "kind": "title",
      "startMs": 0,
      "durationMs": 5000,
      "narration": "What does this AI tool actually do?",
      "headline": "AI Tool in 100 Seconds",
      "assets": [],
      "sources": []
    }
  ]
}
```
This is a contract sketch, not a complete valid 100-second episode.

## Render stages
Validate schema and media rights -> synthesize narration -> measure timings -> align/adjust timeline -> generate scenes -> compose video/audio -> emit captions -> ffprobe -> QA report.

## Output layout (ignored by Git)
`data/episodes/<slug>/<run-id>/{video.mp4,captions.srt,manifest.json,qa.json,thumbnail.png,intermediates/}`

## Required QA
Resolution 1920x1080; expected frame rate; H.264 video/AAC audio; duration within agreed tolerance; caption intervals within video; assets exist; no accidental long silent gaps; licensed media manifest present.

## Renderer decision
Use FFmpeg for the first proof, with programmatic overlays and scene assets. Evaluate Remotion only if its licensing and automated-tool use are appropriate; document decision before adopting it.

## Future contracts
Source citations and confidence/review status per factual claim, publishing approval state, retryable job identifiers and channel-specific branding.
