import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Flash} from '../components/Flash';
import {HOOK_FLASH, HOOK_WORDS, colors, hook} from '../config';
import {hitGlow, punch, shake, slamScale} from '../fx';
import {font} from '../theme';

const MAX_TEXT_WIDTH = 940;

/** So'z o'lchamini eng uzun qatoriga qarab tanlaydi */
const fontSizeFor = (lines: string[]) => {
  const longest = Math.max(...lines.map((l) => l.length));
  return Math.min(215, MAX_TEXT_WIDTH / (longest * 0.78));
};

const Word: React.FC<{text: string; start: number; end: number; last: boolean}> = ({
  text,
  start,
  end,
  last,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start || frame >= end) return null;

  const p = punch(frame, fps, start);
  const scale = slamScale(p, 3.4);
  const blur = interpolate(p, [0, 0.8], [18, 0], {extrapolateRight: 'clamp'});

  // Chiqish: keyingi so'zdan oldin kameraga qarab "uchib" ketadi
  const outFrames = last ? 8 : 4;
  const out = interpolate(frame, [end - outFrames, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const lines = text.split(' ');
  const size = fontSizeFor(lines);
  const glow = hitGlow(frame, start, 18);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          transform: `scale(${scale * (1 + out * 0.9)})`,
          opacity: Math.min(1, p * 2) * (1 - out),
          filter: `blur(${blur + out * 10}px)`,
          textAlign: 'center',
          fontFamily: font,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: -size * 0.02,
          color: colors.text,
          textShadow: `0 0 ${30 + glow * 40}px rgba(245,184,46,${0.75 + glow * 0.25}), 0 0 ${
            90 + glow * 80
          }px rgba(245,184,46,0.55), 0 8px 0 rgba(0,0,0,0.25)`,
        }}
      >
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const s = shake(frame, HOOK_WORDS, 34, 12);

  // Har zarbada orqadagi to'q sariq portlash
  const lastHit = [...HOOK_WORDS].reverse().find((h) => frame >= h);
  const burst = lastHit === undefined ? 0 : hitGlow(frame, lastHit, 22);
  const ringT = lastHit === undefined ? 1 : Math.min(1, (frame - lastHit) / 16);
  const revealed = frame >= HOOK_FLASH;

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {revealed ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(232,101,26,${
              0.45 + burst * 0.5
            }) 0%, rgba(184,66,12,${0.25 + burst * 0.3}) ${28 + burst * 14}%, ${colors.dark} 70%)`,
          }}
        />
      ) : null}
      {/* Zarba to'lqini (shockwave) */}
      {lastHit !== undefined && ringT < 1 ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              width: 200 + ringT * 1500,
              height: 200 + ringT * 1500,
              borderRadius: '50%',
              border: `${14 * (1 - ringT) + 2}px solid rgba(245,184,46,${0.8 * (1 - ringT)})`,
              boxShadow: `0 0 60px rgba(245,184,46,${0.6 * (1 - ringT)})`,
            }}
          />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg)`}}>
        {hook.words.map((word, i) => (
          <Word
            key={word}
            text={word}
            start={HOOK_WORDS[i]}
            end={HOOK_WORDS[i + 1] ?? durationInFrames}
            last={i === hook.words.length - 1}
          />
        ))}
      </AbsoluteFill>
      <Flash at={HOOK_FLASH} duration={10} />
      {HOOK_WORDS.map((h) => (
        <Flash key={h} at={h} duration={5} color="#FFE2A6" strength={0.35} />
      ))}
    </AbsoluteFill>
  );
};
