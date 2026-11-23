import {existsSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {generateGeminiVoice} from './gemini-voice.js';
import {ffmpegPath, probe, run} from './media-tools.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const dir = resolve('data/episodes/toolpilot/singularity-explained/qa/voice-sample');
await mkdir(dir, {recursive: true});
const text = "Elon Musk says we've entered the singularity. That sounds like science fiction, but what does it actually mean? Start with the classic idea: AI becomes smarter than humans, then helps build even smarter AI.";
const raw = resolve(dir, 'puck-sample-raw.wav');
const output = resolve(dir, 'puck-sample.wav');
await generateGeminiVoice(text, raw, 'Puck', [{text, style: 'Conversational, witty technology educator. Brisk but articulate, with natural pauses. Curious, clear, and grounded; never theatrical or alarmist. Emphasize the question naturally.'}]);
await run(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-ar', '48000', '-ac', '1', output]);
const info = await probe(output);
console.log(JSON.stringify({output, model: 'gemini-3.8-flash-tts', voice: 'Puck', durationSeconds: info.format.duration, sampleRate: info.streams.find(s => s.codec_type === 'audio')?.sample_rate}, null, 2));
