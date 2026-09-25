import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

/** Har bir so'z pastdan "niqob" ichidan chiqib keladi */
export const RevealWords: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  align?: 'left' | 'center';
}> = ({text, delay = 0, stagger = 3, style, align = 'left'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: '0.28em',
        ...style,
      }}
    >
      {words.map((word, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: {damping: 18, stiffness: 140, mass: 0.8},
        });
        return (
          <span
            key={i}
            style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em'}}
          >
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 110}%)`,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};
