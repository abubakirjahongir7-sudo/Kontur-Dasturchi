import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, type Line, type Word} from './config';
import {sans} from './fonts';

const MAX_WIDTH = 940;
/** Taxminiy harf eni (em) — qatorni ekranga sig'dirish uchun */
const CHAR_EM = {accent: 0.6, normal: 0.54};

type Props = {
  lines: Line[];
  dark?: boolean;
  /** Oddiy so'zlar o'lchami (px) */
  size?: number;
  /** Kalit so'z oddiy so'zdan necha barobar katta */
  accentScale?: number;
  maxWidth?: number;
  /** Shu kadrdan boshlab yozuv xiralashib yo'qoladi */
  hideAt?: number;
  align?: 'center' | 'flex-start';
  style?: React.CSSProperties;
};

const wordSize = (w: Word, size: number, accentScale: number) => (w.a ? size * accentScale : size);

const lineWidth = (line: Line, size: number, accentScale: number) =>
  line.reduce(
    (sum, w) =>
      sum + w.t.length * wordSize(w, size, accentScale) * (w.a ? CHAR_EM.accent : CHAR_EM.normal) + size * 0.24,
    0,
  );

const KineticWord: React.FC<{w: Word; size: number; dark: boolean; hideAt?: number}> = ({
  w,
  size,
  dark,
  hideAt,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - w.at, fps, config: {damping: 16, stiffness: 210, mass: 0.6}});
  const out =
    hideAt === undefined
      ? 0
      : interpolate(frame, [hideAt, hideAt + 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const blur = Math.max(0, (1 - p) * 18) + out * 14;
  const glow = w.a
    ? dark
      ? `0 0 18px ${colors.redGlow}, 0 0 48px rgba(255,0,20,0.55)`
      : `0 6px 22px rgba(227,20,31,0.18)`
    : dark
      ? '0 0 16px rgba(255,255,255,0.35)'
      : undefined;

  const transform = w.a
    ? `translateY(${(1 - p) * 26}px) scale(${interpolate(p, [0, 1], [1.28, 1])})`
    : `translateX(${(1 - p) * 46}px)`;

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: size,
        fontWeight: w.a ? 800 : 560,
        letterSpacing: w.a ? '-0.055em' : '-0.04em',
        color: w.a ? colors.red : dark ? 'white' : colors.ink,
        textShadow: glow,
        opacity: Math.min(1, p * 1.8) * (1 - out),
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        transform: `${transform} scale(${1 + out * 0.15})`,
        transformOrigin: '50% 60%',
        whiteSpace: 'nowrap',
        // "-chi?" kabi qo'shimchalar oldingi so'zga yopishib turadi
        marginLeft: w.t.startsWith('-') ? -size * 0.24 : 0,
      }}
    >
      {w.t}
    </span>
  );
};

/** So'zma-so'z chiqadigan yozuv: oddiy so'zlar kichik, kalit so'zlar katta va qizil */
export const Words: React.FC<Props> = ({
  lines,
  dark = false,
  size = 66,
  accentScale = 1.9,
  maxWidth = MAX_WIDTH,
  hideAt,
  align = 'center',
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align,
        fontFamily: sans,
        lineHeight: 0.98,
        ...style,
      }}
    >
      {lines.map((line, i) => {
        // Qator sig'masa, butun qatorni kichraytiramiz
        const fit = Math.min(1, maxWidth / lineWidth(line, size, accentScale));
        const s = size * fit;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: s * 0.24,
              marginTop: i === 0 ? 0 : -s * 0.12,
            }}
          >
            {line.map((w) => (
              <KineticWord key={w.t + w.at} w={w} size={wordSize(w, s, accentScale)} dark={dark} hideAt={hideAt} />
            ))}
          </div>
        );
      })}
    </div>
  );
};
