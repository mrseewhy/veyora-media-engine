#!/usr/bin/env node
/**
 * Generates contact sheets for rendered videos.
 * Extracts frames at regular intervals and creates a grid contact sheet.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const ffmpeg = resolve(root, 'node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');

const outDir = resolve(root, 'data/episodes/toolpilot/claude-code-100s/qa');
mkdirSync(outDir, { recursive: true });

const videos = [
  { input: '/tmp/opencode/claude-code-landscape.mp4', output: 'contact-landscape.png', label: 'Landscape 1920x1080' },
  { input: '/tmp/opencode/claude-code-vertical.mp4', output: 'contact-vertical.png', label: 'Vertical 1080x1920' },
  { input: '/tmp/opencode/claude-code-square.mp4', output: 'contact-square.png', label: 'Square 1080x1080' },
];

for (const { input, output, label } of videos) {
  if (!existsSync(input)) {
    console.log(`SKIP ${label}: input not found: ${input}`);
    continue;
  }
  const outPath = resolve(outDir, output);
  // Extract 12 frames evenly spaced across the video, create a 3x4 contact sheet
  execFileSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', input,
    '-vf', 'select=gte(n\\,1)*gte(n\\,1),scale=320:-2,tile=3x4',
    '-frames:v', '1',
    outPath,
  ]);
  console.log(`Contact sheet: ${outPath} (${label})`);
}

console.log('Contact sheets generated in', outDir);
