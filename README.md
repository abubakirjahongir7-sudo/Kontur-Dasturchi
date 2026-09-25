# Kontur Dasturchi — Instagram Reels reklama videosi

[Remotion](https://www.remotion.dev) (React) da yasalgan 24 soniyalik reklama videosi.
**1080×1920, 30 fps, 720 kadr.** Dizayn landing sahifa uslubida: to'q sariq gradient fon, nurli egri chiziqlar, to'q jigarrang kartalar, sariq urg'u.

## Sahnalar

| Vaqt | Sahna | Nima bo'ladi | Ovoz |
|---|---|---|---|
| 0–3s | **Hook** | Qora ekran → chaqnash. "VIBE CODING", "PROMPT ENGINEERING", "DIZAYN" birma-bir urilib chiqadi: kamera silkinishi, sariq glow, zarba to'lqini | whoosh + har so'zga `impact` |
| 3–8s | **Muammo** | "MUAMMO BORMI?" (savol belgisi tebranadi), keyin 3 ta karta qizil glitch bilan uchib kiradi | `impact` + har kartaga `whoosh` |
| 8–9.5s | **Burilish** | Tezlik chiziqlari → oq flash → "YECHIM BIZDA!" zoom-out | `riser` (flashda tugaydi) + `impact` |
| 9.5–19s | **Loyihalar** | Telefon 3D burilib kiradi: AI integratsiya, Kafe tizimi, O‘quv kurs sayti, Savdo tizimi | har almashinuvda `whoosh` |
| 19–24s | **CTA** | Rasm, "Kontur Dasturchi", "Bizda g‘oya mutlaqo bepul!", pulslovchi sariq tugma, Telegram, Instagram kartasi va **Direct'ga yozing** strelkasi | `pop` lar |

`music.mp3` butun video bo'ylab yangraydi va oxirgi soniyada so'nadi.

## Fayllar (`public/`)

```
public/
  ai.jpg        ← AI integratsiya ekrani              (bor)
  kafe.jpg      ← kafe menyusi ekrani                 (bor)
  kurs.jpg      ← o'quv kursi sayti ekrani            (bor)
  savdo.jpg     ← savdo tizimi ekrani                 (YO'Q — o'rniga chizilgan savdo paneli chiqadi)
  avatar.jpg    ← CTA dagi rasmingiz                  (bor, hero.jpg dan kesilgan)
  hero.jpg      ← landing bosh sahifasi (dizayn namunasi, videoda ishlatilmaydi)
  music.mp3     ← fon musiqasi — "Energetic Highway" ni shu nom bilan qo'ying
  sfx/whoosh.mp3, sfx/impact.mp3, sfx/riser.mp3, sfx/pop.mp3
```

`ai.jpg`, `kafe.jpg`, `kurs.jpg` — landing skrinshotlaringizdan **faqat qurilma ekrani** qismi kesib olingan (telefon ichida yana telefon ko'rinmasligi uchun). Yangi rasm qo'ysangiz, ham faqat ekran qismini qo'ying.

Nima yetishmayotganini tekshirish:

```bash
npm run check
```

Biror fayl bo'lmasa ham video render bo'laveradi: yo'q rasm o'rnida namuna, yo'q ovoz o'rnida jimlik bo'ladi.

## Ishga tushirish

Node.js 18+ kerak.

```bash
npm install
npm run dev      # Remotion Studio — brauzerda ko'rish
npm run render   # out/reel.mp4
```

## O'zgartirish

Hamma narsa bitta faylda: **`src/config.ts`**

- `hook`, `problem`, `turn`, `projects`, `cta` — barcha matnlar, telefon raqami, Instagram nomi
- `audio.musicStartSeconds` — musiqani nechanchi soniyadan boshlash (masalan, trekning "drop" joyidan)
- `audio.musicVolume` — musiqa balandligi
- `colors` — ranglar
- `scenes` va pastdagi konstantalar — har bir sahna va animatsiya qaysi kadrda boshlanishi (30 kadr = 1 soniya). Ovoz effektlari shu qiymatlardan hisoblanadi, shuning uchun vaqtni o'zgartirsangiz ovoz ham o'zi siljiydi.

`riser.mp3` uzunligi avtomatik o'qiladi va u aynan oq flash paytida eng baland nuqtasiga yetib tugaydi.

## Tuzilishi

```
src/
  config.ts                  matnlar, rasmlar, ovozlar, ranglar, vaqtlar
  Root.tsx                   "Reel" kompozitsiyasi (1080×1920)
  Reel.tsx                   sahnalar ketma-ketligi
  SoundDesign.tsx            musiqa va ovoz effektlari
  scenes/                    Hook, Problem, Turn, Projects, Cta
  components/                fon, telefon maketi, karta, chaqnash, savdo paneli namunasi
  fx.ts                      silkinish, spring, glow yordamchilari
  theme.ts                   Montserrat shrifti (lokal, internet shart emas)
```

## Litsenziya

Remotion jismoniy shaxslar va 3 kishigacha bo'lgan kompaniyalar uchun bepul. Kattaroq jamoa uchun [remotion.pro](https://www.remotion.pro) litsenziyasi kerak bo'ladi.
