# Kontur Dasturchi — promo video

Portfolio uchun ~24 soniyalik reklama videosi. [Remotion](https://www.remotion.dev) (React) yordamida yasalgan.

Ikki format bor:

| Kompozitsiya | O'lcham | Qayerga |
|---|---|---|
| `Promo` | 1080×1920 (9:16) | Instagram Reels, TikTok, Telegram |
| `PromoWide` | 1920×1080 (16:9) | YouTube, sayt |

## Video tarkibi

1. **Intro** — riser → zarba (impact) → `KONTUR / DASTURCHI` logotipi va shior
2. **Landing sahifalar** — `hero.jpg`
3. **AI bilan integratsiya** — `ai.jpg`
4. **Kafe menyusi** — `kafe.jpg`
5. **O‘quv kursi sayti** — `kurs.jpg`
6. **Ozon / onlayn savdo** — `savdo.jpg`
7. **Outro** — "Sizga ham shunday sayt kerakmi?" + tugma va kontaktlar

Sahnalar almashganda `whoosh`, teglar chiqqanda `pop` chalinadi. Butun video davomida `music.mp3` yangraydi (boshida kuchayib, oxirida so'nadi).

## Fayllar (`public/`)

```
public/
  hero.jpg      ← landingning bosh sahifasi
  ai.jpg        ← "AI bilan integratsiyalash"
  kafe.jpg      ← kafe menyusi
  kurs.jpg      ← o'quv kursi sayti
  savdo.jpg     ← Ozon / savdo
  music.mp3     ← fon musiqasi
  sfx/whoosh.mp3, sfx/impact.mp3, sfx/riser.mp3, sfx/pop.mp3
```

Hammasi joyidaligini tekshirish:

```bash
npm run check
```

Biror fayl hali bo'lmasa ham video render bo'laveradi: rasm o'rnida rangli joy va fayl nomi ko'rinadi, ovoz esa shunchaki chalinmaydi.

**Rasmlar haqida:**

- Rasm **uzun** bo'lsa (butun sahifaning skrinshoti — full-page screenshot), video uni brauzer ichida pastga **skroll** qiladi. Bu eng chiroyli chiqadi.
- Oddiy ekran skrinshoti (16:9) bo'lsa, ramka rasmga moslashadi va rasm qirqilmaydi.
- **Telefon skrinshoti** (tor va baland) bo'lsa, avtomatik telefon ramkasiga qo'yiladi. Ramkani qo'lda tanlash uchun `src/config.ts` da `device: 'phone'` yoki `device: 'browser'` yozing.

## Ishga tushirish

Node.js 18+ kerak.

```bash
npm install
npm run dev          # Remotion Studio — brauzerda ko'rish va tahrirlash
npm run render       # out/promo-vertical.mp4 (9:16)
npm run render:wide  # out/promo-wide.mp4 (16:9)
npm run render:all   # ikkalasi ham
```

## Matnlarni o'zgartirish

Barcha matn, rang va vaqtlar bitta faylda: **`src/config.ts`**

- `brand` — nom, shior, outro savoli, tugma matni, **kontaktlar**
- `projects` — har bir loyiha: rasm, sarlavha, tavsif, teglar, rang
- Pastda — sahnalar davomiyligi (kadrlarda, 30 kadr = 1 soniya)

> ⚠️ `brand.contacts` da hozircha namuna turibdi (`@username`, `+998 90 000 00 00`) — render qilishdan oldin o'zingiznikiga almashtiring.

## Tuzilishi

```
src/
  config.ts              matnlar, loyihalar, vaqtlar
  Root.tsx               ikki kompozitsiya (9:16 va 16:9)
  Promo.tsx              sahnalar ketma-ketligi va o'tishlar
  SoundDesign.tsx        musiqa va ovoz effektlari
  scenes/                Intro, ProjectScene, Outro
  components/            fon, logotip, brauzer/telefon ramkasi, teglar
  theme.ts               ranglar va shriftlar (Unbounded, Manrope — lokal, internet shart emas)
```

## Litsenziya

Remotion jismoniy shaxslar va 3 kishigacha bo'lgan kompaniyalar uchun bepul. Kattaroq jamoa uchun [remotion.pro](https://www.remotion.pro) litsenziyasi kerak bo'ladi.
