# ToolPilot montages

Ready-to-use H.264/AAC previews are grouped by bumper and format:

| Folder | 16:9 | 9:16 | 1:1 |
| --- | --- | --- | --- |
| `intro/` | `toolpilot-intro-v1.mp4` | `toolpilot-intro-v1-vertical.mp4` | `toolpilot-intro-v1-square.mp4` |
| `outro/` | `toolpilot-outro-v1.mp4` | `toolpilot-outro-v1-vertical.mp4` | `toolpilot-outro-v1-square.mp4` |

The intro is 5 seconds (150 frames at 30 fps). The outro is 8 seconds (240 frames): 5 seconds of animation followed by a 3-second still end card. The YouTube outro says **Subscribe to @mytoolpilot**. These are review previews, not yet human-approved for publication.

All three intro formats use `remotion/agents/ToolPilotIntro.tsx`; all three outro formats use `remotion/agents/ToolPilotOutro.tsx`. Their composition registrations are in `remotion/Root.tsx`. Rebuild the files with `npm run toolpilot:intro:render` and `npm run toolpilot:outro:render`. The scripts generate the original instrumental audio, use the official root `toolpilot-icon.png`, write QA manifests to ignored `data/`, and refresh the MP4s here.
