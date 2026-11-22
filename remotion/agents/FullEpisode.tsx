import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import type {EditorialStoryboard, EditorialScene as Scene} from '../../packages/shared/src/editorial-storyboard';
import {EditorialScene, AgentCharacter} from './EditorialScenes';
import {FontLoader} from '../fonts';

const ink='#101820', paper='#F4F0E6', lime='#B6F84A', coral='#FF715B', blue='#72CBF3';
const labels:Record<string,{kicker:string;title:string;detail:string;items:string[]}>= {
  ComicChat:{kicker:'01 / THE PROMPT',title:'BOOK ME A TRIP.',detail:'A chatbot can explain the steps.',items:['PROMPT','CHECKLIST','YOU DO THE WORK']},
  AgentEscape:{kicker:'02 / THE UPGRADE',title:'FROM WORDS TO WORK.',detail:'An agent can choose and use approved tools.',items:['SEARCH FLIGHTS','CHECK CALENDAR','COMPARE OPTIONS']},
  ActionLoop:{kicker:'03 / THE LOOP',title:'GOAL → ACTION → RESULT',detail:'Observe the result. Choose the next step.',items:['GOAL','TOOL','OBSERVE','REPEAT']},
  KitchenAnalogy:{kicker:'04 / THE ANALOGY',title:'A RECIPE IS NOT DINNER.',detail:'The agent opens the fridge.',items:['RECIPE','FRIDGE','ACT']},
  MissingEggs:{kicker:'05 / ADAPT',title:'NO EGGS. NEW PLAN.',detail:'The observation changes what happens next.',items:['LOOK','NOTICE','ADAPT']},
  CodeTerminal:{kicker:'06 / TOOL CALL',title:'A REQUEST, NOT MAGIC.',detail:'The model proposes arguments. Your code decides whether to execute.',items:['tool: get_weather','args: { date: "tomorrow" }','policy: allow?']},
  DiagramFlow:{kicker:'07 / EXECUTION',title:'RESULTS GO BACK IN.',detail:'The loop stops on an answer, a limit, or approval.',items:['MODEL → TOOL','TOOL → RESULT','RESULT → MODEL','STOP RULE']},
  ScreenDemo:{kicker:'08 / SIMULATED RUN',title:'THE COMMUTE QUESTION.',detail:'Two approved sources. One useful suggestion.',items:['WEATHER: afternoon rain','CALENDAR: meeting at 3','SUGGESTION: leave early + umbrella']},
  ComicFailure:{kicker:'09 / GUARDRAILS',title:'CONFIDENT CAN BE WRONG.',detail:'Narrow permissions and a human checkpoint matter.',items:['STALE DATA','WRONG TOOL','TIMEOUT','HUMAN APPROVAL']},
  BrandOutro:{kicker:'10 / THE TAKEAWAY',title:'GOAL + TOOLS + STOP RULE.',detail:'ToolPilot · Smarter Tools. Better Work.',items:['GOAL','TOOLS','KNOW WHEN TO STOP']},
};

const Card:React.FC<{scene:Scene;portrait:boolean;square:boolean}>=({scene,portrait,square})=>{
  const f=useCurrentFrame();const d=labels[scene.type];const {width,height}=useVideoConfig();
  const dark=['AgentEscape','ActionLoop','CodeTerminal','DiagramFlow','ComicFailure','BrandOutro'].includes(scene.type);
  const base=dark?ink:paper,fg=dark?paper:ink;const pad=portrait?90:square?80:140;
  const titleSize=portrait?92:square?78:104;
  const enter=interpolate(f,[0,14],[40,0],{extrapolateRight:'clamp'});
  const highlight=Math.floor(f/48)%d.items.length;
  return <AbsoluteFill style={{background:base,color:fg,fontFamily:'Inter, Arial, sans-serif',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:12,background:lime}}/>
    <div style={{position:'absolute',top:portrait?140:75,left:pad,fontSize:24,fontWeight:800,letterSpacing:5,color:lime}}>{d.kicker}</div>
    <div style={{position:'absolute',left:pad,right:pad,top:portrait?245:square?195:185,transform:`translateY(${enter}px)`,opacity:Math.min(1,f/12)}}>
      <div style={{fontSize:titleSize,fontWeight:900,lineHeight:.98,letterSpacing:-5,maxWidth:portrait?860:width-2*pad}}>{d.title}</div>
      <div style={{fontSize:portrait?38:square?30:34,lineHeight:1.25,marginTop:35,maxWidth:portrait?780:1200}}>{d.detail}</div>
    </div>
    <div style={{position:'absolute',left:pad,right:pad,top:portrait?660:square?520:540,display:'flex',flexDirection:portrait?'column':'row',gap:portrait?22:24,flexWrap:'wrap'}}>
      {d.items.map((item,i)=><div key={item} style={{border:`3px solid ${i===highlight?lime:dark?'#54636A':'#A5ABA4'}`,background:i===highlight?lime:dark?'#263741':'#FFFFFF',color:i===highlight?ink:fg,borderRadius:16,padding:portrait?'26px 30px':'22px 28px',fontFamily:'JetBrains Mono, monospace',fontWeight:800,fontSize:portrait?30:square?23:27,boxShadow:i===highlight?'8px 8px 0 #567C2B':'none',maxWidth:'100%',overflowWrap:'anywhere'}}>{item}</div>)}
    </div>
    {scene.type==='ScreenDemo'&&<div style={{position:'absolute',right:pad,bottom:portrait?440:square?350:205,fontSize:20,fontWeight:800,background:coral,color:ink,padding:'12px 20px'}}>ILLUSTRATIVE SIMULATION</div>}
    {portrait&&<div style={{position:'absolute',bottom:360,right:100,opacity:.7}}><AgentCharacter size={220}/></div>}
    <div style={{position:'absolute',left:pad,bottom:portrait?270:square?260:110,fontSize:22,fontWeight:800,letterSpacing:3}}>TOOLPILOT <span style={{color:lime}}>●</span> AI AGENTS / 100</div>
  </AbsoluteFill>;
};

const Caption:React.FC<{storyboard:EditorialStoryboard;portrait:boolean;square:boolean}>=({storyboard,portrait,square})=>{
  const frame=useCurrentFrame();const ms=frame*1000/30;
  const cue=storyboard.narration.captions.find(c=>ms>=c.startMs&&ms<c.endMs);
  if(!cue)return null;
  return <div style={{position:'absolute',zIndex:20,left:portrait?80:120,right:portrait?80:120,bottom:portrait?300:square?95:50,display:'flex',justifyContent:'center',pointerEvents:'none'}}><div style={{maxWidth:portrait?900:1450,background:'rgba(4,9,14,.94)',color:'#fff',borderLeft:`8px solid ${lime}`,borderRadius:12,padding:portrait?'22px 28px':'15px 25px',fontFamily:'Inter,Arial,sans-serif',fontWeight:750,fontSize:portrait?44:square?34:38,textAlign:'center',lineHeight:1.2}}>{cue.text}</div></div>;
};

export const FullEpisode:React.FC<{storyboard:EditorialStoryboard;audioPath?:string}>=({storyboard,audioPath='generated/agents-full.wav'})=>{
  const {width,height}=useVideoConfig();const portrait=height>width,square=height===width;
  return <AbsoluteFill style={{background:ink}}><FontLoader/>
    <Audio src={staticFile(audioPath)}/>
    {storyboard.scenes.slice(1).map(scene=><Sequence key={`sfx-${scene.id}`} from={Math.round(scene.startMs*30/1000)} durationInFrames={12}><Audio src={staticFile('generated/agents-tick.wav')} volume={0.11}/></Sequence>)}
    {storyboard.scenes.map(scene=><Sequence key={scene.id} from={Math.round(scene.startMs*30/1000)} durationInFrames={Math.round(scene.durationMs*30/1000)} name={scene.id}>
      {!portrait&&!square&&scene.startMs<30000?<EditorialScene type={scene.type}/>:<Card scene={scene} portrait={portrait} square={square}/>}
    </Sequence>)}
    <Caption storyboard={storyboard} portrait={portrait} square={square}/>
  </AbsoluteFill>;
};
