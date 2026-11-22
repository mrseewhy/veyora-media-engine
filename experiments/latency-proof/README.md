# Latency proof: experimental render

This is a **standalone visual prototype**, not the production Remotion renderer. It uses Python/Pillow to draw a clearly labeled simulated developer interface and FFmpeg to encode it. It uses an existing Gemini technical narration WAV supplied separately. No API key or voice file is committed.

Run on a machine with Python, Pillow and FFmpeg:

```bash
python experiments/latency-proof/render_proof.py /absolute/path/to/gemini-technical-sample.wav
```

Output: `experiments/latency-proof/toolpilot-latency-proof.mp4` (keep generated media out of Git).

**Known limitations:** UI and latency numbers are simulations, not real benchmark evidence; captions are not word-aligned; this is not Remotion; visual quality is not approved. The prototype proves an H.264/AAC render can be generated, not that the design is publication-ready. Next: implement real evidence assets and the storyboard scene contract in Remotion after package installation/licensing review.
