# @prodyusserbot — Instagram uchun AI prodyuser

Telegram bot har qanday sohadagi biznes yoki blog uchun prodyuser vazifasini bajaradi:

1. **Sizni to'liq o'rganadi.** `/start` bosilganda 4 bo'lim bo'yicha savol beradi: **Brend pasporti**, **Lansirovka**, **CustDev** (auditoriya kim?) va **Blog** (hozir qayerdasiz, sizni kimlar va qancha odam ko'ryapti). Javobni matn bilan yozish yoki statistikani skrinshot qilib yuborish mumkin. Ma'lumotlar Notion'da yozilgan bo'lsa, bot avval o'shani o'qiydi va faqat yetishmagan savollarni beradi.
2. **Kamchiliklarni aniqlashtiradi.** AI javoblardagi kamchilik va noaniqliklarni topadi, keyin 2 ta variantli savollar beradi (A / B, yoki o'zingiz yozasiz).
3. **Kontent strategiya tuzadi:** pozitsiya, auditoriya portreti, og'riqlar, rubrikalar, hook turlari, voronka.
4. **Jadval bo'yicha senariy yuboradi.** Siz belgilagan vaqtda (masalan, 09:00 va 18:30) va kerakli sonda yuboradi. Har bir senariyda hook, kadrma-kadr gaplar, ekrandagi yozuvlar, CTA, caption, heshteglar va suratga olish maslahatlari bor.
5. **Senariyni tekshirishingizni kutadi:** «📝 Notion'ga yoz» (har safar qaysi sahifaga yozishni so'raydi), «✏️ Qayta yoz», «🎬 Joyladim», «📊 Analitika».
6. **Videoni tahlil qiladi.** «Joyladim» bosilgandan 24 soat o'tgach statistikani so'raydi. Skrinshotlarni o'qib, videoning qanchalik ommabop bo'lganini aniqlaydi (1–10 baho; viral, yaxshi, o'rtacha yoki past). Natija bo'lmasa senariyni tahlil asosida **qaytadan mukammal yozadi**.
7. **O'rganib boradi.** Har bir tahlildan saboq oladi, keyingi senariylar sizning auditoriyangizga tobora moslashadi.

Bot **ko'p foydalanuvchili**: har kim o'z biznesini kiritadi va ma'lumotlari boshqalardan to'liq ajratilgan. Hech kim boshqaning profili, senariylari yoki Notion'ini ko'ra olmaydi.

## Nimalar kerak

| Nima | Qayerdan | Narxi |
|---|---|---|
| Telegram bot tokeni | @BotFather (sizda bor: @prodyusserbot) | bepul |
| AI kaliti: **Claude** yoki **Gemini** | [console.anthropic.com](https://console.anthropic.com) yoki [aistudio.google.com](https://aistudio.google.com/apikey) | ishlatganingizcha to'laysiz |
| Notion integratsiyasi | [notion.so/profile/integrations](https://www.notion.so/profile/integrations) | bepul |
| **24/7 ishlaydigan server** | VPS (Hetzner, DigitalOcean, Timeweb, Ps.kz…) yoki Railway/Render | oyiga ~$4–6 |

Server shart: bot jadval bo'yicha senariy yuborishi uchun doim yoqiq turishi kerak. Kompyuteringizda ham ishlaydi, lekin kompyuter o'chsa bot ham to'xtaydi.

**AI tanlash:** Claude (`claude-opus-5-5`) senariy va tahlilda sifatliroq, lekin qimmatroq. Gemini Flash ancha arzon. `.env` dagi `LLM_PROVIDER` ni almashtirsangiz bo'ldi. Xarajatni nazorat qilish uchun `MAX_SCENARIOS_PER_DAY` bilan har bir foydalanuvchiga kunlik limit qo'yilgan.

## Ishga tushirish

Python 3.11+ kerak.

```bash
cd bot
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # keyin .env ni to'ldiring
python main.py
```

`.env` da kamida `BOT_TOKEN` va `ANTHROPIC_API_KEY` (yoki `LLM_PROVIDER=gemini` + `GEMINI_API_KEY`) bo'lishi kerak. `OWNER_IDS` ga o'z Telegram ID ingizni yozing (@userinfobot dan bilib olasiz).

### Dokploy orqali (GitHub'dan avtomatik deploy)

1. Dokploy → **Projects** → loyiha → **Create Service → Application**.
2. **Provider: GitHub** → repo `Kontur-Dasturchi`, branch. **Build Path:** `/bot`.
3. **Build Type: Dockerfile**, Dockerfile: `Dockerfile`.
4. **Environment** bo'limiga `.env.example` dagi o'zgaruvchilarni qiymatlari bilan yozing.
5. **Advanced → Mounts** → *Volume Mount*, mount path: `/app/data`. Bu shart: aks holda har bir deployda profillar va senariylar o'chib ketadi.
6. Domen va port kerak emas: bot Telegram'dan o'zi xabar olib turadi (polling).
7. **Deploy** → **Logs** da `Bot ishga tushdi` yozuvi chiqishi kerak.

Botni bir vaqtda faqat **bitta** joyda ishga tushiring. Bir tokenda ikkita nusxa ishlasa, Telegram `Conflict` xatosi beradi.

Docker Hub'dan `python` image tortilmasa: Dokploy → **Build-time Arguments** → `PYTHON_IMAGE=mirror.gcr.io/library/python:3.13-slim`.

### Rossiya serveri: AI uchun chet el orqali ulanish kerak

Google Gemini, Anthropic Claude va Notion API'lari Rossiya IP manzillariga xizmat ko'rsatmaydi ("User location is not supported" va shunga o'xshash xatolar qaytadi). Telegram esa ishlaydi. Ikki yo'l bor.

#### 1-yo'l (bepul, kartasiz): Cloudflare Worker

1. [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) da email bilan ro'yxatdan o'ting. Karta kerak emas.
2. **Workers & Pages → Create → Worker** → nom bering (masalan, `ai-gateway`) → **Deploy**.
3. **Edit code** → hamma kodni o'chirib, [`cloudflare/worker.js`](cloudflare/worker.js) ni joylashtiring → **Deploy**.
4. **Settings → Variables and Secrets → Add**: turi *Secret*, nomi `PROXY_SECRET`, qiymati uzun tasodifiy parol (masalan, 40 ta harf va raqam) → **Deploy**.
5. **Settings → Runtime → Placement → Smart**. Bu Worker'ni Google serverlariga yaqin joyda ishlatadi, Rossiyadagi nuqtada emas.
6. Worker manzili: `https://ai-gateway.<akkaunt>.workers.dev`. Dokploy Environment'ga yozing:

```
AI_GATEWAY_URL=https://ai-gateway.<akkaunt>.workers.dev
AI_GATEWAY_SECRET=<4-qadamdagi parol>
```

Serverda tekshirish (`KALIT` — Gemini kaliti, `PAROL` — `PROXY_SECRET`):

```bash
curl -s "https://ai-gateway.<akkaunt>.workers.dev/gemini/v1beta/models/gemini-3.5-flash:generateContent" -H "x-proxy-secret: PAROL" -H "x-goog-api-key: KALIT" -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"salom"}]}]}' | head -c 400
```

Javobda `"text"` bo'lsa, hammasi ishlayapti. `User location is not supported` chiqsa yoki so'rov osilib qolsa, Rossiyadagi Cloudflare cheklovlari xalaqit beryapti. U holda 2-yo'lga o'ting.

Cloudflare bepul tarifi kuniga 100 000 so'rovgacha ruxsat beradi, bot uchun bu bemalol yetadi.

#### 2-yo'l (oyiga ~$2–3, eng ishonchli): shaxsiy HTTP proksi

`.env` ga chet eldagi **HTTP proksi** yozing:

```
AI_PROXY=http://login:parol@1.2.3.4:8000
```

AI va Notion so'rovlari shu proksi orqali ketadi, Telegram esa to'g'ridan-to'g'ri ishlayveradi. Proksi Yevropa yoki AQShda bo'lsin (Germaniya, Niderlandiya, Finlandiya...). Arzon shaxsiy (private) HTTP proksi yoki chet eldagi istalgan kichik VPS'ga o'rnatilgan proksi yetarli. Telegram ham ishlamay qolsa, `TELEGRAM_PROXY` ni to'ldiring (`http://` yoki `socks5://`).

### Serverda doimiy ishlatish (Ubuntu, systemd)

`/etc/systemd/system/prodyuser.service`:

```ini
[Unit]
Description=Prodyuser Telegram bot
After=network-online.target

[Service]
WorkingDirectory=/opt/Kontur-Dasturchi/bot
ExecStart=/opt/Kontur-Dasturchi/bot/.venv/bin/python main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now prodyuser
```

```bash
journalctl -u prodyuser -f
```

## Notion'ni ulash

Har bir foydalanuvchi botning **«📎 Notion»** bo'limida o'z Notion'ini ulaydi:

1. [notion.so/profile/integrations](https://www.notion.so/profile/integrations) → **New integration** → nom → **Save**.
2. **Internal Integration Secret** (`ntn_...`) ni botga yuboradi. Bot token yozilgan xabarni darhol o'chiradi.
3. Notion'da kerakli sahifa → **•••** → **Connections** → integratsiyani qo'shadi.
4. Bot so'raganda sahifa havolasini yuboradi (**Share → Copy link**).

Bot shu sahifadagi matn, ichki sahifalar va jadvallarni o'qiydi. Yozishda esa ko'rsatilgan sahifa ichida yangi sahifa ochadi (sahifa o'rniga Notion jadvali havolasi berilsa, jadvalga qator qo'shadi).

`.env` dagi `NOTION_TOKEN` faqat `OWNER_IDS` dagilar uchun ishlaydi. Shunday qilinmasa, boshqa foydalanuvchilar sizning Notion sahifalaringizni o'qiy olgan bo'lardi.

## Tuzilishi

```
bot/
  main.py                 ishga tushirish
  prodyuser/
    config.py             .env sozlamalari
    questions.py          start savollari (4 bo'lim) — shu yerda o'zgartiriladi
    prompts.py            AI ko'rsatmalari (prodyuser "miyasi")
    schemas.py            AI javoblari tuzilmasi
    llm.py                Claude / Gemini
    services.py           senariy, tahlil, strategiya, Notion import/eksport
    scheduler.py          jadval bo'yicha yuborish va 24 soatlik eslatma
    notion.py             Notion API
    render.py             Telegram va Notion ko'rinishi
    db.py                 SQLite (data/bot.db)
    handlers/             Telegram oynalari va tugmalar
```

## Bilish kerak bo'lgan cheklovlar

- Instagram statistikasini bot o'zi olmaydi: foydalanuvchi skrinshot yoki raqam yuboradi. Avtomatik olish uchun Instagram Graph API kerak (Business akkaunt + Facebook ilova va tekshiruv). Buni keyinroq qo'shsa bo'ladi.
- Bot qayta ishga tushirilsa, yarim qolgan amal (masalan, aniqlashtiruvchi savollar o'rtasi) bekor bo'ladi. Ma'lumotlar, senariylar va jadval saqlanib qoladi, `/start` bosilsa to'xtagan joydan davom etadi.
- Notion tokenlari serverdagi `data/bot.db` faylida saqlanadi. Server va zaxira nusxalarini himoyalang.
