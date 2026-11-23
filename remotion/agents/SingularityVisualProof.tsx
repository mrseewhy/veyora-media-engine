import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';

const caption: React.CSSProperties = {position:'absolute',left:170,right:170,bottom:105,color:'#fff8e7',fontFamily:'Arial, sans-serif',fontSize:56,fontWeight:700,textAlign:'center',textShadow:'0 3px 18px #000, 0 2px 5px #000',lineHeight:1.15};

const MuskShot: React.FC = () => {
 const f=useCurrentFrame();
 const scale=interpolate(f,[0,120],[1.03,1.11]);
 return <AbsoluteFill style={{background:'#d5a467',overflow:'hidden'}}>
  <Img src={staticFile('generated/singularity-visual/elon-editorial.png')} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${scale}) translateX(${interpolate(f,[0,120],[0,-1.2])}%)`}} />
  <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg, transparent 40%, #241c1940 100%), linear-gradient(0deg,#18110eaa,transparent 38%)'}} />
  <div style={{position:'absolute',left:165,top:112,color:'#392519',fontFamily:'Arial, sans-serif',fontWeight:800,letterSpacing:5,fontSize:25,background:'#f4dfb9d9',padding:'12px 18px'}}>EDITORIAL ILLUSTRATION</div>
  <div style={caption}>{f<98?"Elon Musk posted: “We have entered the Singularity.”":"Big words."}</div>
 </AbsoluteFill>;
};

const ProcessShot: React.FC = () => {
 const f=useCurrentFrame();
 const zoom=interpolate(f,[0,327],[1.12,1.23]);
 const pan=interpolate(f,[0,327],[7,-8]);
 const words=f<118?'That successor could help design another, even more capable system.':f<224?'Each generation might shorten the time to the next.':f<295?'This is called recursive self improvement.':'';
 return <AbsoluteFill style={{background:'#0b0c10',overflow:'hidden'}}>
  <Img src={staticFile('generated/singularity-visual/recursive-workshop.png')} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${zoom}) translateX(${pan}%)`}} />
  <div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,#090b11df,transparent 35%)'}} />
  <div style={{...caption,bottom:100}}>{words}</div>
  <div style={{position:'absolute',right:160,bottom:40,color:'#f3b59b',fontFamily:'Arial',fontSize:20,letterSpacing:2}}>CONCEPTUAL ILLUSTRATION</div>
 </AbsoluteFill>;
};

export const SingularityVisualProof: React.FC = () => <AbsoluteFill>
 <Sequence from={0} durationInFrames={123}><MuskShot/><Audio src={staticFile('generated/singularity-visual/claim.wav')} endAt={123}/></Sequence>
 <Sequence from={123} durationInFrames={327}><ProcessShot/><Audio src={staticFile('generated/singularity-visual/feedback.wav')} endAt={295}/></Sequence>
 </AbsoluteFill>;
