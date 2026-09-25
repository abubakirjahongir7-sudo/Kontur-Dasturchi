// Videodagi barcha matnlar, rasmlar va vaqtlar shu yerda.
// Matnni o'zgartirish uchun faqat shu faylni tahrirlang.

export type Device = 'browser' | 'phone';

export type Project = {
  /** public/ ichidagi rasm fayli */
  image: string;
  title: string;
  subtitle: string;
  tags: string[];
  /**
   * Rasm qaysi ramkada ko'rsatiladi. Yozilmasa — avtomatik:
   * telefon skrinshoti (tor va baland) → telefon, qolgani → brauzer.
   */
  device?: Device;
  /** Sahna uchun ikki rangli gradient */
  accent: [string, string];
};

export const brand = {
  name: 'KONTUR',
  suffix: 'DASTURCHI',
  tagline: 'Veb-saytlar · AI · Onlayn savdo',
  outroQuestion: 'Sizga ham shunday sayt kerakmi?',
  cta: 'Hoziroq yozing',
  // TODO: haqiqiy kontaktlaringizni yozing
  contacts: ['Telegram: @username', '+998 90 000 00 00'],
};

export const projects: Project[] = [
  {
    image: 'hero.jpg',
    title: 'Landing sahifalar',
    subtitle: 'Birinchi ekrandanoq mijozni ushlab qoladigan saytlar',
    tags: ['Zamonaviy dizayn', 'Mobilga mos', 'Tez yuklanadi'],
    accent: ['#7C5CFF', '#22D3EE'],
  },
  {
    image: 'ai.jpg',
    title: 'AI bilan integratsiya',
    subtitle: 'Sayt va botlaringizga sun’iy intellekt ulaymiz',
    tags: ['AI chat-bot', 'Avto-javoblar', '24/7 yordamchi'],
    accent: ['#22D3EE', '#34D399'],
  },
  {
    image: 'kafe.jpg',
    title: 'Kafe menyusi',
    subtitle: 'QR-kod orqali ochiladigan chiroyli elektron menyu',
    tags: ['QR-menyu', 'Mobil versiya', 'Oson yangilash'],
    accent: ['#FB923C', '#F43F5E'],
  },
  {
    image: 'kurs.jpg',
    title: 'O‘quv kursi sayti',
    subtitle: 'Kurslar, darslar va ariza qabul qilish — bitta joyda',
    tags: ['Kurs sahifalari', 'Ariza qabul qilish', 'Mobilga mos'],
    accent: ['#60A5FA', '#A78BFA'],
  },
  {
    image: 'savdo.jpg',
    title: 'Ozon / onlayn savdo',
    subtitle: 'Marketplace’da savdoni o‘stirish uchun yechimlar',
    tags: ['Ozon', 'Mahsulot kartochkalari', 'Ko‘proq sotuv'],
    accent: ['#005BFF', '#F91155'],
  },
];

export const audio = {
  music: 'music.mp3',
  whoosh: 'sfx/whoosh.mp3',
  impact: 'sfx/impact.mp3',
  riser: 'sfx/riser.mp3',
  pop: 'sfx/pop.mp3',
};

// ---- Vaqtlar (kadrlarda, 30 kadr = 1 soniya) ----

export const FPS = 30;
export const TRANSITION_FRAMES = 16;

export const INTRO_FRAMES = 105;
export const FIRST_PROJECT_FRAMES = 126;
export const PROJECT_FRAMES = 108;
export const OUTRO_FRAMES = 150;

// Intro ichidagi lahzalar
export const INTRO_IMPACT = 40;
export const INTRO_TAGLINE = 52;

// Loyiha sahnasi ichidagi lahzalar
export const CHIPS_START = 34;
export const CHIP_STAGGER = 6;

// Outro ichidagi lahzalar
export const OUTRO_CTA = 62;
export const OUTRO_CONTACTS = 80;

export const sceneDurations: number[] = [
  INTRO_FRAMES,
  ...projects.map((_, i) => (i === 0 ? FIRST_PROJECT_FRAMES : PROJECT_FRAMES)),
  OUTRO_FRAMES,
];

/** Har bir sahnaning umumiy videodagi boshlanish kadri (o'tishlar hisobga olingan) */
export const sceneStarts: number[] = sceneDurations.reduce<number[]>(
  (starts, _, i) => {
    if (i === 0) return [0];
    return [...starts, starts[i - 1] + sceneDurations[i - 1] - TRANSITION_FRAMES];
  },
  [],
);

export const TOTAL_FRAMES =
  sceneStarts[sceneStarts.length - 1] + sceneDurations[sceneDurations.length - 1];
