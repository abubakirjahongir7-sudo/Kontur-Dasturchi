"""AI uchun ko'rsatmalar (system prompt va vazifalar)."""

PRODUCER_SYSTEM = """\
Siz — Instagram Reels bo'yicha tajribali prodyuser, ssenarist va kontent-strateg. \
Har qanday soha (ta'lim, kafe, go'zallik, IT, qurilish, ishlab chiqarish, ekspert bloglar va h.k.) \
bilan ishlaysiz va O'zbekiston hamda MDH auditoriyasini yaxshi bilasiz.

Sizning ishingiz — foydalanuvchining biznesini chuqur tushunib, uning aynan auditoriyasi uchun \
ko'rishlar, obunachilar va mijozlar oqimini oshiradigan videolar o'ylab topish va natijalarni tahlil qilish.

Qanday ishlaysiz:
- Faqat foydalanuvchi bergan ma'lumotlarga tayanasiz. Bilmagan faktni (raqam, natija, narx, keys) o'ylab \
topmaysiz; kerak bo'lsa, senariyda [qavs ichida] nima qo'yish kerakligini ko'rsatasiz.
- Umumiy maslahatlar emas, aynan shu biznes, shu mahsulot va shu mijozning og'rig'iga mos aniq g'oyalar berasiz.
- Instagram algoritmini hisobga olasiz: birinchi 1–3 soniyadagi hook, tomosha davomiyligi (retention), \
oxirigacha ko'rish, qayta ko'rish, saqlash (save), ulashish (share), izohlar va profilga o'tishlar.
- Kontent turlarini aralashtirasiz: qamrov (viral) videolar, ishonch/ekspertlik videolari va sotuv videolari. \
Voronkani o'ylaysiz: ko'rish → obuna → ishonch → ariza/xarid.
- Hook formulalari: kutilmagan fakt, xato/mif, savol, natija ko'rsatish, "qanday qilib", ziddiyat, \
POV, ro'yxat, "oldin/keyin", mijoz gapi. Har safar boshqacha, takrorlanmaydigan yondashuv.
- Video odam suratga olishi mumkin bo'lgan darajada aniq bo'ladi: kadrlar, gaplar, ekrandagi yozuvlar.
- Foydalanuvchiga xizmat ko'rsatish tili — o'zbek tili (lotin). Videodagi gaplar, ekrandagi yozuvlar, \
caption va heshteglar esa foydalanuvchi tanlagan video tilida yoziladi.
"""

REVIEW_TASK = """\
Quyida foydalanuvchining brend pasporti, lansirovka, CustDev va blog haqidagi javoblari.

Vazifa:
1. `summary` — biznesni 4–6 gapda o'zingizning so'zingiz bilan tushuntiring (kim, nima, kim uchun, hozirgi holat).
2. `gaps` — ma'lumotlardagi kamchiliklar, noaniqliklar va bir-biriga zid joylar (bo'lmasa — bo'sh ro'yxat).
3. `questions` — eng muhim kamchiliklarni aniqlashtirish uchun 3–6 ta savol. Har bir savolga 2 ta aniq, \
bir-biridan farqli javob varianti (`option_a`, `option_b`) bering — foydalanuvchi bittasini tanlaydi. \
`why` — bu savol senariylarga qanday ta'sir qilishini qisqa tushuntiring. \
Savollar foydalanuvchi allaqachon javob bergan narsani takrorlamasin.

Foydalanuvchi ma'lumotlari:
{profile}
"""

STRATEGY_TASK = """\
Quyidagi ma'lumotlar asosida shu foydalanuvchi uchun Instagram kontent strategiyasini tuzing. \
Bu strategiya keyingi barcha senariylar uchun asos bo'ladi, shuning uchun aniq va shu biznesga xos bo'lsin.

- `positioning` — bir-ikki gapda: kim, kim uchun, qanday natija beradi.
- `audience_portrait` — ideal tomoshabin portreti (jonli tasvirlang).
- `pains`, `desires`, `objections` — auditoriyaning og'riqlari, istaklari, e'tirozlari (mijoz tilida).
- `tone_of_voice` — qanday gapirish, qanday so'zlar ishlatish/ishlatmaslik.
- `content_pillars` — 3–5 ta kontent rubrikasi, har biriga ulush foizi (jami 100).
- `hook_styles` — shu auditoriyada eng yaxshi ishlaydigan 5–7 ta hook turi, misol bilan.
- `funnel` — tomoshabin mijozga qanday aylanadi (qadam-baqadam, CTA lar bilan).
- `posting_plan` — haftalik joylash rejasi va vaqtlari.
- `growth_focus` — hozirgi bosqichda asosiy fokus va nega.
- `avoid` — nimalardan qochish kerak.

Foydalanuvchi ma'lumotlari:
{profile}
"""

SCENARIOS_TASK = """\
Shu foydalanuvchi uchun {count} ta YANGI va UNIKAL Reels senariysi yozing.

Talablar:
- Har bir senariy boshqa hook turi, boshqa rubrika va boshqa g'oyada bo'lsin. Avvalgi senariylar \
mavzularini takrorlamang.
- Maqsadlarni aralashtiring (`goal`): "views" — qamrov/viral, "followers" — obuna, "clients" — mijoz/sotuv. \
Strategiyadagi hozirgi fokusni hisobga oling.
- Tahlil natijalaridan olingan saboqlarga albatta amal qiling: ishlagan narsani kuchaytiring, ishlamaganini takrorlamang.
- `hook` — birinchi 1–3 soniyada aytiladigan gap; `hook_on_screen` — ekrandagi katta yozuv.
- `scenes` — vaqt bo'yicha kadrlar: `time` ("0–3 s"), `visual` (nima ko'rinadi, kamera qanday), \
`speech` (aynan aytiladigan gap), `on_screen_text` (ekrandagi yozuv, bo'lmasa bo'sh).
- `duration_sec` — 15–60 soniya, ko'rish davomiyligini o'ylab.
- `cta` — aniq harakat (masalan, Direct'ga kodli so'z yozish, saqlash, obuna bo'lish).
- `caption` — Instagram uchun tayyor matn (birinchi qatori qiziqtiradigan). `hashtags` — 5–10 ta, `#` belgisi bilan.
- `filming_tips` — suratga olish bo'yicha 2–4 ta amaliy maslahat (foydalanuvchi resurslariga mos).
- `why_it_works` — nega bu video aynan shu auditoriyada ishlashi kerakligi.
- `best_time_to_post` — joylash uchun eng yaxshi kun/vaqt.
{wish}
Foydalanuvchi ma'lumotlari:
{profile}
"""

REWRITE_TASK = """\
Quyidagi senariyni qaytadan, ancha mukammal qilib yozing (1 ta senariy qaytaring).
{reason}

Asl senariy:
{scenario}

Foydalanuvchi ma'lumotlari:
{profile}
"""

ANALYZE_TASK = """\
Foydalanuvchi shu senariy asosida video olib, Instagram'ga joyladi va statistikani yubordi \
(skrinshotlar va/yoki matn). Videoning qanchalik ommabop bo'lganini aniqlang.

Qanday baholash kerak:
- Skrinshotlardagi barcha raqamlarni o'qing (ko'rishlar, qamrov, layk, izoh, ulashish, saqlash, \
yangi obunachilar, profilga o'tishlar, o'rtacha tomosha vaqti, tomosha davomiyligi grafigi, \
obunachi bo'lmaganlar ulushi va h.k.) va `metrics` ga yozing.
- `views` — ko'rishlar soni (noma'lum bo'lsa 0).
- Natijani foydalanuvchining odatiy ko'rsatkichlari (obunachilar soni, o'rtacha ko'rishlar) va oldingi \
videolari bilan solishtiring. Video joylanganiga qancha vaqt bo'lganini hisobga oling.
- `score` — 1 dan 10 gacha. `verdict`: "viral" (odatdagidan bir necha barobar yaxshi), "good" (odatdagidan \
yaxshi), "average" (odatdagidek), "poor" (odatdagidan yomon).
- `what_worked`, `what_failed` — aniq sabablar bilan. `hook_analysis` — hook ishladimi; \
`retention_analysis` — odamlar qayerda chiqib ketgan bo'lishi mumkin.
- `recommendations` — keyingi videolar uchun aniq tavsiyalar.
- `lessons` — kelajakdagi barcha senariylar uchun 1–3 ta qisqa qoida (shu foydalanuvchi auditoriyasiga xos).
- `missing_data` — tahlilni aniqroq qilish uchun yetishmagan ma'lumotlar.
- `needs_rewrite` — natija "average" yoki "poor" bo'lsa true (senariy qayta yoziladi).

Senariy:
{scenario}

Foydalanuvchi yuborgan matn:
{texts}

Foydalanuvchi ma'lumotlari:
{profile}
"""

EXTRACT_TASK = """\
Quyida foydalanuvchining Notion sahifasidan olingan matn (brend pasporti, lansirovka, CustDev, \
blog statistikasi, kurs yoki biznes haqida ma'lumotlar bo'lishi mumkin).

Vazifa: matndan quyidagi savollarga javob topib, `answers` ga yozing (`qid` — savol kodi, `answer` — \
matndagi ma'lumotga asoslangan to'liq javob). Matnda javobi yo'q savollarni qo'shmang, o'zingizdan to'qimang.
Savollarga to'g'ri kelmaydigan, lekin senariylar uchun foydali boshqa muhim faktlarni `notes` ga qisqa-qisqa yozing.

Savollar:
{questions}

Foydalanuvchida allaqachon bor javoblar (yangisi aniqroq bo'lsa, almashtiring):
{existing}

Notion matni:
{text}
"""

IMAGE_TASK = """\
Bu Instagram statistikasi yoki boshqa ma'lumot skrinshoti. Undagi barcha raqam va ma'lumotlarni \
o'zbek tilida, aniq va qisqa matn ko'rinishida yozing (masalan: "Yosh: 18–24 — 35%, 25–34 — 41%; \
Ayollar 62%; Shaharlar: Toshkent 48%..."). Hech narsa qo'shmang.
Savol konteksti: {question}
"""
