import {useVideoConfig} from 'remotion';

/** Vertikal (9:16) va gorizontal (16:9) formatlar uchun umumiy o'lchamlar */
export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  // Barcha o'lchamlar 1080 px qisqa tomonga nisbatan hisoblanadi
  const u = Math.min(width, height) / 1080;
  return {width, height, vertical, u};
};
