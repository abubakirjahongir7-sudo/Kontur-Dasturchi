"""Start bosilganda beriladigan savollar: 4 bo'lim.
`options` bo'lsa — tez javob tugmalari chiqadi, lekin foydalanuvchi o'zi ham yozishi mumkin."""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Question:
    id: str
    section: str
    text: str
    hint: str = ""
    options: tuple[str, ...] = field(default_factory=tuple)


SECTIONS: dict[str, tuple[str, str]] = {
    "brand": ("1️⃣ Brend pasporti", "Siz kimsiz, nima taklif qilasiz va nimasi bilan alohidasiz."),
    "launch": ("2️⃣ Lansirovka (ishga tushirish)", "Nimani sotyapsiz yoki ishga tushiryapsiz va maqsad qanday."),
    "custdev": ("3️⃣ CustDev — mijozni o'rganish", "Auditoriyangiz kim, nimadan qiynaladi va nimani xohlaydi."),
    "blog": ("4️⃣ Blog — hozir qayerdasiz", "Sahifangiz holati, sizni kimlar va qancha odam ko'ryapti."),
}

QUESTIONS: tuple[Question, ...] = (
    # --- 1. Brend pasporti ---
    Question("brand_name", "brand", "Ismingiz va brendingiz/biznesingiz nomi?",
             "Masalan: Jahongir, «Kontur Dasturchi»"),
    Question("brand_type", "brand", "Bu shaxsiy brendmi yoki kompaniya/biznes sahifasimi?",
             options=("Shaxsiy brend", "Biznes / kompaniya", "Ikkalasi")),
    Question("niche", "brand", "Qaysi sohada faoliyat yuritasiz? Iloji boricha aniq yozing.",
             "Masalan: «bolalar uchun ingliz tili kurslari», «Toshkentdagi milliy taomlar kafesi»"),
    Question("product", "brand", "Aynan nima sotasiz yoki taklif qilasiz? Asosiy mahsulot/xizmatlar va narxlari.",
             "Mahsulot nomi, narxi, formati (onlayn/oflayn), kimga mo'ljallangan"),
    Question("usp", "brand", "Sizni raqobatchilardan nima ajratib turadi? Nega mijoz aynan sizni tanlashi kerak?"),
    Question("story", "brand", "Shaxsiy hikoyangiz yoki brend tarixi: qanday boshlagansiz, qanday natijalarga erishgansiz?",
             "Ishonch uyg'otadigan raqamlar, keyslar, tajriba yillari, mijozlar soni"),
    Question("values", "brand", "Brendingiz qadriyatlari va missiyasi nima? Nimaga ishonasiz, nimaga qarshisiz?"),
    Question("tone", "brand", "Videolardagi muloqot uslubingiz qanday bo'lishi kerak?",
             options=("Do'stona va hazilkash", "Ekspert va jiddiy", "Motivatsion va energik", "Sokin va samimiy")),
    Question("competitors", "brand", "Raqobatchilaringiz yoki sizga yoqadigan blogerlar kimlar? Ularda nima yoqadi/yoqmaydi?",
             "Instagram username'larini yozsangiz yaxshi"),
    # --- 2. Lansirovka ---
    Question("launch_product", "launch", "Hozir nimani ishga tushiryapsiz yoki sotmoqchisiz?",
             "Kurs, yangi mahsulot, xizmat, filial, aksiya..."),
    Question("launch_date", "launch", "Qachon? Start sanasi yoki muddati bormi?",
             options=("Allaqachon sotilyapti", "1 oy ichida", "2–3 oyda", "Hali aniq emas")),
    Question("launch_goal", "launch", "Aniq maqsad nima? Raqamlarda yozing.",
             "Masalan: 1 oyda 50 ta sotuv, 10 000 obunachi, 100 ta ariza"),
    Question("offer", "launch", "Mijozga qanday taklif (offer) berasiz? Narx, bonus, chegirma, kafolat?"),
    Question("funnel", "launch", "Mijoz qayerda ariza qoldiradi yoki xarid qiladi?",
             options=("Instagram Direct", "Telegram", "Sayt", "Telefon qo'ng'iroq")),
    Question("lead_magnet", "launch", "Bepul foydali narsa (lid-magnit) bormi?",
             "Masalan: bepul dars, chek-list, bepul konsultatsiya, namuna"),
    Question("resources", "launch", "Kontent uchun resurslaringiz: kim suratga oladi, montaj kim qiladi, haftasiga nechta video qila olasiz?"),
    # --- 3. CustDev ---
    Question("audience_demo", "custdev", "Ideal mijozingiz kim? Yoshi, jinsi, shahri, kasbi, daromadi.",
             "Masalan: 25–35 yosh, ayollar, Toshkent, ofisda ishlaydi, o'rta daromad"),
    Question("audience_pains", "custdev", "Ularning eng katta muammolari va og'riqlari nima?",
             "Mijozlar o'z so'zlari bilan qanday aytishini yozsangiz — senariylar ancha kuchli chiqadi"),
    Question("audience_desires", "custdev", "Ular nimani orzu qiladi? Siz bilan ishlagandan keyin qanday natija olishni xohlaydi?"),
    Question("audience_objections", "custdev", "Sotib olishdan oldin qanday e'tirozlar yoki qo'rquvlar bo'ladi?",
             "Masalan: «qimmat», «vaqtim yo'q», «menga to'g'ri kelmaydi», «ishonmayman»"),
    Question("audience_questions", "custdev", "Mijozlar sizga eng ko'p qanday savollar beradi?"),
    Question("audience_where", "custdev", "Ular yana qayerda vaqt o'tkazadi, kimlarni kuzatadi, nimalarga qiziqadi?"),
    # --- 4. Blog ---
    Question("ig_username", "blog", "Instagram sahifangiz username'i?", "Masalan: @kontur.dasturchi"),
    Question("followers", "blog", "Hozir nechta obunachingiz bor?"),
    Question("avg_views", "blog", "Reels'laringiz o'rtacha nechta ko'rish oladi? Eng yaxshisi nechta bo'lgan?"),
    Question("current_audience", "blog", "Hozir sizni kimlar ko'ryapti? (Statistika → Auditoriya: yosh, jins, shaharlar)",
             "Raqamlarni yozing yoki statistika skrinshotini rasm qilib yuboring"),
    Question("best_content", "blog", "Qaysi videolaringiz eng yaxshi natija bergan va nima uchun deb o'ylaysiz? Qaysilari ishlamagan?"),
    Question("content_now", "blog", "Hozir qanday kontent qilyapsiz va qanchalik tez-tez joylaysiz?"),
    Question("face", "blog", "Videolarda yuzingizni ko'rsatasizmi?",
             options=("Ha, kameraga gapiraman", "Faqat ovoz", "Yuzsiz (matn / b-roll)", "Turlicha")),
    Question("content_language", "blog", "Videolar qaysi tilda bo'ladi?",
             options=("O'zbekcha", "Ruscha", "O'zbekcha + ruscha", "Inglizcha")),
    Question("blog_goal", "blog", "Blogdan hozir asosan nima kutyapsiz?",
             options=("Ko'proq ko'rishlar", "Obunachilar", "Mijozlar va sotuv", "Hammasi")),
)

BY_ID: dict[str, Question] = {q.id: q for q in QUESTIONS}
ALL_IDS: list[str] = [q.id for q in QUESTIONS]


def section_ids(section: str) -> list[str]:
    return [q.id for q in QUESTIONS if q.section == section]


def position(qid: str) -> tuple[int, int]:
    """(savol tartib raqami bo'lim ichida, bo'limdagi savollar soni)"""
    ids = section_ids(BY_ID[qid].section)
    return ids.index(qid) + 1, len(ids)
