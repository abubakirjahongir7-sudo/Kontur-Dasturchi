import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Project} from '../config';
import {asset} from '../assets';
import {useImageSize} from '../useImageSize';

export const PHONE_W = 560;
export const PHONE_H = 1120;
const BEZEL = 16;
const BORDER = 3;
const SCREEN_W = PHONE_W - (BEZEL + BORDER) * 2;
const SCREEN_H = PHONE_H - (BEZEL + BORDER) * 2;

/** Loyiha skrinshoti: sekin yaqinlashadi, uzun bo'lsa pastga skroll qilinadi */
const Screenshot: React.FC<{src: string; project: Project}> = ({src, project}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const size = useImageSize(src);
  const progress = interpolate(frame, [6, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (project.fit === 'width' && size) {
    const h = SCREEN_W * (size.height / size.width);
    const scroll = h > SCREEN_H ? -(h - SCREEN_H) * progress : (SCREEN_H - h) / 2;
    return (
      <AbsoluteFill style={{backgroundColor: project.screenBg ?? '#000'}}>
        <Img
          src={src}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: SCREEN_W,
            height: h,
            transform: `translateY(${scroll}px) scale(${1 + progress * 0.04})`,
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <Img
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${1.12 - progress * 0.1})`,
      }}
    />
  );
};

/** Telefon maketi. Rasm bo'lmasa `fallback` ko'rsatiladi */
export const Phone: React.FC<{project: Project; fallback: React.ReactNode}> = ({
  project,
  fallback,
}) => {
  const frame = useCurrentFrame();
  const src = asset(project.image);

  // Ekran ustidan o'tadigan yaltiroq nur
  const glare = interpolate(frame, [8, 30], [-60, 160], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        padding: BEZEL,
        borderRadius: 78,
        background: 'linear-gradient(145deg, #3A1A0A, #0D0502 45%, #2A1206)',
        border: `${BORDER}px solid rgba(255, 220, 170, 0.35)`,
        boxShadow:
          '0 50px 110px rgba(40, 10, 0, 0.6), 0 0 120px rgba(245, 184, 46, 0.35), inset 0 0 0 2px rgba(0,0,0,0.6)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 62,
          overflow: 'hidden',
          background: '#000',
        }}
      >
        {src ? <Screenshot src={src} project={project} /> : fallback}
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 150,
            height: 42,
            borderRadius: 999,
            background: '#000',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${glare}%`,
            width: '45%',
            background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.35), transparent)',
            transform: 'skewX(-12deg)',
          }}
        />
      </div>
    </div>
  );
};
