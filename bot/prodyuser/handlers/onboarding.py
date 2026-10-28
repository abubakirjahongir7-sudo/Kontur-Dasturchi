"""Start: brend pasporti, lansirovka, CustDev va blog bo'yicha savollar,
keyin AI aniqlashtiruvchi savollar (2 ta variant) va kontent strategiya."""

import logging
from html import escape as e
from io import BytesIO

from aiogram import Bot, F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message
from aiogram.utils.chat_action import ChatActionSender

from .. import db, keyboards, render, services
from ..llm import LLMError
from ..questions import ALL_IDS, BY_ID, SECTIONS, position
from ..states import Clarify, Setup

log = logging.getLogger(__name__)
router = Router(name="onboarding")


# ---------- savollar ketma-ketligi ----------


async def start_questions(bot: Bot, chat_id: int, uid: int, state: FSMContext,
                          mode: str = "full", ids: list[str] | None = None) -> None:
    if ids is None:
        answers = (await db.get_profile(uid))["answers"]
        ids = [q for q in ALL_IDS if q not in answers]
    await db.update_user(uid, pending_q=ids, onb_mode=mode)
    await ask_next(bot, chat_id, uid, state)


async def ask_next(bot: Bot, chat_id: int, uid: int, state: FSMContext) -> None:
    user = await db.get_user(uid)
    if not user:
        return
    if not user["pending_q"]:
        await finish_questions(bot, chat_id, uid, user["onb_mode"] or "full", state)
        return
    q = BY_ID[user["pending_q"][0]]
    i, n = position(q.id)
    title, desc = SECTIONS[q.section]
    text = f"<b>{title}</b> · {i}/{n}\n"
    if i == 1:
        text += f"<i>{e(desc)}</i>\n"
    text += f"\n❓ {e(q.text)}"
    if q.hint:
        text += f"\n<i>💡 {e(q.hint)}</i>"
    if user["onb_mode"] == "edit":
        current = (await db.get_profile(uid))["answers"].get(q.id)
        if current:
            text += f"\n\n📌 Hozirgi javob: <i>{e(current[:500])}</i>"
    await bot.send_message(chat_id, text, reply_markup=keyboards.question_kb(q))


async def save_answer(uid: int, qid: str, value: str, skip: bool = False) -> bool:
    """Javobni saqlaydi. Savol allaqachon o'tib ketgan bo'lsa (eski tugma) — False.
    O'tkazib yuborilganda eski javob bo'lsa, u saqlanib qoladi."""
    user = await db.get_user(uid)
    if not user or not user["pending_q"] or user["pending_q"][0] != qid:
        return False
    if not skip or not (await db.get_profile(uid))["answers"].get(qid):
        await db.set_answer(uid, qid, value)
    await db.update_user(uid, pending_q=user["pending_q"][1:])
    return True


async def finish_questions(bot: Bot, chat_id: int, uid: int, mode: str, state: FSMContext) -> None:
    await db.update_user(uid, onb_mode=None)
    if mode == "edit":
        await bot.send_message(chat_id, "⏳ Yangi ma'lumotlar asosida strategiyani yangilayapman...")
        try:
            async with ChatActionSender.typing(bot=bot, chat_id=chat_id):
                st = await services.build_strategy(uid)
        except LLMError as err:
            await bot.send_message(chat_id, f"⚠️ {err}\nKeyinroq «👤 Profilim» → «🔄 Strategiyani qayta tuzish».")
            return
        await bot.send_message(chat_id, "✅ Profil yangilandi.", reply_markup=keyboards.main_menu())
        for part in render.split(render.strategy_html(st)):
            await bot.send_message(chat_id, part)
        return

    await bot.send_message(chat_id, "🧐 Rahmat! Javoblaringizni chuqur o'rganyapman, kamchiliklarni qidiryapman...")
    try:
        async with ChatActionSender.typing(bot=bot, chat_id=chat_id):
            review = await services.review_profile(uid)
    except LLMError as err:
        await bot.send_message(chat_id, f"⚠️ {err}\n/start bosib qayta urinib ko'ring.")
        return

    text = f"📋 <b>Sizni shunday tushundim:</b>\n{e(review.summary)}"
    if review.gaps:
        text += "\n\n🔎 <b>Aniqlashtirish kerak:</b>\n" + "\n".join(f"• {e(g)}" for g in review.gaps)
    await bot.send_message(chat_id, text)

    questions = [q.model_dump() for q in review.questions]
    if questions:
        await state.set_state(Clarify.choosing)
        await state.update_data(cq=questions, ci=0)
        await bot.send_message(chat_id, f"Yana {len(questions)} ta qisqa savol — har biriga mos variantni tanlang 👇")
        await ask_clarify(bot, chat_id, state)
    else:
        await finalize(bot, chat_id, uid, state)


# ---------- aniqlashtiruvchi savollar (2 ta variant) ----------


async def ask_clarify(bot: Bot, chat_id: int, state: FSMContext) -> None:
    data = await state.get_data()
    q = data["cq"][data["ci"]]
    text = f"❓ <b>{e(q['question'])}</b>\n\n<b>A)</b> {e(q['option_a'])}\n<b>B)</b> {e(q['option_b'])}"
    if q.get("why"):
        text += f"\n\n<i>💡 {e(q['why'])}</i>"
    await state.set_state(Clarify.choosing)
    await bot.send_message(chat_id, text, reply_markup=keyboards.clarify_kb(q["option_a"], q["option_b"]))


async def clarify_answer(bot: Bot, chat_id: int, uid: int, state: FSMContext, answer: str | None) -> None:
    data = await state.get_data()
    q = data["cq"][data["ci"]]
    if answer:
        await services.add_note(uid, f"{q['question']} — {answer}")
    ci = data["ci"] + 1
    if ci < len(data["cq"]):
        await state.update_data(ci=ci)
        await ask_clarify(bot, chat_id, state)
    else:
        await state.clear()
        await finalize(bot, chat_id, uid, state)


async def finalize(bot: Bot, chat_id: int, uid: int, state: FSMContext) -> None:
    await bot.send_message(chat_id, "🧭 Endi siz uchun kontent strategiya tuzyapman. Bu biroz vaqt oladi...")
    try:
        async with ChatActionSender.typing(bot=bot, chat_id=chat_id):
            st = await services.build_strategy(uid)
    except LLMError as err:
        await bot.send_message(chat_id, f"⚠️ {err}\n/start bosib qayta urinib ko'ring.")
        return
    await db.update_user(uid, onboarding_done=1, pending_q=[])
    parts = render.split(render.strategy_html(st))
    for i, part in enumerate(parts):
        last = i == len(parts) - 1
        await bot.send_message(chat_id, part, reply_markup=keyboards.inline(
            [("📝 Profil va strategiyani Notion'ga saqlash", "prof:notion")]) if last else None)
    await bot.send_message(chat_id, "✅ Sizni to'liq o'rganib chiqdim! Endi oxirgi sozlamalar.",
                           reply_markup=keyboards.main_menu())
    await state.set_state(Setup.times)
    await state.update_data(onboarding=True)
    await bot.send_message(
        chat_id,
        "🕒 <b>Senariylarni har kuni qaysi vaqtda yuboray?</b>\n"
        "Tugmani tanlang yoki o'zingiz yozing (bir nechta bo'lsa vergul bilan): <code>09:00, 18:30</code>",
        reply_markup=keyboards.times_kb(),
    )


# ---------- handlerlar ----------


@router.callback_query(F.data == "onb:start")
async def onb_start(cb: CallbackQuery, bot: Bot, state: FSMContext) -> None:
    await cb.answer()
    await state.clear()
    await cb.message.answer(
        "Boshladik! Savollar 4 bo'limdan iborat. Qanchalik batafsil yozsangiz, senariylar shunchalik aniq bo'ladi.\n"
        "Bilmasangiz yoki keyinroq yozmoqchi bo'lsangiz — <b>«⏭ O'tkazib yuborish»</b>. "
        "Statistikani skrinshot qilib ham yuborishingiz mumkin."
    )
    await start_questions(bot, cb.message.chat.id, cb.from_user.id, state)


@router.callback_query(F.data.startswith("oa:"))
async def option_answer(cb: CallbackQuery, bot: Bot, state: FSMContext) -> None:
    _, qid, idx = cb.data.split(":")
    q = BY_ID.get(qid)
    if not q or not await save_answer(cb.from_user.id, qid, q.options[int(idx)]):
        await cb.answer("Bu savol allaqachon o'tdi")
        return
    await cb.answer(q.options[int(idx)])
    await cb.message.edit_reply_markup(reply_markup=None)
    await cb.message.answer(f"✔️ {e(q.options[int(idx)])}")
    await ask_next(bot, cb.message.chat.id, cb.from_user.id, state)


@router.callback_query(F.data.startswith("oskip:"))
async def option_skip(cb: CallbackQuery, bot: Bot, state: FSMContext) -> None:
    qid = cb.data.split(":", 1)[1]
    if not await save_answer(cb.from_user.id, qid, "", skip=True):
        await cb.answer("Bu savol allaqachon o'tdi")
        return
    await cb.answer("O'tkazildi")
    await cb.message.edit_reply_markup(reply_markup=None)
    await ask_next(bot, cb.message.chat.id, cb.from_user.id, state)


@router.callback_query(Clarify.choosing, F.data.in_({"cl:a", "cl:b", "cl:skip"}))
async def clarify_choice(cb: CallbackQuery, bot: Bot, state: FSMContext) -> None:
    data = await state.get_data()
    q = data["cq"][data["ci"]]
    answer = {"cl:a": q["option_a"], "cl:b": q["option_b"]}.get(cb.data)
    await cb.answer()
    await cb.message.edit_reply_markup(reply_markup=None)
    await cb.message.answer(f"✔️ {e(answer)}" if answer else "⏭ O'tkazildi")
    await clarify_answer(bot, cb.message.chat.id, cb.from_user.id, state, answer)


@router.callback_query(Clarify.choosing, F.data == "cl:own")
async def clarify_own(cb: CallbackQuery, state: FSMContext) -> None:
    await cb.answer()
    await cb.message.edit_reply_markup(reply_markup=None)
    await state.set_state(Clarify.own)
    await cb.message.answer("✍️ Javobingizni yozing:")


@router.message(Clarify.own, F.text)
async def clarify_own_text(message: Message, bot: Bot, state: FSMContext) -> None:
    await clarify_answer(bot, message.chat.id, message.from_user.id, state, message.text.strip())


@router.message(StateFilter(None), F.text, ~F.text.startswith("/"))
async def text_answer(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    if not user["pending_q"]:
        await message.answer("Quyidagi menyudan tanlang 👇", reply_markup=keyboards.main_menu()
                             if user["onboarding_done"] else None)
        return
    await save_answer(user["id"], user["pending_q"][0], message.text.strip())
    await ask_next(bot, message.chat.id, user["id"], state)


@router.message(StateFilter(None), F.photo)
async def photo_answer(message: Message, bot: Bot, state: FSMContext, user: dict) -> None:
    if not user["pending_q"]:
        await message.answer("Rasmni qaysi maqsadda yubordingiz? Video statistikasi bo'lsa — "
                             "«📊 Analitika yuborish» ni bosing.")
        return
    qid = user["pending_q"][0]
    buf = BytesIO()
    await bot.download(message.photo[-1], destination=buf)
    await message.answer("🔍 Skrinshotni o'qiyapman...")
    try:
        async with ChatActionSender.typing(bot=bot, chat_id=message.chat.id):
            text = await services.read_image([(buf.getvalue(), "image/jpeg")], BY_ID[qid].text)
    except LLMError as err:
        await message.answer(f"⚠️ {err} Javobni matn bilan yozib yuboring.")
        return
    if message.caption:
        text = f"{message.caption.strip()}\n{text}"
    if await save_answer(user["id"], qid, text):
        await message.answer(f"✔️ Skrinshotdan olindi:\n<i>{e(text[:1500])}</i>")
    await ask_next(bot, message.chat.id, user["id"], state)
