import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FontLoader} from '../fonts';
import {ToolPilotIntro, TOOLPILOT_INTRO_FRAMES} from './ToolPilotIntro';
import {ToolPilotOutro, TOOLPILOT_OUTRO_FRAMES} from './ToolPilotOutro';
import episode from '../../episodes/toolpilot/singularity-explained/script.json';
import {SingularityStory} from './SingularityStory';

export type SingularityProps = {segmentFrames: number[]};
export const defaultSingularityProps: SingularityProps = {segmentFrames: [540, 540, 540, 540, 540, 540]};
const cyan = '#11e2ed';
const blue = '#5e82ff';
const white = '#f7fbff';
const muted = '#9aaccb';
const ease = (n: number) => 1 - (1 - n) ** 3;
const progress = (frame: number, start: number, duration: number) => ease(Math.max(0, Math.min(1, (frame - start) / duration)));

const Ring: React.FC<{size: number; color: string; opacity?: number}> = ({size, color, opacity = 1}) => <div style={{width: size, height: size, borderRadius: '50%', border: `3px solid ${color}`, boxShadow: `0 0 30px ${color}55`, opacity}} />;

const Illustration: React.FC<{index: number; frame: number; width: number; height: number}> = ({index, frame, width, height}) => {
  const compact = width / height < 1.5;
  const square = compact && height <= width;
  const unit = compact ? width / 1080 : width / 1920;
  const boxWidth = compact ? width * 0.84 : width * 0.47;
  const boxHeight = compact ? Math.min(580 * unit, height * (square ? 0.37 : 0.33)) : 570 * unit;
  const left = compact ? (width - boxWidth) / 2 : width * 0.49;
  const top = compact ? height * (square ? 0.39 : 0.34) : (height - boxHeight) / 2;
  const enter = progress(frame, 5, 38);
  const common: React.CSSProperties = {position: 'absolute', left, top, width: boxWidth, height: boxHeight, opacity: enter, transform: `translateY(${(1 - enter) * 55 * unit}px) scale(${square ? 0.78 : 1})`};
  if (index === 0) return <div style={{...common, display: 'grid', placeItems: 'center'}}><div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: (compact ? 74 : 92) * unit, lineHeight: 1.1, color: white, textAlign: 'center', textShadow: `0 0 ${45 * unit}px #2f75ff88`}}>“WE HAVE<br/>ENTERED THE<br/><span style={{color: cyan}}>SINGULARITY.”</span></div><div style={{position: 'absolute', bottom: 0, fontFamily: 'Inter', fontSize: 23 * unit, letterSpacing: 2 * unit, color: muted}}>ELON MUSK · JANUARY 2026</div></div>;
  if (index === 1) return <div style={{...common, display: 'grid', placeItems: 'center'}}>{[0, 1, 2, 3].map((n) => {const size = (190 + n * 90) * unit; return <div key={n} style={{position: 'absolute', left: boxWidth / 2 - size / 2, top: boxHeight / 2 - size / 2, transform: `scale(${0.7 + enter * 0.3})`}}><Ring size={size} color={n % 2 ? blue : cyan} opacity={0.7 - n * 0.13}/></div>})}<div style={{position: 'relative', width: 150 * unit, height: 150 * unit, borderRadius: '50%', background: '#030612', boxShadow: '0 0 80px #5e82ff99, inset 0 0 30px #194e7c', display: 'grid', placeItems: 'center', color: white, fontFamily: 'Inter', fontWeight: 800, fontSize: 35 * unit}}>?</div></div>;
  if (index === 2) return <div style={{...common, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 13 * unit}}>{[1, 2, 3].map((n) => <React.Fragment key={n}><div style={{width: 150 * unit, height: (130 + n * 38) * unit, borderRadius: 24 * unit, border: `2px solid ${n === 3 ? cyan : blue}`, background: '#101d49', boxShadow: `0 0 ${25 * unit}px ${n === 3 ? '#11e2ed55' : '#5e82ff55'}`, display: 'grid', placeItems: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: 48 * unit, color: white, transform: `scale(${0.75 + progress(frame, n * 15, 28) * 0.25})`}}>AI<small style={{fontSize: 22 * unit, color: cyan}}> {n}</small></div>{n < 3 && <span style={{fontSize: 55 * unit, color: cyan}}>→</span>}</React.Fragment>)}</div>;
  if (index === 3) return <div style={{...common, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 * unit, alignContent: 'center'}}>{[['⌘', 'CODE'], ['◉', 'IMAGES'], ['◎', 'SEARCH'], ['✦', 'RESEARCH']].map(([symbol, label], n) => <div key={label} style={{height: 145 * unit, borderRadius: 22 * unit, border: '2px solid #6485db88', background: '#101d49', display: 'flex', alignItems: 'center', gap: 25 * unit, padding: 24 * unit, opacity: progress(frame, n * 11, 22)}}><span style={{fontSize: 60 * unit, color: cyan}}>{symbol}</span><span style={{fontFamily: 'Inter', fontSize: 26 * unit, fontWeight: 800, color: white}}>{label}</span></div>)}</div>;
  if (index === 4) return <div style={{...common, display: 'grid', placeItems: 'center'}}><div style={{position: 'absolute', width: (square ? 420 : 500) * unit, height: (square ? 420 : 500) * unit, borderRadius: '50%', background: 'conic-gradient(from 0deg, #11e2ed00, #4a5bff, #11e2ed00 65%, #11e2ed)', filter: `blur(${18 * unit}px)`, opacity: 0.65}}/><div style={{position: 'relative', width: (square ? 300 : 360) * unit, height: (square ? 300 : 360) * unit, borderRadius: '50%', background: '#01030b', boxShadow: '0 0 0 15px #88aaff33, 0 0 100px #616bff77'}}/><div style={{position: 'absolute', bottom: 0, fontFamily: 'Inter', fontSize: 26 * unit, color: muted, letterSpacing: 2 * unit}}>BEYOND THE EVENT HORIZON?</div></div>;
  return <div style={{...common, display: 'grid', alignContent: 'center', gap: 24 * unit}}>{[['01', 'SELF IMPROVEMENT'], ['02', 'RELIABLE VALIDATION'], ['03', 'HUMAN OVERSIGHT']].map(([n, label], i) => <div key={n} style={{display: 'flex', alignItems: 'center', gap: 28 * unit, padding: 25 * unit, borderRadius: 19 * unit, border: '2px solid #5e82ff88', background: '#101d49', opacity: progress(frame, i * 14, 25)}}><span style={{fontFamily: 'Inter', fontSize: 31 * unit, fontWeight: 800, color: cyan}}>{n}</span><span style={{fontFamily: 'Inter', fontSize: 27 * unit, fontWeight: 750, color: white}}>{label}</span></div>)}</div>;
};

const ContentScene: React.FC<{index: number; duration: number}> = ({index, duration}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const compact = width / height < 1.5;
  const unit = compact ? width / 1080 : width / 1920;
  const segment = episode.segments[index];
  const sentences = segment.text.match(/[^.!?]+[.!?]+[’'”"]?/g)?.map((s) => s.trim()) ?? [segment.text];
  const weights = sentences.map((s) => s.split(/\s+/).length);
  const totalWords = weights.reduce((a, b) => a + b, 0);
  let used = 0;
  const cues = sentences.map((text, n) => {const start = used; used += n === sentences.length - 1 ? duration - used : Math.round(duration * weights[n] / totalWords); return {text, start, end: used};});
  const active = cues.find((cue) => frame >= cue.start && frame < cue.end);
  const fade = Math.min(progress(frame, 0, 15), progress(duration - frame, 0, 12));
  const x = compact ? width * 0.09 : width * 0.075;
  const y = compact ? height * 0.17 : height * 0.22;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 60% 55%, #13224b, #071027 54%, #030612 90%)', overflow: 'hidden', opacity: fade}}>
    <FontLoader />
    <div style={{position: 'absolute', left: x, top: y, maxWidth: compact ? width * 0.82 : width * 0.42}}>
      <div style={{fontFamily: 'Inter', fontSize: (compact ? 25 : 27) * unit, fontWeight: 750, letterSpacing: 4 * unit, color: cyan, marginBottom: 28 * unit}}>{segment.label}</div>
      <div style={{fontFamily: 'Inter', fontSize: (compact ? 75 : 89) * unit, fontWeight: 820, lineHeight: 1.04, letterSpacing: -4 * unit, color: white, textWrap: 'balance'}}>{segment.headline}</div>
      <div style={{width: 160 * unit, height: 4 * unit, marginTop: 38 * unit, background: `linear-gradient(90deg, ${cyan}, ${blue})`}} />
    </div>
    <Illustration index={index} frame={frame} width={width} height={height} />
    {active && <div style={{position: 'absolute', left: compact ? width * 0.08 : width * 0.14, right: compact ? width * 0.08 : width * 0.14, bottom: compact ? height * 0.12 : height * 0.09, minHeight: (compact ? 95 : 75) * unit, display: 'grid', placeItems: 'center', padding: `${16 * unit}px ${28 * unit}px`, borderRadius: 18 * unit, background: '#030817e8', border: '1px solid #89a9ef55', color: white, fontFamily: 'Inter', fontWeight: 650, fontSize: (compact ? 31 : 37) * unit, lineHeight: 1.2, textAlign: 'center', boxShadow: '0 16px 55px #0008'}}>{active.text}</div>}
  </AbsoluteFill>;
};

export const SingularityEpisode: React.FC<SingularityProps> = ({segmentFrames}) => {
  let cursor = TOOLPILOT_INTRO_FRAMES;
  return <AbsoluteFill style={{backgroundColor: '#030612'}}>
    <Sequence from={0} durationInFrames={TOOLPILOT_INTRO_FRAMES}><ToolPilotIntro /></Sequence>
    <Sequence from={TOOLPILOT_INTRO_FRAMES} durationInFrames={segmentFrames.reduce((a,b)=>a+b,0)}><Audio src={staticFile('generated/singularity-explained/soundscape.wav')} volume={0.35} /></Sequence>
    {episode.segments.map((segment, index) => {
      const start = cursor;
      const duration = segmentFrames[index];
      cursor += duration;
      return <Sequence key={segment.id} from={start} durationInFrames={duration} name={segment.id}>
        <SingularityStory segmentIndex={index} duration={duration} />
        <Audio src={staticFile(`generated/singularity-explained/${segment.id}.wav`)} />
      </Sequence>;
    })}
    <Sequence from={cursor} durationInFrames={TOOLPILOT_OUTRO_FRAMES}><ToolPilotOutro /></Sequence>
  </AbsoluteFill>;
};
