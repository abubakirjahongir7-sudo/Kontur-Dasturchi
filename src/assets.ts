import {getStaticFiles, staticFile} from 'remotion';

/**
 * public/ papkasidagi faylni qaytaradi. Fayl hali qo'shilmagan bo'lsa `null`
 * qaytaradi — video buzilmaydi, shunchaki o'sha element o'tkazib yuboriladi.
 */
export const asset = (name: string): string | null => {
  const exists = getStaticFiles().some((f) => f.name === name);
  return exists ? staticFile(name) : null;
};
