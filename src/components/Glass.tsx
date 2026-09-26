import React from 'react';
import {useCurrentFrame} from 'remotion';

export type GlassTint = 'light' | 'brown' | 'yellow';

const tints: Record<GlassTint, {bg: string; border: string}> = {
  light: {
    bg: 'linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.08))',
    border: 'rgba(255,255,255,0.55)',
  },
  brown: {
    bg: 'linear-gradient(135deg, rgba(92,38,12,0.66), rgba(58,24,8,0.52))',
    border: 'rgba(255,220,170,0.45)',
  },
  yellow: {
    bg: 'linear-gradient(135deg, rgba(255,214,110,0.55), rgba(245,184,46,0.25))',
    border: 'rgba(255,236,180,0.8)',
  },
};

/** Shisha ustidan vaqti-vaqti bilan o'tadigan yaltiroq nur (0–100% oralig'ida) */
const useSheen = (offset: number, period: number) => {
  const frame = useCurrentFrame();
  const t = ((frame + offset) % period) / period;
  // Nur davrning 45% ida o'tadi, qolgan vaqt ko'rinmaydi
  return -60 + (Math.min(t, 0.45) / 0.45) * 220;
};

/**
 * Glassmorphism panel: orqasidagi fonni xiralashtiradi (backdrop blur),
 * yarim shaffof, yorqin chegara va ustidan o'tadigan yaltiroq nur bilan.
 */
export const GlassPanel: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  tint?: GlassTint;
  radius?: number;
  blur?: number;
  sheenOffset?: number;
  sheenPeriod?: number;
}> = ({children, style, tint = 'brown', radius = 32, blur = 22, sheenOffset = 0, sheenPeriod = 110}) => {
  const sheen = useSheen(sheenOffset, sheenPeriod);
  const t = tints[tint];

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: radius,
        background: t.bg,
        backdropFilter: `blur(${blur}px) saturate(160%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(160%)`,
        border: `2px solid ${t.border}`,
        boxShadow:
          '0 26px 60px rgba(50,12,0,0.35), inset 0 2px 1px rgba(255,255,255,0.55), inset 0 -2px 1px rgba(255,255,255,0.1)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Yuqori yarmidagi shisha aksi */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0))',
          pointerEvents: 'none',
        }}
      />
      {/* Yaltiroq nur */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          bottom: '-30%',
          left: `${sheen}%`,
          width: '28%',
          transform: 'skewX(-22deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.38), rgba(255,255,255,0))',
          pointerEvents: 'none',
        }}
      />
      <div style={{position: 'relative', height: '100%'}}>{children}</div>
    </div>
  );
};

export type GlassTextVariant = 'white' | 'yellow';

const fills: Record<GlassTextVariant, {fill: string; stroke: string; glow: string}> = {
  white: {
    fill: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.93) 46%, rgba(255,240,225,0.7) 54%, rgba(255,255,255,0.9) 100%)',
    stroke: 'rgba(255,255,255,0.95)',
    glow: 'rgba(255,214,160,0.55)',
  },
  yellow: {
    fill: 'linear-gradient(180deg, #FFF3C4 0%, #FFD45A 46%, rgba(240,164,22,0.85) 54%, #FFE08A 100%)',
    stroke: 'rgba(255,244,200,0.95)',
    glow: 'rgba(245,184,46,0.7)',
  },
};

/**
 * Shishasimon yozuv: yarim shaffof gradient bilan to'ldirilgan harflar,
 * yorqin kontur va harflar ustidan o'tadigan yaltiroq nur.
 */
export const GlassText: React.FC<{
  children: React.ReactNode;
  variant?: GlassTextVariant;
  style?: React.CSSProperties;
  sheenOffset?: number;
  sheenPeriod?: number;
  glow?: number;
}> = ({children, variant = 'white', style, sheenOffset = 0, sheenPeriod = 90, glow = 0}) => {
  const sheen = useSheen(sheenOffset, sheenPeriod);
  const f = fills[variant];

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${sheen - 9}%, rgba(255,255,255,0.95) ${sheen}%, rgba(255,255,255,0) ${
          sheen + 9
        }%), ${f.fill}`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextStroke: `1.5px ${f.stroke}`,
        filter: `drop-shadow(0 6px 10px rgba(74,34,16,0.4)) drop-shadow(0 0 ${24 + glow * 40}px ${f.glow})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
