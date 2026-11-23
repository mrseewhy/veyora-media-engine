import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import episode from '../../episodes/toolpilot/singularity-explained/script.json';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const reveal = (f: number, at = 0, span = 18) => clamp((f - at) / span);
const paper = '#f4efe5';
const ink = '#171a20';
const orange = '#f18b42';
const cyan = '#76e7e4';
const palettes = [
  {bg: '#191b20', fg: paper, accent: orange},
  {bg: '#e7e3d9', fg: ink, accent: '#d7503b'},
  {bg: '#111c19', fg: paper, accent: '#a2df74'},
  {bg: '#d9e5dd', fg: ink, accent: '#2b796e'},
  {bg: '#211b25', fg: paper, accent: '#f0ad70'},
  {bg: '#e7ddd0', fg: ink, accent: '#b84e3e'},
];
const beats = [
  ['post', 'switch', 'evidence', 'word'],
  ['clock', 'horizon', 'brain', 'design'],
  ['successor', 'test', 'accelerate', 'future'],
  ['work', 'code', 'image', 'people', 'deploy'],
  ['speaker', 'blackhole', 'horizon', 'uncertainty'],
  ['observe', 'iterate', 'limits', 'calendar', 'evidence'],
] as const;
export const singularityBeatCount = beats.map((b) => b.length);
export const singularityBeatName = (segment: number, beat: number) => beats[segment]?.[beat] ?? 'unknown';

const Path: React.FC<{d: string; color: string; width?: number; dash?: string}> = ({d, color, width = 7, dash}) => <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash}/>;
const Node: React.FC<{x: number; y: number; r?: number; color: string; label?: string}> = ({x,y,r=22,color,label}) => <g><circle cx={x} cy={y} r={r} fill={color}/>{label && <text x={x} y={y+7} textAnchor="middle" fontSize="20" fontWeight="800" fill={ink}>{label}</text>}</g>;
const Glyph: React.FC<{kind: string; t: number; color: string; fg: string}> = ({kind,t,color,fg}) => {
  const n = reveal(t, 8, 30);
  if (kind === 'post') return <g><rect x="185" y="120" width="590" height="390" rx="20" fill="#f6f4f0"/><circle cx="265" cy="205" r="36" fill="#333"/><text x="325" y="210" fontSize="28" fill={ink} fontWeight="800">ELON MUSK</text><text x="245" y="330" fontSize="39" fill={ink} fontWeight="750">“We have entered</text><text x="245" y="390" fontSize="39" fill={ink} fontWeight="750">the Singularity.”</text><rect x="245" y="435" width={450*n} height="8" fill={color}/><text x="245" y="485" fontSize="19" fill="#555">PUBLIC POST · 4 JAN 2026 · SOURCE IN MANIFEST</text></g>;
  if (kind === 'switch') return <g><rect x="275" y="165" width="400" height="340" rx="50" fill="#30353a"/><rect x="395" y="220" width="160" height="200" rx="75" fill="#151719" stroke={fg} strokeWidth="6"/><circle cx="475" cy={t < 48 ? 345 : 275} r="47" fill={color}/><Path d="M 195 540 L 770 540" color={fg} width={3}/><text x="480" y="585" textAnchor="middle" fontSize="25" fill={fg}>NO SINGLE MOMENT OF CHANGE</text></g>;
  if (kind === 'evidence') return <g><rect x="145" y="140" width="680" height="420" rx="18" fill="#f3f0e9"/><text x="190" y="205" fill={ink} fontSize="28" fontWeight="800">EVIDENCE DESK</text>{[0,1,2].map((i)=><g key={i}><rect x={190+i*205} y="255" width="170" height="210" rx="10" fill={i===2?'#d9dfd8':'#ddd5ca'}/><circle cx={275+i*205} cy={315} r="35" fill={i===2?color:'#8d8d89'}/><Path d={`M ${215+i*205} 393 L ${335+i*205} 393`} color={ink} width={4}/></g>)}<Path d={`M 220 505 L ${220+510*n} 505`} color={color}/></g>;
  if (kind === 'word') return <g><text x="480" y="330" textAnchor="middle" fontSize="68" fontWeight="850" fill={fg}>SINGULARITY</text><Path d={`M 180 390 L ${180+600*n} 390`} color={color} width={10}/><circle cx="480" cy="515" r={18+30*n} fill={color}/></g>;
  if (kind === 'clock') return <g><circle cx="470" cy="325" r="195" fill="none" stroke={fg} strokeWidth="14"/><Path d="M 470 325 L 470 200 M 470 325 L 590 355" color={color} width={12}/>{Array.from({length:12},(_,i)=><circle key={i} cx={470+165*Math.sin(i*Math.PI/6)} cy={325-165*Math.cos(i*Math.PI/6)} r="5" fill={fg}/>)}<Path d={`M 120 600 L ${120+720*n} 600`} color={color}/></g>;
  if (kind === 'horizon' || kind === 'blackhole') return <g><circle cx="485" cy="330" r="235" fill="none" stroke={color} strokeWidth="5" strokeDasharray="18 18"/><circle cx="485" cy="330" r={85+45*n} fill="#050608"/><circle cx="485" cy="330" r="158" fill="none" stroke={fg} strokeWidth="3" opacity="0.4"/><Path d="M 170 600 Q 485 540 800 600" color={color} width={6}/><text x="485" y="655" textAnchor="middle" fill={fg} fontSize="22">BEYOND OBSERVATION</text></g>;
  if (kind === 'brain') return <g>{Array.from({length:18},(_,i)=>{const a=i*2.4;const x=480+Math.cos(a)*200;const y=330+Math.sin(a)*150;return <g key={i}><Path d={`M 480 330 L ${x} ${y}`} color={fg} width={2}/><Node x={x} y={y} r={10+10*reveal(t,i*3,10)} color={i%3===0?color:fg}/></g>})}<Node x={480} y={330} r={55+15*n} color={color}/></g>;
  if (kind === 'design' || kind === 'successor' || kind === 'iterate') return <g><rect x="105" y="235" width="255" height="190" rx="22" fill={fg} opacity="0.15" stroke={fg} strokeWidth="5"/><circle cx="235" cy="325" r="48" fill={color}/><Path d="M 285 327 C 390 510 500 165 610 320" color={color} width={9} dash="14 12"/><path d="M 610 320 l -32 -16 l 0 36 z" fill={color}/><rect x="610" y="200" width="255" height="245" rx="22" fill={fg} opacity={0.2+0.3*n} stroke={fg} strokeWidth="5"/>{Array.from({length:8},(_,i)=><Node key={i} x={660+(i%4)*48} y={270+Math.floor(i/4)*85} r={13+8*n} color={color}/>)}<Path d={`M 105 530 L ${105+760*n} 530`} color={color}/></g>;
  if (kind === 'test') return <g><rect x="145" y="160" width="670" height="430" rx="15" fill="#17201c" stroke={fg} strokeWidth="4"/><text x="190" y="225" fontSize="24" fill={fg}>VALIDATION RUN</text>{[0,1,2,3].map((i)=><g key={i}><rect x="195" y={270+i*65} width={440*reveal(t,i*13,25)} height="25" fill={i===3?color:fg} opacity="0.75"/><circle cx="685" cy={282+i*65} r="16" fill={reveal(t,i*13,10)===1?color:'#444'}/></g>)}</g>;
  if (kind === 'accelerate') return <g>{[0,1,2,3,4].map((i)=><g key={i} opacity={reveal(t,i*10,8)}><circle cx={145+i*165} cy={510-i*i*19} r={26+i*7} fill={color}/><Path d={`M ${145+i*165} ${510-i*i*19} L ${145+i*165} 570`} color={fg} width={3}/></g>)}<Path d="M 150 575 C 330 535 570 490 800 120" color={fg} width={7}/></g>;
  if (kind === 'future' || kind === 'uncertainty') return <g><Path d="M 120 540 L 465 270 L 820 550" color={fg} width={9}/><Path d="M 465 270 L 465 150" color={color} width={6}/>{[0,1,2,3,4].map((i)=><Path key={i} d={`M 465 270 L ${110+i*180} ${610-i*24}`} color={color} width={3} dash="8 12"/>)}<circle cx="465" cy="270" r={30+25*n} fill={color}/></g>;
  if (kind === 'work' || kind === 'code' || kind === 'image' || kind === 'people' || kind === 'deploy') return <g><rect x="135" y="130" width="690" height="420" rx="22" fill={fg} opacity="0.13" stroke={fg} strokeWidth="5"/><rect x="175" y="178" width="610" height="38" rx="7" fill={color}/>{kind==='image'? <g><rect x="210" y="255" width="275" height="220" rx="8" fill={color} opacity="0.5"/><circle cx="275" cy="310" r="28" fill={fg}/><Path d="M 220 455 L 340 335 L 480 455" color={fg} width={7}/></g>:kind==='people'? <g>{[0,1,2].map(i=><g key={i}><circle cx={310+i*160} cy="320" r="40" fill={color}/><Path d={`M ${235+i*160} 475 Q ${310+i*160} 355 ${385+i*160} 475`} color={fg} width={12}/></g>)}</g>: <g>{[0,1,2,3,4].map(i=><Path key={i} d={`M 210 ${270+i*45} L ${300+(i%2)*50+330*reveal(t,i*7,20)} ${270+i*45}`} color={i%2?color:fg} width={9}/>)}</g>}<Path d="M 135 605 L 825 605" color={color}/></g>;
  if (kind === 'speaker') return <g><circle cx="470" cy="290" r="100" fill="#55505a"/><Path d="M 350 570 Q 470 365 590 570" color={fg} width={90}/><rect x="155" y="560" width="630" height="70" rx="10" fill={color}/><text x="470" y="608" textAnchor="middle" fill={ink} fontSize="27" fontWeight="800">ANALOGY · NOT EVIDENCE</text></g>;
  if (kind === 'observe' || kind === 'limits' || kind === 'calendar' || kind === 'evidence') return <g><rect x="160" y="135" width="640" height="450" rx="20" fill={fg} opacity="0.12" stroke={fg} strokeWidth="5"/>{[0,1,2].map(i=><g key={i}><circle cx={265+i*210} cy="280" r="65" fill="none" stroke={color} strokeWidth="6"/><Node x={265+i*210} y={280} r={20+18*reveal(t,i*12,15)} color={color}/><Path d={`M ${210+i*210} 415 L ${320+i*210} 415`} color={fg} width={7}/></g>)}<Path d={`M 190 510 L ${190+580*n} 510`} color={color} width={12}/></g>;
  return <g/>;
};

export const SingularityStory: React.FC<{segmentIndex: number; duration: number}> = ({segmentIndex,duration}) => {
  const frame=useCurrentFrame();
  const {width,height}=useVideoConfig();
  const compact=width/height<1.5;
  const list=beats[segmentIndex];
  const beatIndex=Math.min(list.length-1,Math.floor(frame/duration*list.length));
  const local=frame-Math.floor(beatIndex*duration/list.length);
  const palette=palettes[segmentIndex];
  const beat=list[beatIndex];
  const line=episode.segments[segmentIndex].text.match(/[^.!?]+[.!?]+[’'”"]?/g)?.map(x=>x.trim()) ?? [];
  const caption=line[Math.min(line.length-1,Math.floor(frame/duration*line.length))] ?? '';
  return <AbsoluteFill style={{backgroundColor:palette.bg,color:palette.fg,fontFamily:'Inter, Arial, sans-serif',overflow:'hidden'}}>
    <div style={{position:'absolute',left:compact?'7%':'8%',top:compact?'12%':'10%',fontSize:compact?29:25,letterSpacing:3,fontWeight:800,color:palette.accent}}>{episode.segments[segmentIndex].label}</div>
    <div style={{position:'absolute',left:compact?'8%':'7%',top:compact?'21%':'16%',width:compact?'84%':'48%',height:compact?'52%':'66%'}}><svg viewBox="0 0 960 720" width="100%" height="100%"><Glyph kind={beat} t={local} color={palette.accent} fg={palette.fg}/></svg></div>
    {!compact && <div style={{position:'absolute',right:'8%',top:'27%',width:'31%',fontSize:58,fontWeight:850,lineHeight:1.06,letterSpacing:-2}}>{beat==='post'?'THE CLAIM':beat==='successor'?'EACH VERSION BUILDS THE NEXT':beat==='test'?'CAN IT VERIFY THE CHANGE?':beat==='speaker'?'A METAPHOR FOR UNCERTAINTY':beat==='observe'?'WATCH THE EVIDENCE':null}</div>}
    <div style={{position:'absolute',left:compact?'7%':'15%',right:compact?'7%':'15%',bottom:compact?'10%':'7%',minHeight:compact?110:75,padding:compact?'22px 25px':'15px 25px',background:'#080b0dd9',color:paper,borderRadius:12,fontSize:compact?32:34,fontWeight:650,textAlign:'center',display:'grid',placeItems:'center',lineHeight:1.15}}>{caption}</div>
    <div style={{position:'absolute',left:'8%',bottom:'4%',width:`${Math.round((frame/duration)*84)}%`,height:3,background:palette.accent}}/>
  </AbsoluteFill>;
};
