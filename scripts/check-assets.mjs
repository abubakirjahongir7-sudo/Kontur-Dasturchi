// public/ papkasida videoga kerakli barcha fayllar borligini tekshiradi.
// Ishga tushirish: npm run check
import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

const config = readFileSync(new URL('../src/config.ts', import.meta.url), 'utf8');
const files = [
  ...[...config.matchAll(/(?:image|avatar):\s*'([^']+)'/g)].map((m) => m[1]),
  ...[...config.matchAll(/^\s*\w+:\s*'((?:sfx\/)?[\w-]+\.(?:mp3|wav|m4a|aac))'/gm)].map((m) => m[1]),
];

let missing = 0;
for (const file of files) {
  const ok = existsSync(join('public', file));
  if (!ok) missing++;
  const note = !ok && file === 'savdo.jpg' ? '  (hozircha o‘rniga chizilgan savdo paneli ko‘rsatiladi)' : '';
  console.log(`${ok ? '✔' : '✘'}  public/${file}${note}`);
}

console.log(
  missing === 0
    ? '\nHammasi joyida — render qilishingiz mumkin.'
    : `\n${missing} ta fayl yetishmayapti. Video baribir render bo'ladi, lekin yo'q rasmlar o'rnida namuna, yo'q ovozlar o'rnida jimlik bo'ladi.`,
);
