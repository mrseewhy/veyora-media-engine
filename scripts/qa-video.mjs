#!/usr/bin/env node
/**
 * QA validation for rendered Claude Code 100s videos.
 * Checks duration, resolution, codec, fps, audio, and frame counts.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const root = process.cwd();
const ffprobe = `${root}/node_modules/@ffprobe-installer/darwin-arm64/ffprobe`;

function probe(file) {
  const stdout = execFileSync(ffprobe, [
    '-v', 'error', '-show_format', '-show_streams', '-of', 'json', file,
  ], { encoding: 'utf8' });
  return JSON.parse(stdout);
}

function parseRate(value) {
  if (!value) return undefined;
  const [n, d] = value.split('/').map(Number);
  if (!Number.isFinite(n)) return undefined;
  if (!Number.isFinite(d) || d === 0) return n;
  return n / d;
}

function check(id, label, passed, detail) {
  return { id, label, passed, detail };
}

function validateVideo(file, expected) {
  const p = probe(file);
  const vs = p.streams.find((s) => s.codec_type === 'video');
  const as = p.streams.find((s) => s.codec_type === 'audio');
  const durationMs = Number(p.format.duration) * 1000;
  const fps = parseRate(vs.avg_frame_rate ?? vs.r_frame_rate);
  const frames = vs.nb_frames ? Number(vs.nb_frames) : undefined;
  const expectedFrames = Math.round((expected.durationMs / 1000) * expected.fps);
  const tolerance = 150;

  const checks = [
    check('video-stream', 'Video stream exists', Boolean(vs), vs ? 'present' : 'missing'),
    check('video-codec', 'Video codec is H.264', vs.codec_name === 'h264', vs.codec_name ?? 'unknown'),
    check('resolution', `${expected.width}x${expected.height}`, vs.width === expected.width && vs.height === expected.height, `${vs.width ?? '?'}x${vs.height ?? '?'}`),
    check('fps', `${expected.fps} fps`, fps !== undefined && Math.abs(fps - expected.fps) < 0.02, fps === undefined ? 'unknown' : fps.toFixed(3)),
    check('duration', `${expected.durationMs}ms (±${tolerance}ms)`, Number.isFinite(durationMs) && Math.abs(durationMs - expected.durationMs) <= tolerance, `${durationMs.toFixed(0)}ms`),
    check('frames', `${expectedFrames} frames`, frames === undefined || Math.abs(frames - expectedFrames) <= 1, frames === undefined ? 'not reported' : String(frames)),
    check('audio-stream', 'Audio stream exists', Boolean(as), as ? 'present' : 'missing'),
    check('audio-codec', 'Audio codec is AAC', as.codec_name === 'aac', as.codec_name ?? 'unknown'),
    check('audio-rate', 'Audio sample rate is 48kHz', Number(as.sample_rate) === 48000, `${as.sample_rate ?? '?'} Hz`),
    check('audio-channels', 'Audio has >= 1 channel', Number(as.channels ?? 0) >= 1, String(as.channels ?? '?')),
  ];

  const passed = checks.every((c) => c.passed);
  console.log(`\n=== ${expected.label} ===`);
  console.log(`File: ${file}`);
  console.log(`Passed: ${passed}`);
  for (const c of checks) {
    console.log(`  ${c.passed ? 'PASS' : 'FAIL'} - ${c.label}: ${c.detail}`);
  }
  console.log(`Probe: ${durationMs.toFixed(0)}ms duration, ${fps ? fps.toFixed(3) : '?'} fps, ${frames ?? '?'} frames`);
  return { passed, checks, durationMs, fps, frames };
}

const formats = [
  { file: '/tmp/opencode/claude-code-landscape.mp4', width: 1920, height: 1080, fps: 30, label: 'Landscape 1920x1080', durationMs: 124800 },
  { file: '/tmp/opencode/claude-code-vertical.mp4', width: 1080, height: 1920, fps: 30, label: 'Vertical 1080x1920', durationMs: 124800 },
  { file: '/tmp/opencode/claude-code-square.mp4', width: 1080, height: 1080, fps: 30, label: 'Square 1080x1080', durationMs: 124800 },
];

let allPassed = true;
for (const fmt of formats) {
  if (!existsSync(fmt.file)) {
    console.log(`\n=== ${fmt.label} ===`);
    console.log(`File not found: ${fmt.file}`);
    allPassed = false;
    continue;
  }
  const result = validateVideo(fmt.file, { ...fmt });
  if (!result.passed) allPassed = false;
}

console.log(`\n${allPassed ? 'ALL QA CHECKS PASSED' : 'SOME QA CHECKS FAILED'}`);
process.exit(allPassed ? 0 : 1);
