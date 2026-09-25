import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HEIGHT, WIDTH, colors} from '../config';

type Curve = {
  from: [number, number];
  c1: [number, number];
  c2: [number, number];
  to: [number, number];
  speed: number;
  phase: number;
};

// Landingdagi kabi katta, yumshoq nurli egri chiziqlar
const curves: Curve[] = [
  {from: [-250, 1560], c1: [260, 1080], c2: [760, 1560], to: [1330, 860], speed: 0.9, phase: 0},
  {from: [-250, 760], c1: [380, 300], c2: [820, 980], to: [1330, 520], speed: 0.7, phase: 1.7},
  {from: [120, 2150], c1: [480, 1480], c2: [880, 1300], to: [1330, 1380], speed: 1.1, phase: 3.1},
  {from: [-150, 260], c1: [320, 620], c2: [720, 60], to: [1250, -120], speed: 0.8, phase: 4.4},
  {from: [-250, 1230], c1: [420, 930], c2: [640, 1360], to: [1330, 1120], speed: 1.0, phase: 2.3},
];

const path = (c: Curve, t: number) => {
  const wobble = (i: number) => Math.sin(t * c.speed + c.phase + i) * 60;
  return `M ${c.from[0]} ${c.from[1]} C ${c.c1[0] + wobble(0)} ${c.c1[1] + wobble(1)}, ${
    c.c2[0] + wobble(2)
  } ${c.c2[1] + wobble(3)}, ${c.to[0]} ${c.to[1]}`;
};

export const OrangeBackground: React.FC<{energy?: number}> = ({energy = 0}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, ${colors.orange} 0%, #D4561A 45%, ${colors.orangeDeep} 100%)`,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${75 + Math.sin(t * 0.6) * 6}% ${
            55 + Math.cos(t * 0.5) * 5
          }%, rgba(255, 196, 120, ${0.35 + energy * 0.35}), transparent 55%)`,
        }}
      />
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute'}}>
        <defs>
          <filter id="bg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <linearGradient id="bg-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFE3B0" stopOpacity="0" />
            <stop offset="45%" stopColor="#FFE3B0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Keng, xira nur */}
        <g filter="url(#bg-glow)" opacity={0.55 + energy * 0.3}>
          {curves.map((c, i) => (
            <path key={i} d={path(c, t)} fill="none" stroke="#FFD08A" strokeWidth={46} strokeOpacity={0.35} />
          ))}
        </g>
        {/* Ingichka yorqin chiziq */}
        {curves.map((c, i) => (
          <path
            key={i}
            d={path(c, t)}
            fill="none"
            stroke="url(#bg-line)"
            strokeWidth={2.5}
            strokeOpacity={0.55}
          />
        ))}
        {/* Chiziq bo'ylab yugurib o'tuvchi yorug'lik */}
        {curves.map((c, i) => (
          <path
            key={i}
            d={path(c, t)}
            fill="none"
            stroke="white"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="220 2600"
            strokeDashoffset={-((frame * 22 + i * 700) % 2820)}
            strokeOpacity={0.75}
            filter="url(#bg-glow)"
          />
        ))}
      </svg>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(60, 18, 2, 0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
