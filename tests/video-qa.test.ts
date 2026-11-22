import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import type {ProbeResult} from '../packages/renderer/src/media-tools.js';
import {validateVideoQa} from '../packages/renderer/src/video-qa.js';

const validProbe: ProbeResult = {
  format: {duration: '10.000000', size: '1000000', bit_rate: '800000'},
  streams: [
    {
      codec_type: 'video',
      codec_name: 'h264',
      width: 1920,
      height: 1080,
      avg_frame_rate: '30/1',
      r_frame_rate: '30/1',
      nb_frames: '300',
    },
    {
      codec_type: 'audio',
      codec_name: 'aac',
      sample_rate: '48000',
      channels: 2,
    },
  ],
};

const expected = {
  durationMs: 10_000,
  width: 1920,
  height: 1080,
  fps: 30,
  minAudioChannels: 1,
};

test('video QA accepts a correct H.264/AAC render', () => {
  const result = validateVideoQa(validProbe, expected);
  assert.equal(result.passed, true);
  assert.equal(result.video.frames, 300);
  assert.equal(result.video.fps, 30);
  assert.equal(result.audio.codec, 'aac');
});

test('video QA rejects the wrong resolution', () => {
  const probe = structuredClone(validProbe);
  probe.streams[0].width = 1280;
  const result = validateVideoQa(probe, expected);
  assert.equal(result.passed, false);
  assert.equal(
    result.checks.find((check) => check.id === 'resolution')?.passed,
    false,
  );
});

test('video QA rejects a missing audio stream', () => {
  const probe = structuredClone(validProbe);
  probe.streams = probe.streams.filter((stream) => stream.codec_type !== 'audio');
  const result = validateVideoQa(probe, expected);
  assert.equal(result.passed, false);
  assert.equal(
    result.checks.find((check) => check.id === 'audio-stream')?.passed,
    false,
  );
});

test('video QA parses fractional frame rates', () => {
  const probe = structuredClone(validProbe);
  probe.streams[0].avg_frame_rate = '30000/1001';
  probe.streams[0].r_frame_rate = '30000/1001';
  probe.streams[0].nb_frames = '299';
  const result = validateVideoQa(probe, {...expected, fps: 29.97});
  assert.equal(result.passed, true);
  assert.ok(result.video.fps && Math.abs(result.video.fps - 29.97) < 0.001);
});
