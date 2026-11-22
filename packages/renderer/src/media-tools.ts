import {execFile} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);

const platformInstaller = (() => {
  if (process.platform === 'darwin' && process.arch === 'arm64') {
    return {
      ffmpeg: 'node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg',
      ffprobe: 'node_modules/@ffprobe-installer/darwin-arm64/ffprobe',
    };
  }
  if (process.platform === 'darwin' && process.arch === 'x64') {
    return {
      ffmpeg: 'node_modules/@ffmpeg-installer/darwin-x64/ffmpeg',
      ffprobe: 'node_modules/@ffprobe-installer/darwin-x64/ffprobe',
    };
  }
  if (process.platform === 'linux' && process.arch === 'x64') {
    return {
      ffmpeg: 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg',
      ffprobe: 'node_modules/@ffprobe-installer/linux-x64/ffprobe',
    };
  }
  return {ffmpeg: 'ffmpeg', ffprobe: 'ffprobe'};
})();

function resolveBinary(envName: string, installerPath: string, fallback: string): string {
  const override = process.env[envName];
  if (override) return override;
  const local = resolve(installerPath);
  if (existsSync(local)) return local;
  return fallback;
}

export const ffmpegPath = resolveBinary('FFMPEG_PATH', platformInstaller.ffmpeg, 'ffmpeg');
export const ffprobePath = resolveBinary('FFPROBE_PATH', platformInstaller.ffprobe, 'ffprobe');

export interface CommandResult {
  stdout: string;
  stderr: string;
}

export async function run(
  command: string,
  args: string[],
  options: {allowFailure?: boolean} = {},
): Promise<CommandResult> {
  try {
    const result = await execFileAsync(command, args, {
      maxBuffer: 16 * 1024 * 1024,
      encoding: 'utf8',
    });
    return {stdout: result.stdout, stderr: result.stderr};
  } catch (error) {
    const failure = error as {stdout?: string; stderr?: string; message?: string};
    if (options.allowFailure) {
      return {stdout: failure.stdout ?? '', stderr: failure.stderr ?? failure.message ?? ''};
    }
    throw new Error(
      `${command} failed:\n${(failure.stderr ?? failure.message ?? '').slice(-4000)}`,
    );
  }
}

export interface ProbeResult {
  format: {
    duration?: string;
    size?: string;
    bit_rate?: string;
  };
  streams: Array<{
    codec_type: 'video' | 'audio' | 'subtitle' | string;
    codec_name?: string;
    width?: number;
    height?: number;
    r_frame_rate?: string;
    avg_frame_rate?: string;
    nb_frames?: string;
    sample_rate?: string;
    channels?: number;
    duration?: string;
  }>;
}

export async function probe(file: string): Promise<ProbeResult> {
  const {stdout} = await run(ffprobePath, [
    '-v',
    'error',
    '-show_format',
    '-show_streams',
    '-of',
    'json',
    file,
  ]);
  return JSON.parse(stdout) as ProbeResult;
}

export interface SilenceInterval {
  start: number;
  end: number;
  duration: number;
}

export interface SilenceReport {
  intervals: SilenceInterval[];
  duration: number;
}

export async function detectSilence(
  file: string,
  options: {noiseDb?: number; minDuration?: number} = {},
): Promise<SilenceReport> {
  const noiseDb = options.noiseDb ?? -40;
  const minDuration = options.minDuration ?? 0.12;
  const {stderr} = await run(ffmpegPath, [
    '-hide_banner',
    '-nostats',
    '-i',
    file,
    '-af',
    `silencedetect=noise=${noiseDb}dB:d=${minDuration}`,
    '-f',
    'null',
    '-',
  ]);

  const intervals: SilenceInterval[] = [];
  let pendingStart: number | null = null;
  for (const line of stderr.split(/\r?\n/)) {
    const startMatch = line.match(/silence_start:\s*([0-9.]+)/);
    if (startMatch) {
      pendingStart = Number(startMatch[1]);
      continue;
    }
    const endMatch = line.match(
      /silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)/,
    );
    if (endMatch) {
      const end = Number(endMatch[1]);
      const duration = Number(endMatch[2]);
      const start = pendingStart ?? Math.max(0, end - duration);
      intervals.push({start, end, duration});
      pendingStart = null;
    }
  }

  const probed = await probe(file);
  return {
    intervals,
    duration: Number(probed.format.duration ?? 0),
  };
}

export async function trimAudio(
  input: string,
  output: string,
  startSeconds: number,
  durationSeconds: number,
): Promise<void> {
  await run(ffmpegPath, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-i',
    input,
    '-ss',
    startSeconds.toFixed(3),
    '-t',
    durationSeconds.toFixed(3),
    '-ar',
    '48000',
    '-ac',
    '1',
    '-c:a',
    'pcm_s16le',
    output,
  ]);
}

export async function loudness(file: string): Promise<{meanDb: number; maxDb: number}> {
  const {stderr} = await run(ffmpegPath, [
    '-hide_banner',
    '-nostats',
    '-i',
    file,
    '-af',
    'volumedetect',
    '-f',
    'null',
    '-',
  ]);
  const meanMatch = stderr.match(/mean_volume:\s*(-?[0-9.]+) dB/);
  const maxMatch = stderr.match(/max_volume:\s*(-?[0-9.]+) dB/);
  return {
    meanDb: meanMatch ? Number(meanMatch[1]) : -Infinity,
    maxDb: maxMatch ? Number(maxMatch[1]) : -Infinity,
  };
}
