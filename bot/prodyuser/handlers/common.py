"""/start, /help, /cancel va asosiy menyu tugmalari.
Bu router birinchi ulanadi: menyu tugmasi bosilsa, har qanday holatdan chiqib, kerakli bo'limga o'tadi."""

from html import escape as e

from aiogram import Bot, F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from .. import keyboards as kb
from ..config import config
from . import analytics, notion_h, onboarding, profile, scenarios, settings

router = Router(name="common")

WELCOME = (
    "👋 Salom, {name}!\n\n"
    "Men — <b>Instagram uchun shaxsiy AI prodyuseringizman</b>. Qaysi sohada bo'lishingizdan qat'i nazar:\n\n"
    "🧠 Biznesingizni, brendingizni va auditoriyangizni to'liq o'rganaman\n"
    "🎬 Ko'rishlar, obunachilar va mijozlar oqimini oshiradigan unikal senariylar yozaman\n"
    "⏰ Ularni siz belgilagan vaqtda, kerakli sonda yuborib turaman\n"
    "📊 Video joylangach statistikasini tahlil qilaman — natija bo'lmasa senariyni qaytadan mukammal yozaman\n"
    "📝 Senariylarni Notion'ga yozaman va Notion'dagi ma'lumotlaringizni o'qiyman\n\n"
    "Boshlash uchun sizni yaxshilab tanib olishim kerak: <b>brend pasporti, lansirovka, CustDev va blog</b> "
    "bo'yicha savollar beraman. Ma'lumotlaringiz Notion'da yozilgan bo'lsa — avval o'shani o'qib olaman."
)

HELP = (
    "❓ <b>Qanday ishlaydi</b>\n\n"
    f"<b>{kb.BTN_SCENARIO}</b> — hoziroq senariy tayyorlash (sonini yoki mavzusini tanlaysiz).\n"
    f"<b>{kb.BTN_ANALYTICS}</b> — video statistikasini (skrinshot yoki raqamlar) yuborib, tahlil olish. "
    "Natija past bo'lsa, senariy avtomatik qayta yoziladi.\n"
    f"<b>{kb.BTN_LIST}</b> — barcha senariylaringiz.\n"
    f"<b>{kb.BTN_PROFILE}</b> — brend ma'lumotlari va kontent strategiya, bo'limlarni yangilash.\n"
    f"<b>{kb.BTN_SETTINGS}</b> — senariylar qaysi vaqtda va nechta kelishi, vaqt zonasi.\n"
    f"<b>{kb.BTN_NOTION}</b> — Notion'ni ulash va undan ma'lumot o'qish.\n\n"
    "<b>Senariy ostidagi tugmalar:</b>\n"
    "📝 Notion'ga yoz — har safar qaysi sahifaga yozishni so'rayman\n"
    "✏️ Qayta yoz — izohingiz bo'yicha yangi versiya\n"
    f"🎬 Joyladim — {config.reminder_hours} soatdan keyin statistikani so'rayman\n"
    "📊 Analitika — statistikani hoziroq yuborish\n\n"
    "Har bir tahlildan keyin bot saboq oladi va keyingi senariylar sizning auditoriyangizga yanada moslashadi.\n"
    "/cancel — joriy amalni bekor qilish"
)


async def _ready(message: Message, bot: Bot, state: FSMContext, user: dict) -> bool:
    """Profil to'ldirilmagan bo'lsa, menyudan foydalanishdan oldin savollarga qaytaradi."""
    if user["onboarding_done"]:
        return True
    await state.clear()
    await message.answer("Avval sizni yaxshilab tanib olishim kerak 🙂")
    if user["pending_q"]:
        await onboarding.ask_next(bot, message.chat.id, user["id"], state)
    else:
        await message.answer("Qanday boshlaymiz?", reply_markup=kb.onboarding_intro())
    return False


@router.message(CommandStart())
async def cmd_start(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    await state.clear()
    name = e(message.from_user.first_name or "")
    if user["onboarding_done"]:
        await message.answer(f"👋 Qaytganingizdan xursandman, {name}! Menyudan tanlang 👇",
                             reply_markup=kb.main_menu())
        return
    if user["pending_q"]:
        await message.answer("👋 To'xtagan joyimizdan davom etamiz 👇")
        await onboarding.ask_next(bot, message.chat.id, user["id"], state)
        return
    await message.answer(WELCOME.format(name=name))
    await message.answer("Qanday boshlaymiz?", reply_markup=kb.onboarding_intro())


@router.message(Command("help"))
@router.message(F.text == kb.BTN_HELP)
async def cmd_help(message: Message) -> None:
    await message.answer(HELP)


@router.message(Command("cancel"))
async def cmd_cancel(message: Message, state: FSMContext, user: dict) -> None:
    await state.clear()
    await message.answer("Bekor qilindi.", reply_markup=kb.main_menu() if user["onboarding_done"] else None)


@router.callback_query(F.data == "cancel")
async def cb_cancel(cb: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await cb.answer("Bekor qilindi")
    await cb.message.edit_reply_markup(reply_markup=None)


@router.message(Command("menu"))
async def cmd_menu(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    if await _ready(message, bot, state, user):
        await state.clear()
        await message.answer("Menyu 👇", reply_markup=kb.main_menu())


@router.message(F.text == kb.BTN_SCENARIO)
async def menu_scenario(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    if await _ready(message, bot, state, user):
        await state.clear()
        await scenarios.show_gen_menu(message)


@router.message(F.text == kb.BTN_ANALYTICS)
async def menu_analytics(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    if await _ready(message, bot, state, user):
        await state.clear()
        await analytics.show_pick(message, user["id"])


@router.message(F.text == kb.BTN_LIST)
async def menu_list(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    if await _ready(message, bot, state, user):
        await state.clear()
        await scenarios.show_list(message, user["id"])


@router.message(F.text == kb.BTN_PROFILE)
async def menu_profile(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    if await _ready(message, bot, state, user):
        await state.clear()
        await profile.show_profile(message, user["id"])


@router.message(F.text == kb.BTN_SETTINGS)
async def menu_settings(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    if await _ready(message, bot, state, user):
        await state.clear()
        await settings.show_settings(message, user["id"])


@router.message(F.text == kb.BTN_NOTION)
async def menu_notion(message: Message, state: FSMContext, user: dict) -> None:
    await state.clear()
    await notion_h.show_menu(message, user)
