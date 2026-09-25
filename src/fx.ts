import {interpolate, random, spring} from 'remotion';

/** Oxirgi zarbadan keyin so'nib boruvchi kamera silkinishi */
export const shake = (frame: number, hits: number[], amplitude = 26, decay = 12) => {
  const last = [...hits].reverse().find((h) => frame >= h);
  if (last === undefined) return {x: 0, y: 0, r: 0};
  const t = frame - last;
  const k = Math.max(0, 1 - t / decay) ** 2 * amplitude;
  return {
    x: (random(`sx${frame}`) - 0.5) * 2 * k,
    y: (random(`sy${frame}`) - 0.5) * 2 * k,
    r: (random(`sr${frame}`) - 0.5) * 0.12 * k,
  };
};

/** Kuchli va tez "urilish" springi */
export const punch = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 13, stiffness: 320, mass: 0.6}});

/**
 * Spring qiymatini "urilish" masshtabiga aylantiradi: `from` dan 1 gacha,
 * spring 1 dan oshib ketganda esa biroz "ezilib" qaytadi (kichrayib ketmaydi)
 */
export const slamScale = (p: number, from: number) =>
  p <= 1 ? from + (1 - from) * p : 1 - (p - 1) * 0.35;

/** Yumshoqroq, lekin tez spring */
export const snappy = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 240, mass: 0.7}});

/** Zarba paytida yonib, keyin so'nadigan qiymat (glow, chaqnash uchun) */
export const hitGlow = (frame: number, at: number, duration = 14) =>
  frame < at
    ? 0
    : interpolate(frame - at, [0, duration], [1, 0], {extrapolateRight: 'clamp'});
