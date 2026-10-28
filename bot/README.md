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
