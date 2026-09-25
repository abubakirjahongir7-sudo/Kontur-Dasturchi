import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';

export const Chip: React.FC<{
  label: string;
  delay: number;
  accent: string;
  u: number;
}> = ({label, delay, accent, u}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: {damping: 10, stiffness: 180, mass: 0.6},
  });

  return (
    <div
      style={{
        transform: `scale(${p})`,
        opacity: Math.min(1, p * 1.5),
        padding: `${14 * u}px ${26 * u}px`,
        borderRadius: 999,
        border: `${2 * u}px solid ${accent}88`,
        background: `${accent}1f`,
        color: 'white',
        fontFamily: fonts.body,
        fontWeight: 600,
        fontSize: 30 * u,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 12 * u,
      }}
    >
      <div style={{width: 12 * u, height: 12 * u, borderRadius: 99, background: accent}} />
      {label}
    </div>
  );
};
