"""Notion: tokenni ulash, sahifadan ma'lumot o'qish va senariy/profilni yozish."""

from html import escape as e

from aiogram import Bot, F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message
from aiogram.utils.chat_action import ChatActionSender

from .. import db, keyboards, render, services
from ..llm import LLMError
from ..notion import Notion, NotionError, parse_id
from ..states import NotionSt
from .onboarding import start_questions

router = Router(name="notion")

HOW_TO = (
    "🔗 <b>Notion'ni ulash (1 marta, 2 daqiqa):</b>\n\n"
    "1. <a href=\"https://www.notion.so/profile/integrations\">notion.so/profile/integrations</a> → "
    "<b>«New integration»</b> → nom bering (masalan, «Prodyuser bot») → workspace'ni tanlang → <b>Save</b>.\n"
    "2. <b>«Internal Integration Secret»</b> ni nusxalab (<code>ntn_...</code>) shu botga yuboring.\n"
    "3. Notion'da bot ishlashi kerak bo'lgan sahifani oching → o'ng yuqoridagi <b>«•••»</b> → "
    "<b>«Connections»</b> → integratsiyangizni qo'shing. Ichidagi sahifalar ham avtomatik ochiladi.\n"
    "4. Sahifa havolasini olish: <b>«Share» → «Copy link»</b>.\n\n"
    "🔒 Tokeningiz faqat sizning Notion'ingiz uchun ishlatiladi, boshqa foydalanuvchilar unga kira olmaydi."
)


async def show_menu(message: Message, user: dict) -> None:
    has = bool(services.notion_token(user))
    status = "✅ Ulangan" if has else "❌ Ulanmagan"
    text = (
        f"📎 <b>Notion</b> — {status}\n\n"
        "• <b>O'qish:</b> brend pasporti, kurs/biznes haqidagi ma'lumotlar, CustDev, statistikani Notion'da yozib "
        "qo'ysangiz, bot o'qib profilingizga qo'shadi.\n"
        "• <b>Yozish:</b> senariy ostidagi «📝 Notion'ga yoz» tugmasi — har safar qaysi sahifaga yozishni so'rayman."
    )
    if user.get("notion_last_title"):
        text += f"\n\nOxirgi sahifa: <b>{e(user['notion_last_title'])}</b>"
    await message.answer(text, reply_markup=keyboards.notion_menu_kb(has), disable_web_page_preview=True)


async def _need_token(message: Message, state: FSMContext, after: str, **data) -> None:
    await state.set_state(NotionSt.token)
    await state.update_data(after=after, **data)
    await message.answer("Avval Notion'ni ulaymiz.\n\n" + HOW_TO, reply_markup=keyboards.cancel_kb(),
                         disable_web_page_preview=True)


async def ask_import_link(message: Message, state: FSMContext, onboarding: bool = False) -> None:
    await state.set_state(NotionSt.import_link)
    await state.update_data(onboarding=onboarding)
    await message.answer(
        "📥 Ma'lumotlar yozilgan Notion sahifasi havolasini yuboring.\n"
        "<i>Brend pasporti, lansirovka, CustDev, blog statistikasi, kurs yoki biznes haqidagi sahifa. "
        "Ichki sahifalar va jadvallarni ham o'qiyman.</i>",
        reply_markup=keyboards.cancel_kb(),
    )


async def ask_target(message: Message, state: FSMContext, user: dict, kind: str, ident: int = 0) -> None:
    if not services.notion_token(user):
        await _need_token(message, state, after="write", kind=kind, ident=ident)
        return
    await state.set_state(NotionSt.target)
    await state.update_data(kind=kind, ident=ident)
    await message.answer(
        "📝 <b>Qaysi Notion sahifasiga yozay?</b>\nSahifa havolasini yuboring (Share → Copy link). "
        "Uning ichida yangi sahifa ochaman.",
        reply_markup=keyboards.notion_target_kb(user.get("notion_last_title")),
    )


async def _write(message: Message, bot: Bot, state: FSMContext, user: dict, target_id: str) -> None:
    data = await state.get_data()
    await state.clear()
    uid = user["id"]
    if data.get("kind") == "scenario":
        s = await db.get_scenario(data["ident"], uid)
        if not s:
            await message.answer("Senariy topilmadi.")
            return
        report = await db.latest_report(s["id"], uid)
        v = f" (v{s['version']})" if s["version"] > 1 else ""
        title = f"🎬 #{s['id']} {s['title']}{v}"
        blocks = render.scenario_blocks(s["data"], report)
    else:
        p = await db.get_profile(uid)
        name = p["answers"].get("brand_name") or user.get("first_name") or ""
        title = f"👤 Brend profili va strategiya — {name}"[:150]
        blocks = render.profile_blocks(p["answers"], p["notes"], p["strategy"])
    try:
        async with ChatActionSender.typing(bot=bot, chat_id=message.chat.id):
            target, url = await services.notion_write(user, target_id, title, blocks)
    except NotionError as err:
        await message.answer(f"⚠️ {e(str(err))}")
        return
    if data.get("kind") == "scenario":
        await db.update_scenario(data["ident"], uid, notion_url=url)
    await message.answer(f"✅ Notion'ga yozildi: <a href=\"{e(url)}\">{e(title)}</a>\n📂 {e(target.title)}",
                         disable_web_page_preview=True)


# ---------- menyu tugmalari ----------


@router.callback_query(F.data == "nt:help")
async def nt_help(cb: CallbackQuery) -> None:
    await cb.answer()
    await cb.message.answer(HOW_TO, disable_web_page_preview=True)


@router.callback_query(F.data == "nt:token")
async def nt_token(cb: CallbackQuery, state: FSMContext) -> None:
    await cb.answer()
    await state.set_state(NotionSt.token)
    await state.update_data(after=None)
    await cb.message.answer("🔑 Integratsiya tokenini (<code>ntn_...</code>) yuboring.\n\n" + HOW_TO,
                            reply_markup=keyboards.cancel_kb(), disable_web_page_preview=True)


@router.callback_query(F.data == "nt:deltoken")
async def nt_deltoken(cb: CallbackQuery) -> None:
    await db.update_user(cb.from_user.id, notion_token=None, notion_last_id=None, notion_last_title=None)
    await cb.answer("O'chirildi")
    await cb.message.answer("🗑 Notion tokeningiz o'chirildi.")


@router.callback_query(F.data == "nt:import")
async def nt_import(cb: CallbackQuery, state: FSMContext, user: dict) -> None:
    await cb.answer()
    if not services.notion_token(user):
        await _need_token(cb.message, state, after="import")
        return
    await ask_import_link(cb.message, state)


@router.callback_query(F.data == "onb:notion")
async def onb_notion(cb: CallbackQuery, state: FSMContext, user: dict) -> None:
    await cb.answer()
    if not services.notion_token(user):
        await _need_token(cb.message, state, after="import", onboarding=True)
        return
    await ask_import_link(cb.message, state, onboarding=True)


@router.callback_query(F.data.startswith("sc:notion:"))
async def sc_notion(cb: CallbackQuery, state: FSMContext, user: dict) -> None:
    sid = int(cb.data.rsplit(":", 1)[1])
    if not await db.get_scenario(sid, cb.from_user.id):
        await cb.answer("Topilmadi")
        return
    await cb.answer()
    await ask_target(cb.message, state, user, "scenario", sid)


@router.callback_query(F.data == "prof:notion")
async def prof_notion(cb: CallbackQuery, state: FSMContext, user: dict) -> None:
    await cb.answer()
    await ask_target(cb.message, state, user, "profile")


# ---------- holatlar ----------


@router.message(NotionSt.token, F.text)
async def got_token(message: Message, state: FSMContext, user: dict) -> None:
    token = message.text.strip()
    try:
        await message.delete()  # token chatda ochiq qolmasin
    except Exception:
        pass
    try:
        await Notion(token).me()
    except NotionError as err:
        await message.answer(f"⚠️ {e(str(err))} Qayta yuboring.", reply_markup=keyboards.cancel_kb())
        return
    await db.update_user(user["id"], notion_token=token)
    user = {**user, "notion_token": token}
    await message.answer("✅ Notion ulandi! (Xavfsizlik uchun token yozilgan xabarni o'chirdim.)")
    data = await state.get_data()
    if data.get("after") == "import":
        await ask_import_link(message, state, onboarding=bool(data.get("onboarding")))
    elif data.get("after") == "write":
        await ask_target(message, state, user, data["kind"], data.get("ident", 0))
    else:
        await state.clear()


@router.message(NotionSt.import_link, F.text)
async def got_import_link(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    page_id = parse_id(message.text)
    if not page_id:
        await message.answer("Bu Notion havolasiga o'xshamaydi. Share → Copy link orqali olingan havolani yuboring.")
        return
    onboarding = bool((await state.get_data()).get("onboarding"))
    await state.clear()
    await message.answer("📖 Notion sahifasini o'qiyapman va ma'lumotlarni ajratyapman...")
    try:
        async with ChatActionSender.typing(bot=bot, chat_id=message.chat.id):
            title, n_answers, n_notes = await services.notion_import(user["id"], services.notion_token(user), page_id)
    except (NotionError, LLMError) as err:
        await message.answer(f"⚠️ {e(str(err))}")
        if onboarding:
            await message.answer("Mayli, savollar orqali davom etamiz.")
            await start_questions(bot, message.chat.id, user["id"], state)
        return
    await message.answer(
        f"✅ <b>{e(title)}</b> o'qildi: {n_answers} ta savolga javob topildi, {n_notes} ta qo'shimcha fakt saqlandi."
    )
    if onboarding or not user["onboarding_done"]:
        await message.answer("Endi qolgan savollarni beraman 👇")
        await start_questions(bot, message.chat.id, user["id"], state)
    else:
        await message.answer("Profilingiz yangilandi. Strategiyani yangi ma'lumotlar bilan qayta tuzaymi?",
                             reply_markup=keyboards.inline([("🔄 Ha, qayta tuz", "prof:strategy")]))


@router.callback_query(NotionSt.target, F.data == "nt:last")
async def target_last(cb: CallbackQuery, bot: Bot, state: FSMContext, user: dict) -> None:
    await cb.answer()
    await cb.message.edit_reply_markup(reply_markup=None)
    if not user.get("notion_last_id"):
        await cb.message.answer("Oxirgi sahifa topilmadi, havolani yuboring.")
        return
    await _write(cb.message, bot, state, user, user["notion_last_id"])


@router.message(NotionSt.target, F.text)
async def target_link(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    page_id = parse_id(message.text)
    if not page_id:
        await message.answer("Bu Notion havolasiga o'xshamaydi. Share → Copy link orqali olingan havolani yuboring.")
        return
    await _write(message, bot, state, user, page_id)
