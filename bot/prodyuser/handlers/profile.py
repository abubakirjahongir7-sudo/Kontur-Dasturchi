"""Profilni ko'rish, bo'limlarni yangilash, strategiya va ma'lumotlarni o'chirish."""

from aiogram import Bot, F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message, ReplyKeyboardRemove
from aiogram.utils.chat_action import ChatActionSender

from .. import db, keyboards, render, services
from ..llm import LLMError
from ..questions import SECTIONS, section_ids
from .onboarding import start_questions

router = Router(name="profile")


async def show_profile(message: Message, uid: int) -> None:
    p = await db.get_profile(uid)
    parts = render.split(render.profile_html(p["answers"]))
    for i, part in enumerate(parts):
        last = i == len(parts) - 1
        await message.answer(part, reply_markup=keyboards.profile_kb() if last else None)


@router.callback_query(F.data == "prof:edit")
async def prof_edit(cb: CallbackQuery) -> None:
    await cb.answer()
    await cb.message.answer("Qaysi bo'limni qayta to'ldiramiz?", reply_markup=keyboards.sections_kb())


@router.callback_query(F.data.startswith("edit:"))
async def edit_section(cb: CallbackQuery, bot: Bot, state: FSMContext, user: dict) -> None:
    section = cb.data.split(":", 1)[1]
    await cb.answer()
    if section not in SECTIONS or not user["onboarding_done"]:
        return
    await state.clear()
    await cb.message.edit_reply_markup(reply_markup=None)
    await cb.message.answer(f"✏️ <b>{SECTIONS[section][0]}</b> — yangi javoblarni yozing. "
                            "O'zgarmaganini «⏭ O'tkazib yuborish» qiling — eski javob saqlanib qoladi.")
    await start_questions(bot, cb.message.chat.id, cb.from_user.id, state, mode="edit", ids=section_ids(section))


@router.callback_query(F.data == "prof:showstrat")
async def show_strategy(cb: CallbackQuery) -> None:
    await cb.answer()
    st = (await db.get_profile(cb.from_user.id))["strategy"]
    if not st:
        await cb.message.answer("Strategiya hali tuzilmagan.",
                                reply_markup=keyboards.inline([("🔄 Tuzish", "prof:strategy")]))
        return
    for part in render.split(render.strategy_html(st)):
        await cb.message.answer(part)


@router.callback_query(F.data == "prof:strategy")
async def rebuild_strategy(cb: CallbackQuery, bot: Bot) -> None:
    await cb.answer()
    uid = cb.from_user.id
    lock = services.user_lock(uid)
    if lock.locked():
        await cb.message.answer("⏳ Hozir boshqa ish ustidaman, biroz kuting.")
        return
    async with lock:
        await cb.message.answer("🧭 Strategiyani qayta tuzyapman...")
        try:
            async with ChatActionSender.typing(bot=bot, chat_id=cb.message.chat.id):
                st = await services.build_strategy(uid)
        except LLMError as err:
            await cb.message.answer(f"⚠️ {err}")
            return
    for part in render.split(render.strategy_html(st)):
        await cb.message.answer(part)


@router.callback_query(F.data == "prof:reset")
async def reset_ask(cb: CallbackQuery) -> None:
    await cb.answer()
    await cb.message.answer(
        "⚠️ Profilingiz, barcha senariylar, tahlillar va Notion ulanishi butunlay o'chiriladi. Ishonchingiz komilmi?",
        reply_markup=keyboards.inline([("🗑 Ha, o'chirish", "reset:yes"), ("Yo'q", "cancel")]),
    )


@router.callback_query(F.data == "reset:yes")
async def reset_do(cb: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    await db.delete_user_data(cb.from_user.id)
    await cb.answer("O'chirildi")
    await cb.message.edit_reply_markup(reply_markup=None)
    await cb.message.answer("🗑 Barcha ma'lumotlaringiz o'chirildi. Qaytadan boshlash uchun /start bosing.",
                            reply_markup=ReplyKeyboardRemove())
