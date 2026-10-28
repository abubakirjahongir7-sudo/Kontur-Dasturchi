"""Senariy olish, qayta yozish, «Joyladim» belgisi va senariylar ro'yxati."""

from functools import partial
from html import escape

from aiogram import Bot, F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message
from aiogram.utils.chat_action import ChatActionSender

from .. import db, keyboards, services
from ..config import config
from ..llm import LLMError
from ..states import Gen, Rewrite

# Telegram HTML uchun faqat <, > va & ni ekranlash kifoya — apostroflar o'z holicha qoladi
e = partial(escape, quote=False)

router = Router(name="scenarios")

STATUS = {"new": "🆕", "posted": "🎬", "analyzed": "📊"}
PAGE = 8


async def show_gen_menu(message: Message) -> None:
    await message.answer("Nechta senariy tayyorlay?", reply_markup=keyboards.gen_count_kb())


async def run_generation(bot: Bot, chat_id: int, uid: int, count: int, wish: str | None = None) -> None:
    lock = services.user_lock(uid)
    if lock.locked():
        await bot.send_message(chat_id, "⏳ Hozir boshqa senariy ustida ishlayapman, biroz kuting.")
        return
    async with lock:
        await bot.send_message(chat_id, f"✍️ {count} ta senariy yozyapman... Bu 1–2 daqiqa oladi.")
        try:
            async with ChatActionSender.typing(bot=bot, chat_id=chat_id):
                items = await services.generate_scenarios(uid, count, wish)
        except LLMError as err:
            await bot.send_message(chat_id, f"⚠️ {err}")
            return
    for sid, data in items:
        await services.send_scenario(bot, chat_id, sid, data)
    await bot.send_message(
        chat_id,
        "👆 Tekshirib chiqing. <b>Notion'ga yozaymi?</b> — senariy ostidagi «📝 Notion'ga yoz» tugmasi.\n"
        "O'zgartirish kerak bo'lsa — «✏️ Qayta yoz». Video joylagach — «🎬 Joyladim».",
    )


async def show_list(target: Message, uid: int, offset: int = 0, edit: bool = False) -> None:
    items = await db.list_scenarios(uid, PAGE, offset)
    total = await db.count_scenarios(uid)
    if not items:
        await target.answer("Hali senariylar yo'q. «🎬 Senariy olish» ni bosing.")
        return
    rows = [[(f"{STATUS.get(s['status'], '')} #{s['id']} {s['title']}"[:60], f"sc:open:{s['id']}")] for s in items]
    nav = []
    if offset > 0:
        nav.append(("⬅️", f"list:{max(offset - PAGE, 0)}"))
    if offset + PAGE < total:
        nav.append(("➡️", f"list:{offset + PAGE}"))
    if nav:
        rows.append(nav)
    text = f"📚 <b>Senariylaringiz</b> ({total} ta)\n🆕 yangi · 🎬 joylangan · 📊 tahlil qilingan"
    if edit:
        await target.edit_text(text, reply_markup=keyboards.inline(*rows))
    else:
        await target.answer(text, reply_markup=keyboards.inline(*rows))


@router.callback_query(F.data.regexp(r"^gen:\d$"))
async def gen_count(cb: CallbackQuery, bot: Bot, user: dict) -> None:
    await cb.answer()
    if not user["onboarding_done"]:
        return
    await cb.message.edit_reply_markup(reply_markup=None)
    await run_generation(bot, cb.message.chat.id, cb.from_user.id, int(cb.data.split(":")[1]))


@router.callback_query(F.data == "gen:later")
async def gen_later(cb: CallbackQuery) -> None:
    await cb.answer()
    await cb.message.edit_reply_markup(reply_markup=None)
    await cb.message.answer("Yaxshi! Senariylar belgilangan vaqtda keladi. Istalgan payt «🎬 Senariy olish» ni bosing.")


@router.callback_query(F.data == "gen:wish")
async def gen_wish(cb: CallbackQuery, state: FSMContext) -> None:
    await cb.answer()
    await cb.message.edit_reply_markup(reply_markup=None)
    await state.set_state(Gen.wish)
    await cb.message.answer(
        "🎯 Qanday mavzu yoki maqsadda senariy kerak? Yozing.\n"
        "<i>Masalan: «yangi kurs anonsi», «narx haqidagi e'tirozga javob», «trenddagi formatda»</i>",
        reply_markup=keyboards.cancel_kb(),
    )


@router.message(Gen.wish, F.text)
async def gen_wish_text(message: Message, state: FSMContext) -> None:
    await state.update_data(wish=message.text.strip())
    await message.answer("Nechta variant tayyorlay?", reply_markup=keyboards.gen_count_kb("wgen"))


@router.callback_query(Gen.wish, F.data.startswith("wgen:"))
async def gen_wish_count(cb: CallbackQuery, bot: Bot, state: FSMContext) -> None:
    await cb.answer()
    wish = (await state.get_data()).get("wish")
    await state.clear()
    await cb.message.edit_reply_markup(reply_markup=None)
    await run_generation(bot, cb.message.chat.id, cb.from_user.id, int(cb.data.split(":")[1]), wish)


@router.callback_query(F.data.startswith("sc:open:"))
async def open_scenario(cb: CallbackQuery, bot: Bot) -> None:
    sid = int(cb.data.rsplit(":", 1)[1])
    s = await db.get_scenario(sid, cb.from_user.id)
    await cb.answer()
    if s:
        await services.send_scenario(bot, cb.message.chat.id, sid, s["data"], s["version"])
        if s["notion_url"]:
            await cb.message.answer(f"📝 Notion: {e(s['notion_url'])}")


@router.callback_query(F.data.startswith("list:"))
async def list_page(cb: CallbackQuery) -> None:
    await cb.answer()
    await show_list(cb.message, cb.from_user.id, int(cb.data.split(":")[1]), edit=True)


@router.callback_query(F.data.startswith("sc:posted:"))
async def posted(cb: CallbackQuery) -> None:
    sid = int(cb.data.rsplit(":", 1)[1])
    s = await db.get_scenario(sid, cb.from_user.id)
    if not s:
        await cb.answer("Topilmadi")
        return
    await db.update_scenario(sid, cb.from_user.id, status="posted", posted_at=db.now_iso(), reminder_sent=0)
    await cb.answer("Belgilandi 🎬")
    await cb.message.answer(
        f"🎬 Zo'r! <b>«{e(s['title'])}»</b> joylandi.\n"
        f"{config.reminder_hours} soatdan keyin statistikani so'rayman. Oldinroq yubormoqchi bo'lsangiz — "
        "«📊 Analitika» tugmasini bosing."
    )


@router.callback_query(F.data.startswith("sc:rewrite:"))
async def rewrite_start(cb: CallbackQuery, state: FSMContext) -> None:
    sid = int(cb.data.rsplit(":", 1)[1])
    if not await db.get_scenario(sid, cb.from_user.id):
        await cb.answer("Topilmadi")
        return
    await cb.answer()
    await state.set_state(Rewrite.feedback)
    await state.update_data(sid=sid)
    await cb.message.answer(
        f"✏️ #{sid} senariyda nimani o'zgartiray? Yozing (masalan: «hook zerikarli», «qisqaroq», "
        "«yuzimni ko'rsatmasdan»).\nYoki o'zim yaxshilashimni xohlasangiz — tugmani bosing.",
        reply_markup=keyboards.inline([("🎲 O'zing yaxshila", "rw:auto")], [("❌ Bekor qilish", "cancel")]),
    )


async def _do_rewrite(bot: Bot, chat_id: int, uid: int, sid: int, feedback: str | None) -> None:
    lock = services.user_lock(uid)
    if lock.locked():
        await bot.send_message(chat_id, "⏳ Hozir boshqa ish ustidaman, biroz kuting.")
        return
    async with lock:
        await bot.send_message(chat_id, "✍️ Qayta yozyapman...")
        try:
            async with ChatActionSender.typing(bot=bot, chat_id=chat_id):
                new_id, data, version = await services.rewrite_scenario(uid, sid, feedback=feedback)
        except LLMError as err:
            await bot.send_message(chat_id, f"⚠️ {err}")
            return
    await services.send_scenario(bot, chat_id, new_id, data, version)


@router.message(Rewrite.feedback, F.text)
async def rewrite_text(message: Message, bot: Bot, state: FSMContext) -> None:
    sid = (await state.get_data())["sid"]
    await state.clear()
    await _do_rewrite(bot, message.chat.id, message.from_user.id, sid, message.text.strip())


@router.callback_query(Rewrite.feedback, F.data == "rw:auto")
async def rewrite_auto(cb: CallbackQuery, bot: Bot, state: FSMContext) -> None:
    await cb.answer()
    sid = (await state.get_data())["sid"]
    await state.clear()
    await cb.message.edit_reply_markup(reply_markup=None)
    await _do_rewrite(bot, cb.message.chat.id, cb.from_user.id, sid, None)
