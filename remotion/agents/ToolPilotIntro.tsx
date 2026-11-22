import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FontLoader} from '../fonts';

export const TOOLPILOT_INTRO_FRAMES = 150;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const progress = (frame: number, start: number, length: number) => ease(Math.max(0, Math.min(1, (frame - start) / length)));

/** Version 1: five-second, voice-free ToolPilot brand signature. */
export const ToolPilotIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const compact = width / height < 1.5;
  const unit = compact ? width / 1080 : width / 1920;
  const reveal = progress(frame, 17, 34);
  const word = progress(frame, 48, 30);
  const settle = progress(frame, 83, 25);
  const exit = progress(frame, 135, 15);
  const pulse = Math.exp(-Math.max(0, frame - 24) / 24) * Math.sin(Math.max(0, frame - 24) * 0.3);
  const groupWidth = (compact ? 840 : 1270) * unit;
  const logoSize = (compact ? 230 : 330) * unit;
  const gap = (compact ? 26 : 50) * unit;
  const centerX = width / 2 - groupWidth / 2;
  const centerY = height / 2;
  const cardWidth = (compact ? 950 : 1390) * unit;
  const cardHeight = (compact ? 410 : 470) * unit;
  const cardLeft = width / 2 - cardWidth / 2;
  const opacity = 1 - exit;

  return <AbsoluteFill style={{backgroundColor: '#030612', overflow: 'hidden', opacity}}>
    <FontLoader />
    <Audio src={staticFile('generated/toolpilot-intro-v1.wav')} volume={0.72} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 42% 54%, #112154 0%, #071029 34%, #030612 72%)'}} />
    <AbsoluteFill style={{opacity: 0.26 + 0.1 * pulse, background: 'radial-gradient(circle at 29% 52%, #00e5ff44 0%, transparent 31%), radial-gradient(circle at 72% 62%, #6759ff33 0%, transparent 34%)'}} />
    {[0, 1, 2].map((i) => {
      const p = progress(frame, 4 + i * 9, 42);
      const size = (260 + i * 165) * unit;
      return <div key={i} style={{position: 'absolute', width: size, height: size, left: centerX + logoSize / 2 - size / 2, top: centerY - size / 2, border: `${2 * unit}px solid ${i === 0 ? '#10d9ef' : '#5676ff'}`, borderRadius: '50%', opacity: (1 - p) * 0.42, transform: `scale(${0.25 + p * 1.65})`}} />;
    })}
    <div style={{position: 'absolute', left: cardLeft, top: centerY - cardHeight / 2, width: cardWidth, height: cardHeight, border: `${unit}px solid #7bbaff24`, borderRadius: 38 * unit, background: 'linear-gradient(110deg, #07112d99, #0b103052 58%, #060b1b66)', boxShadow: '0 40px 140px #0009, inset 0 1px 0 #d5efff22', opacity: reveal, transform: `translateY(${(1 - reveal) * 36 * unit}px)`}} />
    <div style={{position: 'absolute', left: centerX, top: centerY - logoSize / 2, width: logoSize, height: logoSize, opacity: reveal, transform: `translateY(${(1 - reveal) * 110 * unit}px) scale(${0.62 + reveal * 0.38 + pulse * 0.025})`, mixBlendMode: 'screen'}}>
      <Img src={staticFile('generated/toolpilot-icon.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
    <div style={{position: 'absolute', left: centerX + logoSize + gap, top: centerY - (compact ? 86 : 111) * unit, width: (compact ? 570 : 750) * unit, height: (compact ? 200 : 250) * unit, overflow: 'hidden'}}>
      <div style={{fontFamily: 'Inter', fontSize: (compact ? 88 : 125) * unit, fontWeight: 780, letterSpacing: (compact ? -5 : -7) * unit, color: '#f6fbff', lineHeight: 1.1, opacity: word, transform: `translateX(${(1 - word) * -90 * unit}px)`, textShadow: '0 10px 50px #00bfff33'}}>ToolPilot</div>
      <div style={{width: ((compact ? 500 : 640) * word) * unit, height: 3 * unit, marginTop: (compact ? 12 : 17) * unit, background: 'linear-gradient(90deg, #07e9f4, #507bff 55%, #8d53ff00)'}} />
      <div style={{fontFamily: 'Inter', fontSize: (compact ? 22 : 31) * unit, fontWeight: 500, letterSpacing: (compact ? 2.3 : 3.4) * unit, color: '#a9bfdb', marginTop: (compact ? 19 : 25) * unit, opacity: settle, transform: `translateY(${(1 - settle) * 18 * unit}px)`}}>SMARTER TOOLS. BETTER WORK.</div>
    </div>
    <div style={{position: 'absolute', left: 84 * unit, right: 84 * unit, bottom: 65 * unit, height: unit, background: 'linear-gradient(90deg, transparent, #5c8fff4d, transparent)', opacity: reveal}} />
    <AbsoluteFill style={{pointerEvents: 'none', opacity: interpolate(frame, [0, 10, 18, 25], [0, 0.18, 0.04, 0], {extrapolateRight: 'clamp'}), background: '#a8faff'}} />
  </AbsoluteFill>;
};
