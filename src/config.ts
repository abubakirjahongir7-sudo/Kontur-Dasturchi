// Videodagi barcha matnlar, rasmlar, ovozlar va vaqtlar shu yerda.
// Matnni o'zgartirish uchun faqat shu faylni tahrirlang.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 60 * FPS; // 1 daqiqa = 1800 kadr

// ---------- MATNLAR ----------

/** 1. HOOK — so'zlar birma-bir "urilib" chiqadi (bo'sh joy = yangi qator) */
export const hook = {
  words: ['VIBE CODING', 'PROMPT ENGINEERING', 'DIZAYN'],
};

/** 2. MUAMMO */
export const problem = {
  title: 'MUAMMO BORMI?',
  cards: ['Biznesingizda?', 'O‘quv kursingizda?', 'Hisob-kitobda?'],
  subline: 'Vaqt va pul behuda ketyaptimi?',
};

/** 3. BURILISH */
export const turn = {
  text: 'YECHIM BIZDA!',
};

export type ServiceIcon = 'web' | 'bot' | 'app' | 'ai';

/** 4. XIZMATLAR */
export const services = {
  label: 'XIZMATLARIMIZ',
  title: 'Biz siz uchun nima qila olamiz',
  items: [
    {icon: 'web', title: 'Veb-sayt', desc: 'Landing va biznes saytlar'},
    {icon: 'bot', title: 'Telegram bot', desc: 'Buyurtma va mijozlar'},
    {icon: 'app', title: 'Web App', desc: 'Biznes uchun tizimlar'},
    {icon: 'ai', title: 'AI integratsiya', desc: 'Avtomatlashtirish'},
  ] as {icon: ServiceIcon; title: string; desc: string}[],
  tagline: 'G‘oyadan — tayyor mahsulotgacha',
};

export type ScreenFit = 'cover' | 'width';

export type Project = {
  /** public/ ichidagi rasm — faqat telefon ekranidagi qism (ramkasiz) */
  image: string;
  title: string;
  desc: string;
  tags: string[];
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

/** 5. LOYIHALAR */
export const projects: {label: string; items: Project[]} = {
  label: 'LOYIHALARIMIZ',
  items: [
    {
      image: 'ai.jpg',
      title: 'AI integratsiya',
      desc: 'Barcha tizimlarni AI bilan integratsiyalash',
      tags: ['AI chat-bot', 'Avtomatlashtirish', '24/7'],
      fit: 'cover',
    },
    {
      image: 'kafe.jpg',
      title: 'Kafe tizimi',
      desc: 'Kafe biznesingizni professional tizimlashtirish',
      tags: ['Elektron menyu', 'Buyurtmalar', 'Mobil'],
      fit: 'cover',
    },
    {
      image: 'kurs.jpg',
      title: 'O‘quv kurs sayti',
      desc: 'O‘quv kursingizni professional darajada tizimlashtirish',
      tags: ['Ro‘yxatdan o‘tish', 'Kurslar', 'Arizalar'],
      fit: 'width',
      screenBg: '#0E1522',
    },
    {
      // savdo.jpg hali yo'q bo'lsa, o'rniga chizilgan savdo paneli ko'rsatiladi
      image: 'savdo.jpg',
      title: 'Savdo tizimi',
      desc: 'Savdo va hisob-kitobni avtomatlashtirish',
      tags: ['Buyurtmalar', 'Hisobotlar', 'Ozon'],
      fit: 'cover',
      fallback: 'savdo',
    },
  ],
};

/** 6. JARAYON (qanday ishlaymiz) */
export const workflow = {
  label: 'QANDAY ISHLAYMIZ?',
  title: '4 qadamda tayyor',
  steps: [
    {title: 'Bepul konsultatsiya', desc: '15 daqiqada muammoga yechim'},
    {title: 'G‘oya va dizayn', desc: 'Biznesingizga mos reja'},
    {title: 'Ishlab chiqish', desc: 'Sayt, bot yoki web app'},
    {title: 'Ishga tushirish', desc: 'Natija va qo‘llab-quvvatlash'},
  ],
};

/** 7. CTA */
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

/** QR kod rasmlari (videodan alohida: `npm run qr`) */
export const qr = {
  url: 'https://frontend-production-9395.up.railway.app/',
  /** QR ostida ko'rinadigan qisqa yozuv */
  urlLabel: 'frontend-production-9395.up.railway.app',
  label: 'SAYTIMIZ',
  title: 'Skanerlang va saytga kiring',
  subtitle: 'Telefon kamerasini QR kodga qarating',
  /** QR markazidagi belgi */
  logoLetter: 'K',
};

// ---------- OVOZ ----------

export const audio = {
  /**
   * Fon musiqasi o'chirilgan: videoda faqat animatsiya ovozlari bor,
   * musiqani Instagram'da joylayotganda qo'shasiz.
   * Qayta yoqish uchun `true` qiling va public/music.mp3 ni qo'ying.
   */
  musicEnabled: false,
  music: 'music.mp3',
  /** Musiqani nechanchi soniyadan boshlash (masalan, "drop" joyidan) */
  musicStartSeconds: 0,
  musicVolume: 0.5,
  /** Barcha ovoz effektlarining umumiy balandligi */
  sfxVolume: 0.9,
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
  accent: '#F5B82E',
  text: '#FFFFFF',
  dark: '#120702',
  danger: '#FF3B30',
};

// ---------- VAQTLAR (kadrlarda, 30 kadr = 1 soniya) ----------

export const scenes = {
  hook: {from: 0, duration: 120}, // 0–4s
  problem: {from: 120, duration: 210}, // 4–11s
  turn: {from: 330, duration: 60}, // 11–13s
  services: {from: 390, duration: 240}, // 13–21s
  projects: {from: 630, duration: 600}, // 21–41s
  workflow: {from: 1230, duration: 300}, // 41–51s
  cta: {from: 1530, duration: 270}, // 51–60s
};

// Sahnalar ichidagi lahzalar (har biri o'z sahnasi boshidan hisoblanadi)
export const HOOK_FLASH = 4;
export const HOOK_WORDS = [10, 44, 78];

export const PROBLEM_TITLE = 4;
export const PROBLEM_CARDS = [44, 74, 104];
export const PROBLEM_SUBLINE = 140;

export const TURN_FLASH = 26;

export const SERVICES_TITLE = 4;
export const SERVICES_ITEMS = [40, 62, 84, 106];
export const SERVICES_TAGLINE = 150;

export const PROJECT_STARTS = projects.items.map((_, i) =>
  Math.round((scenes.projects.duration / projects.items.length) * i),
);
/** Loyiha sahnasi ichida: tavsif paneli va teglar qachon chiqadi */
export const PROJECT_CAPTION = 18;
export const PROJECT_TAGS = [34, 42, 50];

export const WORKFLOW_TITLE = 4;
export const WORKFLOW_STEPS = [36, 84, 132, 180];
/** Qadamlarga "✓" belgisi qo'yiladigan kadrlar */
export const WORKFLOW_CHECKS = [228, 238, 248, 258];

export const CTA_AVATAR = 0;
export const CTA_BRAND = 6;
export const CTA_TAGLINE = 14;
export const CTA_BUTTON = 26;
export const CTA_TELEGRAM = 44;
export const CTA_INSTAGRAM = 60;
export const CTA_ARROW = 76;
/** Tugma shu kadrlarda "puls" qiladi (har biriga pop) */
export const CTA_PULSES = [100, 145, 190, 235];
