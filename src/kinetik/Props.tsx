import React from 'react';
import {Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {asset} from '../assets';
import {brand, colors, type CardIcon} from './config';
import {sans} from './fonts';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- Kostyumli odam (rastr nuqtali uslub) ----------

/** Namunadagi kabi rastr (halftone) nuqtalardan chizilgan kostyumli odam. Boshi — alohida oq doira. */
export const SuitFigure: React.FC<{width?: number}> = ({width = 760}) => (
  <svg width={width} height={width * (900 / 700)} viewBox="0 0 700 900">
    <defs>
      <pattern id="dots" width={13} height={13} patternUnits="userSpaceOnUse">
        <circle cx={6.5} cy={6.5} r={4.3} fill="white" />
      </pattern>
      <pattern id="dotsFine" width={9} height={9} patternUnits="userSpaceOnUse">
        <circle cx={4.5} cy={4.5} r={2.6} fill="white" />
      </pattern>
      <radialGradient id="jacketShade" cx="0.5" cy="0.18" r="0.85">
        <stop offset="0" stopColor="white" stopOpacity={0.95} />
        <stop offset="0.45" stopColor="white" stopOpacity={0.55} />
        <stop offset="0.85" stopColor="white" stopOpacity={0.12} />
        <stop offset="1" stopColor="white" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.55" stopColor="white" />
        <stop offset="1" stopColor="black" />
      </linearGradient>
      <mask id="jacketMask">
        <rect width={700} height={900} fill="url(#jacketShade)" />
      </mask>
      <mask id="fadeMask">
        <rect width={700} height={900} fill="url(#fadeDown)" />
      </mask>
    </defs>

    <g mask="url(#fadeMask)">
      {/* Pidjak */}
      <path
        d="M 262 150 L 438 150 C 520 168, 575 185, 606 232 C 646 300, 652 520, 644 900 L 56 900 C 48 520, 54 300, 94 232 C 125 185, 180 168, 262 150 Z"
        fill="url(#dots)"
        mask="url(#jacketMask)"
      />
      {/* Latskanlar chizig'i */}
      <path d="M 282 150 L 236 262 L 350 392" fill="none" stroke="black" strokeWidth={12} strokeLinejoin="round" />
      <path d="M 418 150 L 464 262 L 350 392" fill="none" stroke="black" strokeWidth={12} strokeLinejoin="round" />
      {/* Oq ko'ylak */}
      <path d="M 290 150 L 410 150 L 350 370 Z" fill="white" />
      {/* Galstuk */}
      <path d="M 331 158 L 369 158 L 362 196 L 338 196 Z" fill="#111" />
      <path d="M 338 196 L 362 196 L 380 330 L 350 370 L 320 330 Z" fill="#111" />
      <path d="M 338 196 L 362 196 L 380 330 L 350 370 L 320 330 Z" fill="url(#dotsFine)" opacity={0.85} />
      {/* Qo'l qovushtirilgan */}
      <rect x={96} y={540} width={508} height={150} rx={75} fill="black" />
      <rect x={104} y={548} width={492} height={134} rx={67} fill="url(#dots)" opacity={0.5} />
      <path d="M 150 560 C 200 520, 270 540, 300 590 C 280 630, 200 640, 150 610 Z" fill="url(#dotsFine)" />
      <path d="M 560 600 C 520 560, 440 560, 410 610 C 440 650, 510 660, 560 630 Z" fill="url(#dotsFine)" />
    </g>
  </svg>
);

// ---------- Klaviatura ----------

const ROWS = [
  ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
  ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", '↵'],
  ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', '↑', 'Shift'],
  ['Ctrl', 'Alt', '', '', '', '', 'Alt', '←', '↓', '→'],
];
const KEY = 74;
const GAP = 10;

const TYPE_STEP = 3;

/** Shu kadrda qaysi tugma bosilgan (har 3 kadrda tasodifiy harf tugmasi) */
const pressedKey = (step: number) => {
  const row = 2 + Math.floor(random(`kr${step}`) * 3);
  return {row, col: 1 + Math.floor(random(`kc${step}`) * 10)};
};

/** Qora mexanik klaviatura (qiya holatda); `typing` — tugmalar yozayotgandek bosiladi */
export const Keyboard: React.FC<{typing?: boolean}> = ({typing = false}) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / TYPE_STEP);
  const hit = typing ? pressedKey(step) : null;
  const down = typing ? 1 - (frame % TYPE_STEP) / TYPE_STEP : 0;
  return (
    <div
      style={{
        position: 'relative',
        padding: 28,
        borderRadius: 34,
        background: 'linear-gradient(160deg, #2B2C31, #141518)',
        boxShadow: '0 60px 80px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.12)',
        display: 'flex',
        flexDirection: 'column',
        gap: GAP,
      }}
    >
      {ROWS.map((row, r) => (
        <div key={r} style={{display: 'flex', gap: GAP}}>
          {row.map((k, i) => {
            const wide = k === '' && i === 2 ? 5 : k === '' ? 0 : ['Tab', 'Caps', 'Shift', 'Ctrl'].includes(k) ? 1.45 : 1;
            if (wide === 0) return null;
            const pressed = hit && hit.row === r && hit.col === i ? down : 0;
            const w = KEY * wide + GAP * (wide > 1 ? Math.floor(wide) - 1 : 0);
            return (
              <div
                key={i}
                style={{
                  width: w,
                  height: KEY,
                  borderRadius: 12,
                  background: 'linear-gradient(180deg, #3A3B41, #25262B)',
                  boxShadow: `0 ${6 - pressed * 4}px 0 #0C0C0E, inset 0 1.5px 0 rgba(255,255,255,0.14)`,
                  transform: `translateY(${pressed * 4}px)`,
                  color: 'rgba(255,255,255,0.72)',
                  fontFamily: sans,
                  fontSize: k.length > 2 ? 17 : 24,
                  fontWeight: 600,
                  padding: '10px 12px',
                  boxSizing: 'border-box',
                }}
              >
                {k}
              </div>
            );
          })}
        </div>
      ))}
      {/* Yopishqoq lenta */}
      <div
        style={{
          position: 'absolute',
          left: -40,
          bottom: 60,
          width: 170,
          height: 70,
          background: 'linear-gradient(90deg, rgba(214,178,120,0.92), rgba(196,158,98,0.92))',
          transform: 'rotate(-38deg)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        }}
      />
    </div>
  );
};

// ---------- Qadalgan kartochka ----------

const CardGlyph: React.FC<{icon: CardIcon; size: number}> = ({icon, size}) => {
  const s = {fill: 'none', stroke: '#1B1B1B', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {icon === 'eye' ? (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" {...s} />
          <circle cx={12} cy={12} r={3} {...s} />
        </>
      ) : icon === 'users' ? (
        <>
          <circle cx={9} cy={8} r={3.6} {...s} />
          <path d="M2.5 20c.6-3.8 3.2-6 6.5-6s5.9 2.2 6.5 6" {...s} />
          <path d="M16 4.6a3.6 3.6 0 0 1 0 6.8M18.5 14.4c1.7.8 2.8 2.7 3 5.6" {...s} />
        </>
      ) : (
        <>
          <rect x={2.5} y={6} width={19} height={12} rx={2} {...s} />
          <circle cx={12} cy={12} r={2.8} {...s} />
          <path d="M6 9.5v5M18 9.5v5" {...s} />
        </>
      )}
      <path d="M3 3l18 18" {...s} stroke={colors.red} strokeWidth={2.8} />
    </svg>
  );
};

export const PinnedCard: React.FC<{
  title: string;
  titleAt: number;
  enter: number;
  items: {icon: CardIcon; t: string; at: number}[];
}> = ({title, titleAt, enter, items}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame: frame - enter, fps, config: {damping: 12, stiffness: 150, mass: 0.8}});
  const pin = spring({frame: frame - enter - 6, fps, config: {damping: 9, stiffness: 260, mass: 0.5}});
  const swing = Math.sin((frame - enter) / 7) * 2.2 * Math.max(0, 1 - (frame - enter) / 50);
  const titleP = spring({frame: frame - titleAt, fps, config: {damping: 16, stiffness: 220}});

  return (
    <div
      style={{
        position: 'relative',
        width: 600,
        padding: '70px 50px 60px',
        boxSizing: 'border-box',
        background: 'linear-gradient(170deg, #9A9894, #85837F)',
        boxShadow: '0 40px 70px rgba(0,0,0,0.28), 0 6px 14px rgba(0,0,0,0.18)',
        transform: `translateY(${(1 - drop) * -700}px) rotate(${(1 - drop) * 12 + swing}deg)`,
        transformOrigin: '50% 0%',
        fontFamily: sans,
      }}
    >
      <Img
        src={staticFile('kinetik/pin.png')}
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          left: 240,
          top: -60,
          transform: `translateY(${(1 - pin) * -60}px) scale(${interpolate(pin, [0, 1], [1.4, 1])}) rotate(-20deg)`,
          opacity: Math.min(1, pin * 3),
          filter: 'drop-shadow(6px 14px 8px rgba(0,0,0,0.3))',
        }}
      />
      <div
        style={{
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: '-0.05em',
          color: 'white',
          textAlign: 'center',
          opacity: titleP,
          transform: `scale(${interpolate(titleP, [0, 1], [1.2, 1])})`,
          filter: titleP < 0.95 ? `blur(${(1 - titleP) * 12}px)` : undefined,
        }}
      >
        {title}
      </div>
      <div style={{height: 6, borderRadius: 3, background: '#2A2A2A', margin: '18px 10px 30px', opacity: titleP}} />
      {items.map((it) => {
        const p = spring({frame: frame - it.at, fps, config: {damping: 16, stiffness: 220}});
        return (
          <div
            key={it.t}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              marginTop: 20,
              fontSize: 52,
              fontWeight: 600,
              letterSpacing: '-0.04em',
              color: 'white',
              opacity: Math.min(1, p * 1.8),
              transform: `translateX(${(1 - p) * 50}px)`,
              filter: p < 0.95 ? `blur(${(1 - p) * 12}px)` : undefined,
            }}
          >
            <CardGlyph icon={it.icon} size={56} />
            {it.t}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Instagram profil kartochkasi ----------

const IG_GRADIENT = 'linear-gradient(45deg, #F58529, #DD2A7B 45%, #8134AF 75%, #515BD4)';

const Icon: React.FC<{d: string; size?: number}> = ({d, size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke="white" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ProfileCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const avatarSrc = asset(brand.avatar);
  const p = spring({frame, fps, config: {damping: 15, stiffness: 140, mass: 0.8}});
  const sweep = interpolate(frame, [10, 40], [-40, 140], clamp);

  return (
    <div
      style={{
        position: 'relative',
        width: 920,
        padding: '38px 42px 42px',
        boxSizing: 'border-box',
        borderRadius: 42,
        overflow: 'hidden',
        background: 'linear-gradient(170deg, rgba(58,60,68,0.96), rgba(28,29,34,0.96))',
        border: '1.5px solid rgba(255,255,255,0.14)',
        boxShadow: '0 50px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.6)',
        fontFamily: sans,
        color: 'white',
        opacity: Math.min(1, p * 1.6),
        transform: `scale(${interpolate(p, [0, 1], [0.82, 1])}) translateY(${(1 - p) * 80}px)`,
        filter: p < 0.97 ? `blur(${(1 - p) * 16}px)` : undefined,
      }}
    >
      {/* Yaltiroq nur */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          bottom: -200,
          left: `${sweep}%`,
          width: 160,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
          transform: 'rotate(18deg)',
        }}
      />
      {/* Yuqori qator */}
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em'}}>{brand.handle}</div>
        <Icon d="M6 9l6 6 6-6" size={34} />
        <div style={{width: 12, height: 12, borderRadius: 6, background: '#FF3040'}} />
        <div style={{flex: 1}} />
        <Icon d="M12 5v14M5 12h14M4 4h16v16H4z" />
        <div style={{width: 24}} />
        <Icon d="M4 7h16M4 12h16M4 17h16" />
      </div>
      {/* Avatar va ism */}
      <div style={{display: 'flex', alignItems: 'center', gap: 34, marginTop: 36}}>
        <div style={{padding: 6, borderRadius: '50%', background: IG_GRADIENT, flexShrink: 0}}>
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '6px solid #2A2B30',
              background: '#2A2B30',
            }}
          >
            {avatarSrc ? (
              <Img src={avatarSrc} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}} />
            ) : null}
          </div>
        </div>
        <div>
          <div style={{fontSize: 42, fontWeight: 700, letterSpacing: '-0.02em'}}>{brand.profileTitle}</div>
          <div style={{fontSize: 32, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginTop: 8}}>
            {brand.profileRole}
          </div>
        </div>
      </div>
      {/* Bio */}
      <div style={{marginTop: 30, fontSize: 34, lineHeight: 1.38, fontWeight: 500, color: 'rgba(255,255,255,0.9)'}}>
        {brand.profileBio.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      {/* Tugmalar */}
      <div style={{display: 'flex', gap: 18, marginTop: 34}}>
        <div
          style={{
            flex: 1,
            height: 84,
            borderRadius: 20,
            background: '#0095F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          {brand.follow}
        </div>
        <div
          style={{
            flex: 1,
            height: 84,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          {brand.message}
        </div>
      </div>
    </div>
  );
};
