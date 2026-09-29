import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, colors} from './config';
import {sans} from './fonts';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Bitta sahna ("kadr"): kirishda xiralikdan ochiladi, oxirida tez kattalashib xiralashadi
 * (namunadagi kabi "motion blur" o'tish), orada kamera sekin yaqinlashadi.
 */
export const Shot: React.FC<{
  children: React.ReactNode;
  enter?: boolean;
  exit?: boolean;
  drift?: number;
}> = ({children, enter = true, exit = true, drift = 0.05}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const inT = enter ? interpolate(frame, [0, 6], [1, 0], clamp) : 0;
  const outT = exit ? interpolate(frame, [durationInFrames - 5, durationInFrames], [0, 1], clamp) : 0;
  const cam = 1 + (frame / durationInFrames) * drift;
  const scale = cam * (1 + inT * 0.08) * (1 + outT ** 2 * 0.12);
  const blur = inT * 22 + outT ** 2 * 26;
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const CreamBg: React.FC<{tint?: string}> = ({tint = colors.cream}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 80% 60% at 50% 45%, #FFFFFF 0%, ${tint} 55%, #ECE8E1 100%)`,
    }}
  />
);

export const DarkBg: React.FC<{glow?: number}> = ({glow = 0}) => (
  <AbsoluteFill
    style={{
      // Ostida qora rang bor: markazdagi yarim shaffof qizil nur orqa sahnani ko'rsatib qo'ymasligi uchun
      background: `radial-gradient(circle at 50% 50%, rgba(120,0,8,${0.35 * glow}) 0%, #050505 45%, #000 100%), #000`,
    }}
  />
);

/** Yozuv orqasidagi nozik to'r (chetlari so'nib boradi) */
export const Grid: React.FC<{size?: number; cell?: number; y?: number; opacity?: number}> = ({
  size = 620,
  cell = 62,
  y = 0,
  opacity = 0.13,
}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateY(${y}px)`}}>
    <div
      style={{
        width: size,
        height: size,
        opacity,
        backgroundImage: `linear-gradient(${colors.ink} 1.5px, transparent 1.5px), linear-gradient(90deg, ${colors.ink} 1.5px, transparent 1.5px)`,
        backgroundSize: `${cell}px ${cell}px`,
        backgroundPosition: 'center',
        maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
      }}
    />
  </AbsoluteFill>
);

/** Katta kulrang yoy (namunadagi fon chizig'i) — sekin aylanadi */
export const Arc: React.FC<{rotate?: number; speed?: number; opacity?: number}> = ({
  rotate = 0,
  speed = 0.12,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity}}>
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{transform: `rotate(${rotate + frame * speed}deg)`, transformOrigin: '50% 50%'}}
      >
        <defs>
          <linearGradient id="arcShade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#CFCCC7" />
            <stop offset="1" stopColor="#ADA9A3" />
          </linearGradient>
        </defs>
        <path
          d="M 120 -120 C 520 260, 760 620, 700 980 C 640 1340, 380 1620, 240 2080"
          fill="none"
          stroke="url(#arcShade)"
          strokeWidth={118}
          strokeLinecap="round"
        />
      </svg>
    </AbsoluteFill>
  );
};

/** Yuqoridagi kichik brend yozuvi (namunadagi "HD" belgisi o'rnida) */
export const TopMark: React.FC<{dark?: boolean; y?: number}> = ({dark = false, y = 110}) => (
  <div
    style={{
      position: 'absolute',
      top: y,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 14,
      fontFamily: sans,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '0.32em',
      color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(20,20,20,0.5)',
    }}
  >
    <span style={{width: 10, height: 10, borderRadius: 5, background: colors.red}} />
    {brand.name.toUpperCase()}
  </div>
);

/** Shtrix-kod bezagi */
export const Barcode: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const bars = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 4, 1, 2];
  return (
    <div style={{display: 'flex', gap: 3, height: 64, ...style}}>
      {bars.map((w, i) => (
        <div key={i} style={{width: w * 2.4, background: i % 2 ? 'transparent' : colors.ink}} />
      ))}
    </div>
  );
};

/** public/kinetik/ dagi emoji rasmi: prujina bilan "sakrab" chiqadi va sekin tebranadi */
export const Emoji: React.FC<{
  name: string;
  size: number;
  at?: number;
  x?: number;
  y?: number;
  rotate?: number;
  wobble?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({name, size, at = 0, x = 0, y = 0, rotate = 0, wobble = 3, shadow = true, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 11, stiffness: 180, mass: 0.7}});
  const sway = Math.sin((frame - at) / 9) * wobble;
  return (
    <Img
      src={staticFile(`kinetik/${name}.png`)}
      style={{
        position: 'absolute',
        left: 540 + x - size / 2,
        top: 960 + y - size / 2,
        width: size,
        height: size,
        objectFit: 'contain',
        opacity: Math.min(1, p * 2),
        transform: `scale(${p}) rotate(${rotate + sway + (1 - p) * -25}deg)`,
        filter: shadow ? 'drop-shadow(0 30px 40px rgba(0,0,0,0.22))' : undefined,
        ...style,
      }}
    />
  );
};

/** Doira bilan ochilish (namunadagi pushti/qora doira o'tishi) */
export const CircleReveal: React.FC<{
  children: React.ReactNode;
  duration?: number;
  x?: number;
  y?: number;
  ring?: string;
}> = ({children, duration = 12, x = 50, y = 50, ring}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], clamp);
  const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
  // 71% — ekranning burchaklarigacha yetadi
  const r = eased * 71;
  // clip-path foizi ekran diagonalining 1/√2 qismiga nisbatan hisoblanadi
  const px = (r / 100) * (Math.hypot(1080, 1920) / Math.SQRT2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: `circle(${r}% at ${x}% ${y}%)`}}>{children}</AbsoluteFill>
      {ring && t < 1 ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: px * 2,
              height: px * 2,
              marginLeft: -px,
              marginTop: -px,
              borderRadius: '50%',
              border: `${18 * (1 - t) + 4}px solid ${ring}`,
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
