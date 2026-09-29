// "Kinetik" reel: Pinterest'dagi namunaga o'xshash uslub — oq/qora sahnalar,
// so'zma-so'z chiqadigan yozuvlar va qizil kalit so'zlar.
// Matn va vaqtlarni o'zgartirish uchun faqat shu faylni tahrirlang.
//
// Yozuv qoidasi: har bir qator — so'zlar ro'yxati. `a: true` — qizil, katta kalit so'z.
// `at` — so'z sahna boshidan nechanchi kadrda chiqadi (30 kadr = 1 soniya).

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type Word = {t: string; at: number; a?: boolean};
export type Line = Word[];

export const colors = {
  cream: '#F7F4EF',
  ink: '#141414',
  red: '#E3141F',
  redGlow: 'rgba(255,24,36,0.85)',
  grey: '#BEBBB6',
  pink: '#F8D3D3',
};

export const brand = {
  name: 'Kontur Dasturchi',
  handle: 'kontur_dasturchi',
  /** public/ ichidagi rasm (profil kartochkasi uchun) */
  avatar: 'avatar.jpg',
  profileTitle: 'Kontur Dasturchi | Dasturlash',
  profileRole: 'IT xizmatlar',
  profileBio: [
    'Veb-sayt • Telegram bot • Web App • AI',
    'Biznesingizni tizimlashtiramiz',
    'Direct’ga “Tizim” deb yozing',
  ],
  follow: 'Kuzatish',
  message: 'Xabar yuborish',
};

// ---------- SAHNALAR (kadrlarda) ----------

export const scenes = {
  idea: {from: 0, duration: 54},
  growth: {from: 54, duration: 54},
  because: {from: 108, duration: 54},
  noise: {from: 162, duration: 36},
  money: {from: 198, duration: 54},
  card: {from: 252, duration: 66},
  client: {from: 318, duration: 48},
  result: {from: 366, duration: 48},
  profile: {from: 414, duration: 54},
  work: {from: 468, duration: 48},
  smart: {from: 516, duration: 36},
  direct: {from: 552, duration: 42},
  fix: {from: 594, duration: 66},
};

export const DURATION = scenes.fix.from + scenes.fix.duration; // 660 kadr = 22 soniya

// ---------- MATNLAR ----------

/** 1. Lampochka: "Sizda g‘oya ham, biznes ham bor" */
export const idea: Line[] = [
  [{t: 'Sizda', at: 2}],
  [
    {t: 'g‘oya', at: 9, a: true},
    {t: 'ham,', at: 15},
  ],
  [
    {t: 'biznes', at: 22, a: true},
    {t: 'ham bor', at: 29},
  ],
];

/** 2. Kostyumli odam: boshidagi doirada savol, pastda katta yozuv */
export const growth = {
  circle: [[{t: 'Lekin', at: 4}], [{t: 'savdo', at: 10, a: true}, {t: '-chi?', at: 13}]] as Line[],
  bottom: {t: 'o‘smayapti', at: 26},
};

/** 3. Qora fon, qizil nur: ikki bosqich */
export const because = {
  first: [[{t: 'Chunki', at: 2}, {t: 'tizimsiz', at: 7, a: true}]] as Line[],
  switchAt: 25,
  second: [[{t: 'yuritilgan', at: 27}], [{t: 'biznes', at: 32, a: true}]] as Line[],
};

/** 4. Masxaraboz */
export const noise: Line[] = [
  [
    {t: 'shunchaki', at: 3},
  ],
  [{t: 'tartibsizlik', at: 9, a: true}],
];

/** 5. Pul */
export const money = {
  top: [[{t: 'Tizim', at: 4, a: true}, {t: 'esa —', at: 10}]] as Line[],
  bottom: [[{t: 'haqiqiy', at: 22}], [{t: 'daromad', at: 28, a: true}]] as Line[],
};

export type CardIcon = 'eye' | 'users' | 'money';

/** 6. Qadalgan kartochka */
export const card = {
  enter: 2,
  title: 'Tizimsiz',
  titleAt: 8,
  items: [
    {icon: 'eye', t: 'Nazorat yo‘q', at: 18},
    {icon: 'users', t: 'Mijoz yo‘q', at: 30},
    {icon: 'money', t: 'Foyda yo‘q', at: 42},
  ] as {icon: CardIcon; t: string; at: number}[],
};

/** 7. Pushti doira → "Mijoz mehnatni ko‘rmaydi" */
export const client = {
  logo: 'Mijoz',
  logoAt: 8,
  line: [{t: 'mehnatni', at: 20}, {t: 'ko‘rmaydi', at: 26, a: true}] as Line,
};

/** 8. "U faqat natijani ko‘radi" */
export const result: Line[] = [
  [
    {t: 'U', at: 4},
    {t: 'faqat', at: 8},
  ],
  [{t: 'natijani', at: 15, a: true}],
  [{t: 'ko‘radi', at: 24}],
];

/** 10. Klaviatura: "Siz tinmay ishlayapsiz" */
export const work: Line[] = [
  [
    {t: 'Siz', at: 6},
    {t: 'tinmay', at: 11},
  ],
  [{t: 'ishlayapsiz', at: 18, a: true}],
];

/** 11. 😎 "Lekin tizimli emas" */
export const smart: Line[] = [
  [
    {t: 'Lekin', at: 3},
    {t: 'tizimli', at: 9, a: true},
  ],
  [{t: 'emas', at: 16}],
];

/** 12. Qora doira → "Hoziroq Direct’ga yozing" */
export const direct: Line[] = [
  [
    {t: 'Hoziroq', at: 8},
    {t: 'Direct’ga', at: 13, a: true},
    {t: 'yozing', at: 20},
  ],
];

/** 13. "tizimni biz quramiz" + brend */
export const fix = {
  line: [
    {t: 'tizimni', at: 3, a: true},
    {t: 'biz', at: 9},
    {t: 'quramiz', at: 13},
  ] as Line,
  brandAt: 26,
};

// ---------- OVOZ ----------

/**
 * Ovoz effektlari. Avval public/<fayl> qidiriladi (sizning ovozingiz), bo'lmasa
 * public/demo/<fayl> dagi demo ovoz ishlatiladi (scripts/make-kinetik-sfx.py sintez qilgan).
 * O'z faylingizni qo'yish uchun: masalan, public/sfx/kinetik/drop.mp3
 */
export const audio = {
  /** Barcha effektlarning umumiy balandligi */
  sfxVolume: 0.9,

  /** Fon musiqasi (public/ ichida). O'chirish uchun: backgroundMusic: null */
  backgroundMusic: 'kinetik/music.mp3' as string | null,
  /**
   * Musiqa nechanchi soniyadan boshlanadi. 4.8 — musiqadagi "drop" (~10.5s)
   * aynan "tartibsizlik" zarbasiga (5.7s) tushishi uchun tanlangan.
   */
  musicStartSeconds: 4.8,
  /** Musiqaning sokin boshlanishi (drop'gacha) va asosiy qismi balandligi */
  musicIntroVolume: 0.6,
  musicVolume: 0.4,
  /** Effekt zarbalari paytida musiqa shu darajagacha pasayadi (1 = pasaymaydi) */
  musicDuck: 0.4,
  riser: 'sfx/kinetik/suspense-riser.mp3',
  drop: 'sfx/kinetik/drop.mp3',
  pop: 'sfx/kinetik/soft-ui-pop.mp3',
  boom: 'sfx/kinetik/shutter-soft-boom.mp3',
  slice: 'sfx/kinetik/slice-ring.mp3',
  counter: 'sfx/kinetik/digital-counter.mp3',
  click: 'sfx/kinetik/ui-click.mp3',
  buildup: 'sfx/kinetik/buildup.mp3',
  netflix: 'sfx/kinetik/netflix.mp3',
  /** "netflix" dagi ikkinchi zarba ("dum") birinchisidan necha kadr keyin keladi */
  netflixSecondHit: 9,
  /** "digital-counter" oxiridagi "ding" fayl boshidan necha kadr keyin */
  counterDing: 23,
};
