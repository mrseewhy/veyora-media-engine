import React from 'react';
import {staticFile} from 'remotion';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const arrive = (frame: number, delay: number) => 1 - (1 - clamp((frame - delay) / 12)) ** 3;

const Rail: React.FC<{x: number; y: number; width: number}> = ({x, y, width}) => <g><rect x={x} y={y} width={width} height="18" rx="4" fill="#131b1c"/><rect x={x} y={y} width={width} height="4" fill="#bdb2a0" opacity=".45"/></g>;
const Terminal: React.FC<{x: number; y: number; frame: number; accent: string}> = ({x, y, frame, accent}) => <g transform={`translate(${x} ${y})`}><rect width="180" height="132" rx="8" fill="#101b1d" stroke="#768781" strokeWidth="5"/><rect x="12" y="12" width="156" height="94" fill="#20332f"/>{[0,1,2,3].map(i=><rect key={i} x="23" y={28+i*17} width={55+(i*37)%72} height="5" rx="2" fill={i===2?accent:'#b5d5bd'} opacity={arrive(frame,i*5)}/>) }<rect x="72" y="113" width="36" height="18" fill="#85928b"/><rect x="48" y="130" width="84" height="9" fill="#6d7871"/></g>;
const Cabinet: React.FC<{x: number; y: number; frame: number; accent: string}> = ({x, y, frame, accent}) => <g transform={`translate(${x} ${y})`}><rect width="105" height="290" rx="7" fill="#172224" stroke="#83918a" strokeWidth="5"/>{[0,1,2,3,4,5].map(i=><g key={i}><rect x="13" y={17+i*42} width="78" height="29" rx="3" fill="#263637"/><rect x="22" y={25+i*42} width="35" height="3" fill="#7d9990"/><circle cx="76" cy={31+i*42} r="5" fill={arrive(frame,i*7)>.5?accent:'#485552'}/></g>)}<path d="M92 262 Q135 280 130 310" stroke="#c1ad85" strokeWidth="6" fill="none"/></g>;
const Document: React.FC<{x: number; y: number; rotation: number; frame: number; accent: string}> = ({x,y,rotation,frame,accent}) => <g transform={`translate(${x} ${y-60*(1-arrive(frame,0))}) rotate(${rotation})`}><rect width="142" height="190" rx="5" fill="#e8e0cd"/><rect x="16" y="18" width="110" height="13" fill={accent}/>{[0,1,2,3,4,5].map(i=><rect key={i} x="16" y={50+i*20} width={i%3===0?88:110} height="5" fill="#7c857f"/>)}<circle cx="103" cy="155" r="20" fill="none" stroke="#b65f4e" strokeWidth="7"/></g>;
const Lens: React.FC<{x:number;y:number;frame:number;accent:string}> = ({x,y,frame,accent}) => <g transform={`translate(${x+90*(1-arrive(frame,7))} ${y}) rotate(-18)`}><circle r="43" fill="#dce2d9" opacity=".2" stroke={accent} strokeWidth="12"/><path d="M30 30 L90 95" stroke="#aa7d59" strokeWidth="19" strokeLinecap="round"/></g>;
const ChipTray: React.FC<{x:number;y:number;frame:number;accent:string}> = ({x,y,frame,accent}) => <g transform={`translate(${x} ${y+90*(1-arrive(frame,8))})`}><rect width="190" height="90" rx="7" fill="#4c5950" stroke="#b1aa90" strokeWidth="5"/><rect x="53" y="12" width="80" height="65" rx="6" fill="#1e2a2b" stroke={accent} strokeWidth="6"/><rect x="72" y="29" width="42" height="32" fill={accent}/>{[0,1,2,3].map(i=><rect key={i} x={17+i*42} y="77" width="20" height="9" fill="#c0ad82"/>)}</g>;
const PhotoProp: React.FC<{file:string;label:string;x:number;y:number;frame:number}> = ({file,label,x,y,frame}) => <g transform={`translate(${x+180*(1-arrive(frame,10))} ${y}) rotate(5)`}><rect x="-10" y="-10" width="290" height="225" rx="6" fill="#ece4d3"/><image href={staticFile(`generated/singularity-explained/${file}`)} width="270" height="175" preserveAspectRatio="xMidYMid slice"/><text x="8" y="200" fontSize="14" fontWeight="800" fill="#34403d">{label}</text></g>;

/** Shot-specific physical context sits behind the principal action. Its props enter on motivated drags. */
export const SceneSet: React.FC<{shotId:string; frame:number; accent:string}> = ({shotId,frame,accent}) => {
  const supported = new Set(['claim-02','claim-03','claim-04','definition-01','definition-03','definition-04','feedback-01','feedback-02','feedback-03','today-01','today-02','today-03','today-04','today-05','interpretation-02','takeaway-01','takeaway-02','takeaway-03','takeaway-05']);
  if (!supported.has(shotId)) return null;
  const technical = /^(definition-0[134]|feedback-0[123]|today-0[12345]|takeaway-0[23])$/.test(shotId);
  const p=arrive(frame,0);
  return <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{position:'absolute',inset:0,overflow:'visible'}} aria-hidden="true">
    <defs>
      <linearGradient id="set-floor" x2="0" y2="1"><stop stopColor="#d6c8ad" stopOpacity=".16"/><stop offset="1" stopColor="#111b1b" stopOpacity=".48"/></linearGradient>
      <pattern id="set-grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="#e4d8c3" strokeOpacity=".12" strokeWidth="2"/></pattern>
    </defs>
    {technical && <rect x="12" y="22" width="976" height="645" rx="23" fill="url(#set-grid)" opacity={p}/>}
    {technical && <path d="M0 610 H1000 V700 H0Z" fill="url(#set-floor)"/>}
    {shotId==='claim-02' && <g opacity=".8"><Cabinet x={35} y={300} frame={frame} accent={accent}/><Rail x={145} y={574} width={720}/><path d="M116 568 Q215 630 278 595" stroke="#c8ad83" strokeWidth="6" fill="none"/></g>}
    {shotId==='claim-03' && <g opacity=".8"><Document x={60} y={350} rotation={-11} frame={frame} accent={accent}/><Document x={780} y={320} rotation={9} frame={frame} accent={accent}/><Lens x={740} y={490} frame={frame} accent={accent}/></g>}
    {shotId==='claim-04' && <g opacity=".7"><Document x={710} y={190} rotation={11} frame={frame} accent={accent}/></g>}
    {shotId==='definition-01' && <g opacity=".75"><Terminal x={45} y={420} frame={frame} accent={accent}/><Cabinet x={850} y={300} frame={frame} accent={accent}/><Rail x={220} y={605} width={650}/></g>}
    {shotId==='definition-03' && <g opacity=".7"><Terminal x={45} y={405} frame={frame} accent={accent}/><Cabinet x={850} y={300} frame={frame} accent={accent}/></g>}
    {shotId==='definition-04' && <g opacity=".8"><ChipTray x={150} y={510} frame={frame} accent={accent}/><Rail x={190} y={610} width={620}/><PhotoProp file="pcb-img4512.jpg" label="ILLUSTRATIVE HARDWARE" x={690} y={70} frame={frame}/></g>}
    {shotId==='feedback-01' && <g opacity=".9"><Cabinet x={25} y={235} frame={frame} accent={accent}/><Rail x={130} y={592} width={750}/><ChipTray x={635} y={510} frame={frame} accent={accent}/><PhotoProp file="robot-line-clemenspool.jpg" label="ILLUSTRATIVE ASSEMBLY" x={635} y={45} frame={frame}/></g>}
    {shotId==='feedback-02' && <g opacity=".8"><Terminal x={780} y={390} frame={frame} accent={accent}/><ChipTray x={115} y={510} frame={frame} accent={accent}/><Rail x={165} y={610} width={630}/></g>}
    {shotId==='feedback-03' && <g opacity=".75"><Cabinet x={30} y={300} frame={frame} accent={accent}/><Cabinet x={865} y={280} frame={frame} accent={accent}/><Rail x={150} y={610} width={700}/></g>}
    {shotId==='today-01' && <g opacity=".8"><Terminal x={35} y={385} frame={frame} accent={accent}/><Document x={805} y={315} rotation={-9} frame={frame} accent={accent}/></g>}
    {shotId==='today-02' && <g opacity=".75"><Terminal x={30} y={390} frame={frame} accent={accent}/><Rail x={195} y={610} width={620}/></g>}
    {shotId==='today-03' && <g opacity=".75"><Terminal x={30} y={390} frame={frame} accent={accent}/></g>}
    {shotId==='today-04' && <g opacity=".75"><Document x={800} y={320} rotation={9} frame={frame} accent={accent}/><Terminal x={35} y={390} frame={frame} accent={accent}/></g>}
    {shotId==='today-05' && <g opacity=".75"><Cabinet x={35} y={300} frame={frame} accent={accent}/><Rail x={170} y={610} width={660}/></g>}
    {shotId==='interpretation-02' && <g opacity=".7"><circle cx="190" cy="180" r="7" fill={accent}/><circle cx="850" cy="105" r="5" fill="#f6ead5"/><circle cx="760" cy="240" r="4" fill="#f6ead5"/></g>}
    {shotId==='takeaway-01' && <g opacity=".8"><Document x={40} y={325} rotation={-12} frame={frame} accent={accent}/><Document x={795} y={310} rotation={9} frame={frame} accent={accent}/><Lens x={700} y={450} frame={frame} accent={accent}/></g>}
    {shotId==='takeaway-02' && <g opacity=".8"><Cabinet x={30} y={300} frame={frame} accent={accent}/><ChipTray x={710} y={515} frame={frame} accent={accent}/><Rail x={180} y={610} width={640}/></g>}
    {shotId==='takeaway-03' && <g opacity=".7"><Cabinet x={30} y={300} frame={frame} accent={accent}/><path d="M140 570 Q280 660 500 595" stroke="#c5af83" strokeWidth="8" fill="none"/></g>}
    {shotId==='takeaway-05' && <g opacity=".8"><Document x={40} y={325} rotation={-12} frame={frame} accent={accent}/><Document x={795} y={310} rotation={9} frame={frame} accent={accent}/><Lens x={700} y={450} frame={frame} accent={accent}/></g>}
  </svg>;
};
