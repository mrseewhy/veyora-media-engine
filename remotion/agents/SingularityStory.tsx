import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import episode from '../../episodes/toolpilot/singularity-explained/script.json';
import shotPlan from '../../episodes/toolpilot/singularity-explained/shot-list.json';
import {ActionIllustration} from './ActionIllustrations';

const paper = '#f4efe5';
const palettes = [
  {accent: '#f18b42', background: '#222526'},
  {accent: '#d7503b', background: '#d3c6ac'},
  {accent: '#a2df74', background: '#263631'},
  {accent: '#2b796e', background: '#334c48'},
  {accent: '#f0ad70', background: '#1c2029'},
  {accent: '#b84e3e', background: '#3b342b'},
];

export const SingularityStory: React.FC<{segmentIndex: number; duration: number}> = ({segmentIndex, duration}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const compact = width / height < 1.5;
  const segment = episode.segments[segmentIndex];
  const shots = shotPlan.shots.filter(shot => shot.actId === segment.id);
  const start = shots[0].startFrame;
  const shot = shots.find(item => frame >= item.startFrame - start && frame < item.endFrame - start) ?? shots[shots.length - 1];
  const local = frame - (shot.startFrame - start);
  const palette = palettes[segmentIndex];
  const sentences = segment.text.match(/[^.!?]+[.!?]+[’'”\"]?/g)?.map(s => s.trim()) ?? [];
  const caption = sentences[Math.min(sentences.length - 1, Math.floor(frame / duration * sentences.length))] ?? '';
  const photo = shot.subject === 'post' || shot.subject === 'speaker';
  return <AbsoluteFill style={{backgroundColor: palette.background, color: paper, fontFamily: 'Inter, Arial, sans-serif', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${30 + 40 * (local / Math.max(1, shot.endFrame - shot.startFrame))}% 45%, ${palette.accent}28, transparent 55%)`}} />
    <div style={{position: 'absolute', left: compact ? '2%' : '8%', top: compact ? '16%' : '7%', width: compact ? '96%' : '84%', height: compact ? '61%' : '78%', transform: `translateX(${Math.sin(local / 22) * 8}px)`}}>
      <ActionIllustration kind={shot.subject} shotId={shot.shotId} t={local} duration={shot.endFrame - shot.startFrame} compact={compact} accent={palette.accent} />
    </div>
    {!photo && <div style={{position: 'absolute', left: compact ? '7%' : '8%', top: compact ? '8%' : '7%', fontSize: compact ? 20 : 24, letterSpacing: 3, fontWeight: 800, color: palette.accent}}>{segment.label}</div>}
    <div style={{position: 'absolute', left: compact ? '7%' : '15%', right: compact ? '7%' : '15%', bottom: compact ? '8%' : '6%', minHeight: compact ? 95 : 75, padding: compact ? '18px 20px' : '14px 25px', background: '#080b0de8', color: paper, borderRadius: 10, fontSize: compact ? 31 : 36, fontWeight: 650, textAlign: 'center', display: 'grid', placeItems: 'center', lineHeight: 1.15}}>{caption}</div>
  </AbsoluteFill>;
};
