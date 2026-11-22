import {existsSync} from 'node:fs';
if(existsSync('.env'))process.loadEnvFile('.env');
import {readFile,mkdir,rename} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {generateGeminiVoice,type VoiceTurn} from './gemini-voice.js';

const fixture=JSON.parse(await readFile(resolve('fixtures/gemini-technical-sample.json'),'utf8')) as {voice:string;turns:VoiceTurn[]};
if(fixture.turns.length!==3||fixture.turns.some(t=>!t.text||!t.style))throw Error('Invalid technical voice sample');
const output=resolve(process.argv[2]??'data/gemini-technical-sample.wav');
const raw=output.replace(/\.wav$/,'.raw.wav');
await mkdir(dirname(output),{recursive:true});
const bytes=await generateGeminiVoice(fixture.turns.map(t=>t.text).join(' '),raw,fixture.voice,fixture.turns);
const probe=resolve('node_modules/@ffprobe-installer/darwin-arm64/ffprobe');
const ffmpeg=resolve('node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg');
const duration=Number(execFileSync(probe,['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',raw],{encoding:'utf8'}));
if(!Number.isFinite(duration)||duration<25||duration>40)throw Error(`Gemini sample outside expected duration: ${duration}`);
execFileSync(ffmpeg,['-y','-v','error','-i',raw,'-af',`atempo=${(duration/30).toFixed(6)}`,'-t','30','-ar','24000','-ac','1',output]);
console.log(JSON.stringify({model:'gemini-3.8-flash-tts',voice:fixture.voice,output,bytes,rawSeconds:duration,targetSeconds:30}));
