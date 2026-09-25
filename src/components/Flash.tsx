import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {hitGlow} from '../fx';

/** Oq chaqnash: `at` kadrda to'liq oq, keyin tez so'nadi */
export const Flash: React.FC<{at: number; duration?: number; color?: string; strength?: number}> = ({
  at,
  duration = 10,
  color = 'white',
  strength = 1,
}) => {
  const frame = useCurrentFrame();
  const o = hitGlow(frame, at, duration) ** 1.5 * strength;
  if (o <= 0) return null;
  return <AbsoluteFill style={{backgroundColor: color, opacity: o, pointerEvents: 'none'}} />;
};
