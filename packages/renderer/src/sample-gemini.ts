import {existsSync} from 'node:fs';
if(existsSync('.env'))process.loadEnvFile('.env');
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {generateGeminiVoice} from './gemini-voice.js';
import {validateEpisode} from '../../shared/src/schema.js';

const fixture=resolve(process.argv[2]??'fixtures/toolpilot-chatgpt.json');
const output=resolve(process.argv[3]??'data/gemini-flash-sample.wav');
const episode=validateEpisode(JSON.parse(await readFile(fixture,'utf8')));
await mkdir(dirname(output),{recursive:true});
const bytes=await generateGeminiVoice(episode.scenes[0].narration,output,'Puck');
console.log(JSON.stringify({model:'gemini-3.8-flash-tts',voice:'Puck',output,bytes}));
