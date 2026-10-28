from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup
from aiogram.utils.keyboard import ReplyKeyboardBuilder

from .questions import SECTIONS, Question

BTN_SCENARIO = "🎬 Senariy olish"
BTN_ANALYTICS = "📊 Analitika yuborish"
BTN_LIST = "📚 Senariylarim"
BTN_PROFILE = "👤 Profilim"
BTN_SETTINGS = "⚙️ Sozlamalar"
BTN_NOTION = "📎 Notion"
BTN_HELP = "❓ Yordam"
MENU_BUTTONS = (BTN_SCENARIO, BTN_ANALYTICS, BTN_LIST, BTN_PROFILE, BTN_SETTINGS, BTN_NOTION, BTN_HELP)

TIME_PRESETS = ("08:00", "09:00", "12:00", "18:00", "20:00", "21:00")
TZ_PRESETS = ("Asia/Tashkent", "Asia/Almaty", "Europe/Moscow", "Asia/Dubai", "Europe/Istanbul")


def main_menu() -> ReplyKeyboardMarkup:
    kb = ReplyKeyboardBuilder()
    for b in MENU_BUTTONS:
        kb.button(text=b)
    kb.adjust(2, 2, 2, 1)
    return kb.as_markup(resize_keyboard=True)


def inline(*rows: list[tuple[str, str]]) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=t, callback_data=d) for t, d in row] for row in rows
    ])


def onboarding_intro() -> InlineKeyboardMarkup:
    return inline(
        [("📝 Savollarga javob beraman", "onb:start")],
        [("📎 Avval Notion'dan o'qib ol", "onb:notion")],
    )


def question_kb(q: Question) -> InlineKeyboardMarkup:
    rows = [[(opt, f"oa:{q.id}:{i}")] for i, opt in enumerate(q.options)]
    rows.append([("⏭ O'tkazib yuborish", f"oskip:{q.id}")])
    return inline(*rows)


def clarify_kb(option_a: str, option_b: str) -> InlineKeyboardMarkup:
    return inline(
        [(f"A) {option_a}"[:60], "cl:a")],
        [(f"B) {option_b}"[:60], "cl:b")],
        [("✍️ O'zim yozaman", "cl:own"), ("⏭ O'tkazish", "cl:skip")],
    )


def scenario_kb(sid: int) -> InlineKeyboardMarkup:
    return inline(
        [("📝 Notion'ga yoz", f"sc:notion:{sid}"), ("✏️ Qayta yoz", f"sc:rewrite:{sid}")],
        [("🎬 Joyladim", f"sc:posted:{sid}"), ("📊 Analitika", f"sc:an:{sid}")],
    )


def gen_count_kb(prefix: str = "gen") -> InlineKeyboardMarkup:
    rows = [[("1 ta", f"{prefix}:1"), ("2 ta", f"{prefix}:2"), ("3 ta", f"{prefix}:3")]]
    if prefix == "gen":
        rows.append([("🎯 Ma'lum mavzu bo'yicha", "gen:wish")])
    return inline(*rows)


def times_kb() -> InlineKeyboardMarkup:
    return inline(
        [(t, f"tm:{t}") for t in TIME_PRESETS[:3]],
        [(t, f"tm:{t}") for t in TIME_PRESETS[3:]],
        [("☀️ 09:00 + 🌙 19:00", "tm:09:00,19:00")],
    )


def count_kb() -> InlineKeyboardMarkup:
    return inline([(str(n), f"cnt:{n}") for n in range(1, 6)])


def tz_kb() -> InlineKeyboardMarkup:
    return inline(*[[(tz, f"tz:{tz}")] for tz in TZ_PRESETS])


def settings_kb(paused: bool) -> InlineKeyboardMarkup:
    return inline(
        [("🕒 Vaqtlar", "set:times"), ("🔢 Soni", "set:count")],
        [("🌍 Vaqt zonasi", "set:tz"), ("▶️ Davom ettirish" if paused else "⏸ To'xtatish", "set:pause")],
    )


def profile_kb() -> InlineKeyboardMarkup:
    return inline(
        [("✏️ Bo'limni yangilash", "prof:edit"), ("🧭 Strategiya", "prof:showstrat")],
        [("🔄 Strategiyani qayta tuzish", "prof:strategy")],
        [("📝 Notion'ga saqlash", "prof:notion")],
        [("🗑 Hammasini o'chirish", "prof:reset")],
    )


def sections_kb() -> InlineKeyboardMarkup:
    return inline(*[[(title, f"edit:{key}")] for key, (title, _) in SECTIONS.items()])


def notion_menu_kb(has_token: bool) -> InlineKeyboardMarkup:
    rows = [[("📥 Notion'dan ma'lumot o'qish", "nt:import")],
            [("🔑 Tokenni almashtirish" if has_token else "🔑 Notion'ni ulash", "nt:token")],
            [("❓ Qanday ulanadi", "nt:help")]]
    if has_token:
        rows.append([("🗑 Tokenni o'chirish", "nt:deltoken")])
    return inline(*rows)


def notion_target_kb(last_title: str | None) -> InlineKeyboardMarkup:
    rows = []
    if last_title:
        rows.append([(f"📌 Oxirgi: {last_title}"[:60], "nt:last")])
    rows.append([("❌ Bekor qilish", "cancel")])
    return inline(*rows)


def analytics_kb() -> InlineKeyboardMarkup:
    return inline([("✅ Tahlil qil", "an:go"), ("❌ Bekor qilish", "cancel")])


def cancel_kb() -> InlineKeyboardMarkup:
    return inline([("❌ Bekor qilish", "cancel")])
