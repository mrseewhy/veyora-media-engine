import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FontLoader} from '../fonts';

export const TOOLPILOT_OUTRO_FRAMES = 240;
export const TOOLPILOT_OUTRO_MOTION_FRAMES = 150;
const ease = (t: number) => 1 - (1 - t) ** 3;
const progress = (frame: number, start: number, length: number) => ease(Math.max(0, Math.min(1, (frame - start) / length)));

/** Version 1: animate for 150 frames, then hold exactly the same frame for 90. */
export const ToolPilotOutro: React.FC = () => {
  const frame = Math.min(useCurrentFrame(), TOOLPILOT_OUTRO_MOTION_FRAMES - 1);
  const {width, height} = useVideoConfig();
  const compact = width / height < 1.5;
  const unit = compact ? width / 1080 : width / 1920;
  const reveal = progress(frame, 12, 42);
  const title = progress(frame, 43, 32);
  const cta = progress(frame, 78, 32);
  const handle = progress(frame, 103, 28);
  const pulse = frame < 103 ? Math.sin(frame * 0.19) * Math.exp(-Math.max(0, frame - 25) / 38) : 0;
  const cardWidth = (compact ? 950 : 1380) * unit;
  const cardHeight = (compact ? 500 : 620) * unit;
  const left = width / 2 - cardWidth / 2;
  const top = height / 2 - cardHeight / 2;
  const logoSize = (compact ? 225 : 330) * unit;
  const logoLeft = left + (compact ? 42 : 75) * unit;
  const textLeft = left + (compact ? 305 : 460) * unit;
  return <AbsoluteFill style={{backgroundColor: '#030612', overflow: 'hidden'}}>
    <FontLoader />
    <Audio src={staticFile('generated/toolpilot-outro-v1.wav')} volume={0.72} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 43% 48%, #112154 0%, #071029 38%, #030612 77%)'}} />
    <AbsoluteFill style={{opacity: 0.3 + pulse * 0.08, background: 'radial-gradient(circle at 30% 48%, #00e5ff42 0%, transparent 32%), radial-gradient(circle at 72% 66%, #6759ff32 0%, transparent 35%)'}} />
    {[0, 1, 2].map((i) => {
      const p = progress(frame, 4 + i * 10, 52);
      const size = (270 + 160 * i) * unit;
      return <div key={i} style={{position: 'absolute', left: logoLeft + logoSize / 2 - size / 2, top: height / 2 - size / 2, width: size, height: size, border: `${2 * unit}px solid ${i ? '#5676ff' : '#10d9ef'}`, borderRadius: '50%', opacity: 0.35 * (1 - p), transform: `scale(${0.3 + p * 1.6})`}} />;
    })}
    <div style={{position: 'absolute', left, top, width: cardWidth, height: cardHeight, borderRadius: 42 * unit, border: `${unit}px solid #8bbcff33`, background: 'linear-gradient(115deg, #0b18389c, #0b1236a3 57%, #070c22c9)', boxShadow: '0 45px 150px #000a, inset 0 1px 0 #d5efff29', opacity: reveal, transform: `translateY(${(1 - reveal) * 52 * unit}px)`}} />
    <div style={{position: 'absolute', left: logoLeft, top: height / 2 - logoSize / 2, width: logoSize, height: logoSize, opacity: reveal, transform: `translateY(${(1 - reveal) * 95 * unit}px) scale(${0.7 + reveal * 0.3 + pulse * 0.015})`, mixBlendMode: 'screen'}}>
      <Img src={staticFile('generated/toolpilot-icon.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
    </div>
    <div style={{position: 'absolute', left: textLeft, top: top + (compact ? 105 : 123) * unit, width: (compact ? 600 : 840) * unit, overflow: 'hidden'}}>
      <div style={{fontFamily: 'Inter', fontSize: (compact ? 86 : 112) * unit, fontWeight: 780, letterSpacing: (compact ? -5 : -6) * unit, color: '#f6fbff', lineHeight: 1.1, opacity: title, transform: `translateX(${(1 - title) * -90 * unit}px)`}}>ToolPilot</div>
      <div style={{height: 3 * unit, width: (compact ? 570 : 730) * unit * title, marginTop: 20 * unit, background: 'linear-gradient(90deg, #07e9f4, #507bff 60%, transparent)'}} />
      <div style={{fontFamily: 'Inter', fontSize: (compact ? 35 : 46) * unit, fontWeight: 650, color: '#edf6ff', marginTop: (compact ? 38 : 43) * unit, opacity: cta, transform: `translateY(${(1 - cta) * 30 * unit}px)`, whiteSpace: 'nowrap'}}>Subscribe to <span style={{color: '#18e7f4'}}>@mytoolpilot</span></div>
      <div style={{fontFamily: 'Inter', fontSize: (compact ? 21 : 25) * unit, fontWeight: 500, color: '#9eb4d0', letterSpacing: (compact ? 1.3 : 1.8) * unit, marginTop: 28 * unit, opacity: handle}}>SMARTER TOOLS. BETTER WORK.</div>
    </div>
    <div style={{position: 'absolute', left: 84 * unit, right: 84 * unit, bottom: 65 * unit, height: unit, background: 'linear-gradient(90deg, transparent, #5c8fff4d, transparent)', opacity: reveal}} />
  </AbsoluteFill>;
};
