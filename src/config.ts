// Videodagi barcha matnlar, rasmlar, ovozlar va vaqtlar shu yerda.
// Matnni o'zgartirish uchun faqat shu faylni tahrirlang.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 24 * FPS; // 720 kadr

// ---------- MATNLAR ----------

/** 1. HOOK — so'zlar birma-bir "urilib" chiqadi (bo'sh joy = yangi qator) */
export const hook = {
  words: ['VIBE CODING', 'PROMPT ENGINEERING', 'DIZAYN'],
};

/** 2. MUAMMO */
export const problem = {
  title: 'MUAMMO BORMI?',
  cards: ['Biznesingizda?', 'O‘quv kursingizda?', 'Hisob-kitobda?'],
};

/** 3. BURILISH */
export const turn = {
  text: 'YECHIM BIZDA!',
};

export type ScreenFit = 'cover' | 'width';

export type Project = {
  /** public/ ichidagi rasm — faqat telefon ekranidagi qism (ramkasiz) */
  image: string;
  title: string;
  /**
   * cover — rasm ekranni to'liq qoplaydi (foto va telefon skrinshotlari uchun);
   * width — rasm eni bo'yicha joylashadi, qolgan joy `screenBg` rangida bo'ladi
   * (kompyuter skrinshotlari uchun)
   */
  fit?: ScreenFit;
  screenBg?: string;
  /** Rasm bo'lmasa ekranda chizilgan namuna ko'rsatiladi */
  fallback?: 'savdo';
};

/** 4. LOYIHALAR */
export const projects: {label: string; items: Project[]} = {
  label: 'LOYIHALARIMIZ',
  items: [
    {image: 'ai.jpg', title: 'AI integratsiya', fit: 'cover'},
    {image: 'kafe.jpg', title: 'Kafe tizimi', fit: 'cover'},
    {image: 'kurs.jpg', title: 'O‘quv kurs sayti', fit: 'width', screenBg: '#0E1522'},
    // savdo.jpg hali yo'q bo'lsa, o'rniga chizilgan savdo paneli ko'rsatiladi
    {image: 'savdo.jpg', title: 'Savdo tizimi', fit: 'cover', fallback: 'savdo'},
  ],
};

/** 5. CTA */
export const cta = {
  brandFirst: 'Kontur',
  brandSecond: 'Dasturchi',
  avatar: 'avatar.jpg',
  tagline: 'Bizda g‘oya mutlaqo bepul!',
  button: 'Bepul konsultatsiya olish',
  telegram: 'Telegram: +7 911 828 5166',
  instagram: 'kontur_dasturchi',
  instagramBio: 'AI • Vibe Coding • Prompt Engineering',
  directButton: 'Xabar yuborish',
  directHint: 'Direct’ga yozing!',
};

// ---------- OVOZ ----------

export const audio = {
  music: 'music.mp3',
  /** Musiqani nechanchi soniyadan boshlash (masalan, "drop" joyidan) */
  musicStartSeconds: 0,
  musicVolume: 0.6,
  whoosh: 'sfx/whoosh.mp3',
  impact: 'sfx/impact.mp3',
  riser: 'sfx/riser.mp3',
  pop: 'sfx/pop.mp3',
};

// ---------- RANGLAR ----------

export const colors = {
  orange: '#E8651A',
  orangeDeep: '#B8420C',
  card: '#4A2210',
  cardBorder: 'rgba(255, 214, 150, 0.22)',
  accent: '#F5B82E',
  text: '#FFFFFF',
  dark: '#120702',
  danger: '#FF3B30',
};

// ---------- VAQTLAR (kadrlarda, 30 kadr = 1 soniya) ----------

export const scenes = {
  hook: {from: 0, duration: 90}, // 0–3s
  problem: {from: 90, duration: 150}, // 3–8s
  turn: {from: 240, duration: 45}, // 8–9.5s
  projects: {from: 285, duration: 285}, // 9.5–19s
  cta: {from: 570, duration: 150}, // 19–24s
};

// Sahnalar ichidagi lahzalar (har biri o'z sahnasi boshidan hisoblanadi)
export const HOOK_FLASH = 4;
export const HOOK_WORDS = [10, 36, 62];

export const PROBLEM_TITLE = 4;
export const PROBLEM_CARDS = [40, 64, 88];

export const TURN_FLASH = 18;

export const PROJECT_STARTS = projects.items.map((_, i) =>
  Math.round((scenes.projects.duration / projects.items.length) * i),
);

export const CTA_AVATAR = 0;
export const CTA_BRAND = 6;
export const CTA_TAGLINE = 14;
export const CTA_BUTTON = 24;
export const CTA_TELEGRAM = 40;
export const CTA_INSTAGRAM = 54;
export const CTA_ARROW = 66;
/** Tugma shu kadrlarda "puls" qiladi (har biriga pop) */
export const CTA_PULSES = [80, 110, 140];
