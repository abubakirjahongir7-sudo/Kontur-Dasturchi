import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../theme';
import {useLayout} from '../layout';

const RINGS = 14;
const POINTS = 96;

/** Topografik xarita uslubidagi "kontur" chiziqlari — brend nomiga ishora */
const contourPath = (
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  seed: number,
) => {
  let d = '';
  for (let i = 0; i <= POINTS; i++) {
    const t = (i / POINTS) * Math.PI * 2;
    const r =
      radius +
      radius * 0.09 * Math.sin(3 * t + phase + seed) +
      radius * 0.05 * Math.sin(5 * t - phase * 1.3 + seed * 2) +
      radius * 0.03 * Math.sin(8 * t + phase * 0.7);
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t) * 0.82;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d + 'Z';
};

export const Background: React.FC<{glow?: [string, string]}> = ({
  glow = [colors.violet, colors.cyan],
}) => {
  const frame = useCurrentFrame();
  const {width, height, vertical} = useLayout();
  const phase = frame / 45;

  const cx = width * (vertical ? 0.78 : 0.82);
  const cy = height * (vertical ? 0.22 : 0.3);
  const maxR = Math.max(width, height) * 0.95;

  const rings = useMemo(
    () => Array.from({length: RINGS}, (_, i) => ((i + 1) / RINGS) * maxR),
    [maxR],
  );

  const drift = Math.sin(frame / 60) * 40;

  return (
    <AbsoluteFill style={{backgroundColor: colors.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${30 + drift / 8}% ${75 - drift / 10}%, ${glow[0]}33, transparent 45%),
            radial-gradient(circle at ${80 - drift / 10}% ${20 + drift / 8}%, ${glow[1]}2b, transparent 40%)`,
        }}
      />
      <svg width={width} height={height} style={{position: 'absolute'}}>
        {rings.map((r, i) => (
          <path
            key={i}
            d={contourPath(cx, cy, r, phase + i * 0.15, i * 0.7)}
            fill="none"
            stroke="white"
            strokeOpacity={0.035 + (i % 4 === 0 ? 0.03 : 0)}
            strokeWidth={i % 4 === 0 ? 2 : 1.2}
          />
        ))}
      </svg>
      {/* Chekkalarni qoraytirish */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
