import type {ProbeResult} from './media-tools.js';

export interface VideoQaExpectations {
  durationMs: number;
  width: number;
  height: number;
  fps: number;
  /** Allowed absolute duration drift. Remotion rounds to whole frames. */
  durationToleranceMs?: number;
  minAudioChannels?: number;
}

export interface VideoQaCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface VideoQaSummary {
  passed: boolean;
  checks: VideoQaCheck[];
  video: {
    codec?: string;
    width?: number;
    height?: number;
    fps?: number;
    frames?: number;
    durationMs?: number;
  };
  audio: {
    codec?: string;
    sampleRate?: number;
    channels?: number;
  };
}

function parseRate(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const [numerator, denominator] = value.split('/').map(Number);
  if (!Number.isFinite(numerator)) return undefined;
  if (!Number.isFinite(denominator) || denominator === 0) return numerator;
  return numerator / denominator;
}

/**
 * Machine QA shared by the render CLI and unit tests. It deliberately checks
 * only objective properties; it does not pretend to replace human review.
 */
export function validateVideoQa(
  probe: ProbeResult,
  expected: VideoQaExpectations,
): VideoQaSummary {
  const checks: VideoQaCheck[] = [];
  const add = (id: string, label: string, passed: boolean, detail: string) => {
    checks.push({id, label, passed, detail});
  };

  const videoStream = probe.streams.find((stream) => stream.codec_type === 'video');
  const audioStream = probe.streams.find((stream) => stream.codec_type === 'audio');
  const durationMs = Number(probe.format.duration) * 1000;
  const tolerance = expected.durationToleranceMs ?? 120;
  const fps = parseRate(videoStream?.avg_frame_rate ?? videoStream?.r_frame_rate);
  const frames = videoStream?.nb_frames ? Number(videoStream.nb_frames) : undefined;
  const expectedFrames = Math.round((expected.durationMs / 1000) * expected.fps);

  add('video-stream', 'Video stream exists', Boolean(videoStream), videoStream ? 'present' : 'missing');
  add(
    'video-codec',
    'Video codec is H.264',
    videoStream?.codec_name === 'h264',
    videoStream?.codec_name ?? 'unknown',
  );
  add(
    'resolution',
    `Resolution is ${expected.width}x${expected.height}`,
    videoStream?.width === expected.width && videoStream?.height === expected.height,
    `${videoStream?.width ?? '?'}x${videoStream?.height ?? '?'}`,
  );
  add(
    'fps',
    `Frame rate is ${expected.fps} fps`,
    fps !== undefined && Math.abs(fps - expected.fps) < 0.02,
    fps === undefined ? 'unknown' : fps.toFixed(3),
  );
  add(
    'duration',
    `Duration is ${expected.durationMs} ms (±${tolerance} ms)`,
    Number.isFinite(durationMs) && Math.abs(durationMs - expected.durationMs) <= tolerance,
    Number.isFinite(durationMs) ? `${durationMs.toFixed(0)} ms` : 'unknown',
  );
  add(
    'frames',
    `Frame count is ${expectedFrames}`,
    frames === undefined || Math.abs(frames - expectedFrames) <= 1,
    frames === undefined ? 'not reported' : String(frames),
  );
  add('audio-stream', 'Audio stream exists', Boolean(audioStream), audioStream ? 'present' : 'missing');
  add(
    'audio-codec',
    'Audio codec is AAC',
    audioStream?.codec_name === 'aac',
    audioStream?.codec_name ?? 'unknown',
  );
  add(
    'audio-rate',
    'Audio sample rate is 48 kHz',
    Number(audioStream?.sample_rate) === 48_000,
    audioStream?.sample_rate ? `${audioStream.sample_rate} Hz` : 'unknown',
  );
  add(
    'audio-channels',
    `Audio has at least ${expected.minAudioChannels ?? 1} channel(s)`,
    Number(audioStream?.channels ?? 0) >= (expected.minAudioChannels ?? 1),
    audioStream?.channels ? String(audioStream.channels) : 'unknown',
  );

  return {
    passed: checks.every((check) => check.passed),
    checks,
    video: {
      codec: videoStream?.codec_name,
      width: videoStream?.width,
      height: videoStream?.height,
      fps,
      frames,
      durationMs: Number.isFinite(durationMs) ? durationMs : undefined,
    },
    audio: {
      codec: audioStream?.codec_name,
      sampleRate: audioStream?.sample_rate ? Number(audioStream.sample_rate) : undefined,
      channels: audioStream?.channels,
    },
  };
}
