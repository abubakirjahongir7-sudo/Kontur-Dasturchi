# Kontur Dasturchi — Instagram Reels reklama videosi

[Remotion](https://www.remotion.dev) (React) da yasalgan **1 daqiqalik** reklama videosi.
**1080×1920, 30 fps, 1800 kadr (60 soniya).** Dizayn landing sahifa uslubida: to'q sariq gradient fon, nurli egri chiziqlar, sariq urg'u.
Barcha yozuvlar va kartalar **glass (shisha) effekti** bilan: orqa fonni xiralashtiruvchi shaffof panellar, shishasimon harflar va ular ustidan o'tadigan yaltiroq nur.

## Sahnalar

| Vaqt | Sahna | Nima bo'ladi | Ovoz |
|---|---|---|---|
| 0–4s | **Hook** | Qora ekran → chaqnash. "VIBE CODING", "PROMPT ENGINEERING", "DIZAYN" shisha panelda birma-bir urilib chiqadi: kamera silkinishi, glow, zarba to'lqini | whoosh + har so'zga `impact` |
| 4–11s | **Muammo** | "MUAMMO BORMI?" (savol belgisi tebranadi), 3 ta shisha karta qizil glitch bilan, keyin "Vaqt va pul behuda ketyaptimi?" | `impact`, har kartaga `whoosh`, `impact` |
| 11–13s | **Burilish** | Tezlik chiziqlari → oq flash → "YECHIM BIZDA!" | `riser` (flashda tugaydi) + `impact` |
| 13–21s | **Xizmatlar** | "Biz siz uchun nima qila olamiz": Veb-sayt, Telegram bot, Web App, AI integratsiya plitkalari + "G‘oyadan — tayyor mahsulotgacha" | `whoosh`, har plitkaga `pop`, `impact` |
| 21–41s | **Loyihalar** | Telefon 3D burilib kiradi (har loyiha 5s): AI integratsiya, Kafe tizimi, O‘quv kurs sayti, Savdo tizimi — tavsif va teglar shisha panelda | har almashinuvda `whoosh`, teglarga `pop` |
| 41–51s | **Jarayon** | "4 qadamda tayyor": konsultatsiya → dizayn → ishlab chiqish → ishga tushirish, oxirida ✓ belgilar | har qadamga `whoosh`, belgilarga `pop` |
| 51–60s | **CTA** | Rasm, "Kontur Dasturchi", "Bizda g‘oya mutlaqo bepul!", pulslovchi tugma, Telegram, Instagram kartasi va **Direct'ga yozing** strelkasi | `pop` lar |

**Fon musiqasi yo'q** — videoda faqat animatsiya ovozlari bor. Musiqani Instagram'da joylayotganda (masalan, "Energetic Highway") qo'shasiz.
Qayta yoqish kerak bo'lsa: `src/config.ts` da `audio.musicEnabled: true` qiling va `public/music.mp3` ni qo'ying.

## Fayllar (`public/`)

```
public/
  ai.jpg        ← AI integratsiya ekrani              (bor)
  kafe.jpg      ← kafe menyusi ekrani                 (bor)
  kurs.jpg      ← o'quv kursi sayti ekrani            (bor)
  savdo.jpg     ← savdo tizimi ekrani                 (YO'Q — o'rniga chizilgan savdo paneli chiqadi)
  avatar.jpg    ← CTA dagi rasmingiz                  (bor, hero.jpg dan kesilgan)
  hero.jpg      ← landing bosh sahifasi (dizayn namunasi, videoda ishlatilmaydi)
  music.mp3     ← fon musiqasi (hozir o'chirilgan, kerak emas)
  sfx/whoosh.mp3, sfx/impact.mp3, sfx/riser.mp3, sfx/pop.mp3
```

### Ovoz: sizning fayllaringiz va demo ovozlar

`public/demo/sfx/` da demo ovoz effektlari bor: whoosh, impact, riser, pop. Ularni kod bilan sintez qilib yaratganman — original, litsenziya muammosi yo'q.

- `public/sfx/*.mp3` **bo'lmasa**, video avtomatik `public/demo/sfx/` dagisini ishlatadi.
- O'z faylingizni qo'ysangiz, **sizniki ishlatiladi**.

Effektlar balandligi: `src/config.ts` dagi `audio.sfxVolume`.

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

Shisha (blur) effekti tufayli render bir necha daqiqa davom etadi (4 yadroli kompyuterda ~7 daqiqa).

## Ikkinchi video: "Kinetik" (30 soniya)

Pinterest'dagi namuna uslubida qilingan qisqa reel. U alohida kompozitsiya, yuqoridagi 60 soniyalik `Reel` ga ta'sir qilmaydi.
**1080×1920, 30 fps, 900 kadr.** Har bir sahnada oxirgi so'z chiqqandan keyin yozuv ~1,3 soniya turadi, shunda o'qib ulguriladi. Oq va qora sahnalar almashadi, so'zlar birma-bir xiralikdan chiqadi, kalit so'zlar katta va qizil.

| № | Vaqt | Yozuv | Tasvir |
|---|---|---|---|
| 1 | 0–2,3s | Sizda **g‘oya** ham, **biznes** ham bor | Lampochka, shtrix-kod |
| 2 | 2,3–4,5s | Lekin **savdo**-chi? … o‘smayapti | Rastr nuqtali kostyumli odam |
| 3 | 4,5–7,4s | Chunki **tizimsiz** … yuritilgan **biznes** | Qora fon, qizil nur |
| 4 | 7,4–8,9s | shunchaki **tartibsizlik** | Masxaraboz emojilari |
| 5 | 8,9–11,1s | **Tizim** esa — haqiqiy **daromad** | Chemodan va pullar |
| 6 | 11,1–13,9s | Tizimsiz: nazorat, mijoz, foyda yo‘q | Qadalgan kartochka |
| 7 | 13,9–16s | Mijoz mehnatni **ko‘rmaydi** | Pushti doira, Instagram uslubidagi yozuv |
| 8 | 16–18,2s | U faqat **natijani** ko‘radi | Oq fon |
| 9 | 18,2–21s | Instagram profil kartochkasi | `avatar.jpg` bilan |
| 10 | 21–23s | Siz tinmay **ishlayapsiz** | Klaviatura |
| 11 | 23–24,8s | Lekin **tizimli** emas | 😎 |
| 12 | 24,8–26,6s | Hoziroq **Direct’ga** yozing | Qora doira |
| 13 | 26,6–30s | **tizimni** biz quramiz + brend | Qora fon |

```bash
npm run render:kinetik   # out/kinetik.mp4 (~1–2 daqiqa)
```

Matnlar, vaqtlar, profil ma'lumotlari: **`src/kinetik/config.ts`**. Emoji rasmlari `public/kinetik/` da (Noto Color Emoji shriftidan olingan, SIL OFL 1.1 litsenziyasi).

### Kinetik: ovoz effektlari

| Ovoz | Fayl nomi | Qayerda |
|---|---|---|
| Suspense Riser | `suspense-riser.mp3` | 3–4-sahna: "Chunki tizimsiz…" dan "tartibsizlik" gacha ko'tariladi |
| Drop | `drop.mp3` | "tartibsizlik" 🤡 |
| Soft UI pop | `soft-ui-pop.mp3` | Har bir qizil so'z, oq doira, emojilar, profil, brend |
| Shutter soft boom | `shutter-soft-boom.mp3` | "o‘smayapti", pushti doira, profil kartochkasi |
| Slice Ring | `slice-ring.mp3` | Sahna o'tishlari (xiralashib almashish) |
| Digital Counter | `digital-counter.mp3` | Uchayotgan pullar, "ding" — "daromad" so'zida |
| UI click | `ui-click.mp3` | Lampochka yoqilishi, knopka, ro'yxat bandlari, klaviatura |
| Buildup | `buildup.mp3` | 11–12-sahna: yakuniy zarbaga olib boradi |
| Netflix | `netflix.mp3` | "**tizimni** biz quramiz" — ikki zarbali "ta-dum" |

Hozirgi ovozlar `public/demo/sfx/kinetik/` da. Ularni `scripts/make-kinetik-sfx.py` kod bilan sintez qilgan, shuning uchun original va litsenziya muammosi yo'q. "Netflix" ham faqat shu uslubdagi original zarba: Netflix'ning asl ovozi mualliflik huquqi bilan himoyalangan.

**Fon musiqasi:** `public/kinetik/music.mp3` (siz bergan trek). Musiqa shunday qirqib boshlanadiki, uning drop'i (`musicDropSeconds`) aynan "tartibsizlik" zarbasiga tushadi; sahna vaqtlarini o'zgartirsangiz ham o'zi moslashadi. Effektlar bilan to'qnashmasligi uchun: drop'gacha sokin intro (`musicIntroVolume`), keyin asosiy qism pastroq (`musicVolume`); boom va "ta-dum" zarbalarida musiqa bir lahzaga pasayadi (`musicDuck`); Buildup paytida asta pasayib, unga joy beradi; oxirida silliq so'nadi. Sozlamalar `src/kinetik/config.ts` da. Boshqa musiqa qo'ysangiz, MP3 formatida qo'ying: render brauzeri AAC/m4a ni o'qiy olmaydi va boshini qirqish ishlamay qoladi.

**O'z ovozlaringizni qo'yish** (masalan, CapCut'dan): faylni jadvaldagi nom bilan **`public/sfx/kinetik/`** ga qo'ying. Video demo o'rniga avtomatik sizning faylingizni oladi. Riser va Buildup uzunligi avtomatik o'qiladi va eng baland nuqtasi aynan zarbaga tushadi. Balandlik: `config.ts` dagi `audio.sfxVolume`.

## QR kod (reklama uchun)

Sayt havolasi uchun video bilan bir xil uslubdagi QR kod rasmlari `qr/` papkasida:

| Fayl | O'lcham | Nima uchun |
|---|---|---|
| `qr/qr-kod.png` | 2400×2400 | Faqat QR — flayer, banner, vizitka, chop etish |
| `qr/qr-post.png` | 1080×1350 | Instagram post |
| `qr/qr-story.png` | 1080×1920 | Instagram story |

Havola va yozuvlar: `src/config.ts` dagi `qr` bo'limi. O'zgartirgandan keyin rasmlarni qayta yaratish:

```bash
npm run qr
```

QR xatoni tuzatishning eng yuqori darajasida (H) — markazdagi "K" logo skanerlashga xalal bermaydi. Chop etishda QR kamida 2×2 sm bo'lsin va oq/och fonda qolsin.

## O'zgartirish

Hamma narsa bitta faylda: **`src/config.ts`**

- `hook`, `problem`, `turn`, `services`, `projects`, `workflow`, `cta` — barcha matnlar, telefon raqami, Instagram nomi
- `audio.musicEnabled` — fon musiqasini yoqish/o'chirish (hozir o'chirilgan)
- `audio.sfxVolume` — animatsiya ovozlari balandligi
- `colors` — ranglar
- `scenes` va pastdagi konstantalar — har bir sahna va animatsiya qaysi kadrda boshlanishi (30 kadr = 1 soniya). Ovoz effektlari shu qiymatlardan hisoblanadi, shuning uchun vaqtni o'zgartirsangiz ovoz ham o'zi siljiydi.

`riser.mp3` uzunligi avtomatik o'qiladi va u aynan oq flash paytida eng baland nuqtasiga yetib tugaydi.

## Tuzilishi

```
src/
  config.ts                  matnlar, rasmlar, ovozlar, ranglar, vaqtlar
  Root.tsx                   "Reel" kompozitsiyasi (1080×1920)
  Reel.tsx                   sahnalar ketma-ketligi
  SoundDesign.tsx            animatsiya ovozlari (va o'chirilgan fon musiqasi)
  scenes/                    Hook, Problem, Turn, Services, Projects, Workflow, Cta
  components/                fon, shisha panel/yozuv (Glass.tsx), telefon maketi, chaqnash, savdo paneli namunasi
  fx.ts                      silkinish, spring, glow yordamchilari
  theme.ts                   Montserrat shrifti (lokal, internet shart emas)
  kinetik/                   ikkinchi video "Kinetik": config.ts (matn va vaqtlar), Scenes, Words, Stage, Props
```

## Litsenziya

Remotion jismoniy shaxslar va 3 kishigacha bo'lgan kompaniyalar uchun bepul. Kattaroq jamoa uchun [remotion.pro](https://www.remotion.pro) litsenziyasi kerak bo'ladi.
