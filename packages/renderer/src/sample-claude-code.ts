import {existsSync} from 'node:fs';
if(existsSync('.env'))process.loadEnvFile('.env');
import {mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {generateGeminiVoice} from './gemini-voice.js';

// Short Claude Code voice sample for approval.
// Uses the locked ToolPilot voice identity: Gemini Flash TTS / Puck,
// conversational witty technology educator, brisk but articulate.
const text = `Claude Code is Anthropic's terminal-based coding agent. It doesn't just chat — it reads your files, runs commands, and edits code alongside you. Think pair programming with an AI that actually has access to your terminal.`;

const style = `Conversational, witty technology educator. Brisk but articulate. Natural pauses at the end of each thought. No theatrical announcer voice. Sound like a helpful engineer explaining a tool to a peer.`;

const output = resolve(process.argv[2] ?? 'data/claude-code-voice-sample.wav');
await mkdir(dirname(output), {recursive: true});
const bytes = await generateGeminiVoice(text, output, 'Puck', [{text, style}]);
console.log(JSON.stringify({model: 'gemini-3.8-flash-tts', voice: 'Puck', output, bytes, text, style}));
