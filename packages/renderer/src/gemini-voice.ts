import {writeFile} from 'node:fs/promises';
import {GoogleGenAI} from '@google/genai';

export const GEMINI_TTS_MODEL='gemini-3.8-flash-tts';
export const GEMINI_TTS_STYLE='Energetic and conversational tech explainer. Speak with natural variation, crisp articulation, and a quick but comfortable pace. Avoid a theatrical announcer tone.';
export type VoiceTurn={text:string;style:string};

export async function generateGeminiVoice(text:string,output:string,voice='Puck',turns?:VoiceTurn[]){
 if(!process.env.GEMINI_API_KEY)throw Error('GEMINI_API_KEY is required for Gemini Flash TTS');
 const client=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY,httpOptions:{apiVersion:'v1beta'}});
 const interaction=await client.interactions.create({
  model:GEMINI_TTS_MODEL,
  input:[{type:'user_input',content:(turns??[{text,style:GEMINI_TTS_STYLE}]).map(turn=>({type:'text' as const,text:turn.text,annotations:[{type:'speech_metadata' as const,style:turn.style}]}))}],
  response_format:{type:'audio'},
  generation_config:{speech_config:[{voice}]},
 });
 const encoded=interaction.output_audio?.data;
 if(!encoded)throw Error('Gemini returned no audio');
 const bytes=Buffer.from(encoded,'base64');
 if(bytes.length<44||bytes.toString('ascii',0,4)!=='RIFF')throw Error('Gemini returned invalid WAV audio');
 await writeFile(output,bytes);
 return bytes.length;
}
