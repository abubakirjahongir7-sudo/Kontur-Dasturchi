"""Senariy yuborish vaqtlari, soni, vaqt zonasi va to'xtatish."""

import re
from html import escape as e
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from .. import db, keyboards
from ..states import Setup

router = Router(name="settings")

TIME_RE = re.compile(r"\b([01]?\d|2[0-3])[:.]([0-5]\d)\b")
MAX_TIMES = 6


def parse_times(text: str) -> list[str]:
    times = sorted({f"{int(h):02d}:{m}" for h, m in TIME_RE.findall(text)})
    return times[:MAX_TIMES]


async def show_settings(message: Message, uid: int) -> None:
    user = await db.get_user(uid)
    if not user:
        return
    text = (
        "⚙️ <b>Sozlamalar</b>\n\n"
        f"🕒 Yuborish vaqtlari: <b>{', '.join(user['post_times'])}</b>\n"
        f"🔢 Har safar: <b>{user['per_slot']} ta senariy</b>\n"
        f"🌍 Vaqt zonasi: <b>{e(user['tz'])}</b>\n"
        f"Holat: <b>{'⏸ To‘xtatilgan' if user['paused'] else '▶️ Faol'}</b>"
    )
    await message.answer(text, reply_markup=keyboards.settings_kb(bool(user["paused"])))


async def _times_saved(message: Message, state: FSMContext, times: list[str]) -> None:
    await db.update_user(message.chat.id, post_times=times)
    onboarding = bool((await state.get_data()).get("onboarding"))
    await state.set_state(None)
    await message.answer(f"✅ Senariylar har kuni <b>{', '.join(times)}</b> da keladi.")
    if onboarding:
        await message.answer("🔢 <b>Har safar nechta senariy yuboray?</b>", reply_markup=keyboards.count_kb())
    else:
        await state.clear()


@router.callback_query(F.data == "set:times")
async def set_times(cb: CallbackQuery, state: FSMContext) -> None:
    await cb.answer()
    await state.set_state(Setup.times)
    await state.update_data(onboarding=False)
    await cb.message.answer(
        "🕒 Qaysi vaqtlarda yuboray? Tanlang yoki yozing: <code>09:00, 18:30</code>",
        reply_markup=keyboards.times_kb(),
    )


@router.callback_query(Setup.times, F.data.startswith("tm:"))
async def times_preset(cb: CallbackQuery, state: FSMContext) -> None:
    await cb.answer()
    await cb.message.edit_reply_markup(reply_markup=None)
    await _times_saved(cb.message, state, parse_times(cb.data[3:]))


@router.message(Setup.times, F.text)
async def times_text(message: Message, state: FSMContext) -> None:
    times = parse_times(message.text)
    if not times:
        await message.answer("Vaqtni <code>09:00</code> ko'rinishida yozing. Bir nechta bo'lsa — vergul bilan.")
        return
    await _times_saved(message, state, times)


@router.callback_query(F.data == "set:count")
async def set_count(cb: CallbackQuery) -> None:
    await cb.answer()
    await cb.message.answer("🔢 Har safar nechta senariy yuboray?", reply_markup=keyboards.count_kb())


@router.callback_query(F.data.startswith("cnt:"))
async def count_chosen(cb: CallbackQuery, state: FSMContext) -> None:
    n = int(cb.data.split(":")[1])
    await db.update_user(cb.from_user.id, per_slot=n)
    await cb.answer()
    await cb.message.edit_reply_markup(reply_markup=None)
    await cb.message.answer(f"✅ Har safar {n} ta senariy.")
    if (await state.get_data()).get("onboarding"):
        await state.clear()
        user = await db.get_user(cb.from_user.id)
        await cb.message.answer(
            f"🎉 Hammasi tayyor! Vaqt zonasi: <b>{e(user['tz'])}</b> (⚙️ Sozlamalarda o'zgartirsa bo'ladi).\n\n"
            "Birinchi senariylarni hoziroq tayyorlaymi?",
            reply_markup=keyboards.inline([(f"🚀 Ha, {n} ta tayyorla", f"gen:{n}")],
                                          [("Keyinroq", "gen:later")]),
        )


@router.callback_query(F.data == "set:tz")
async def set_tz(cb: CallbackQuery, state: FSMContext) -> None:
    await cb.answer()
    await state.set_state(Setup.tz)
    await cb.message.answer("🌍 Vaqt zonangizni tanlang yoki yozing (masalan, <code>Asia/Tashkent</code>):",
                            reply_markup=keyboards.tz_kb())


async def _tz_saved(message: Message, state: FSMContext, uid: int, tz: str) -> None:
    try:
        ZoneInfo(tz)
    except (ZoneInfoNotFoundError, ValueError):
        await message.answer("Bunday vaqt zonasi topilmadi. Masalan: <code>Asia/Tashkent</code>")
        return
    await state.clear()
    await db.update_user(uid, tz=tz)
    await message.answer(f"✅ Vaqt zonasi: <b>{e(tz)}</b>")


@router.callback_query(Setup.tz, F.data.startswith("tz:"))
async def tz_preset(cb: CallbackQuery, state: FSMContext) -> None:
    await cb.answer()
    await cb.message.edit_reply_markup(reply_markup=None)
    await _tz_saved(cb.message, state, cb.from_user.id, cb.data[3:])


@router.message(Setup.tz, F.text)
async def tz_text(message: Message, state: FSMContext) -> None:
    await _tz_saved(message, state, message.from_user.id, message.text.strip())


@router.callback_query(F.data == "set:pause")
async def toggle_pause(cb: CallbackQuery) -> None:
    user = await db.get_user(cb.from_user.id)
    if not user:
        return
    paused = 0 if user["paused"] else 1
    await db.update_user(cb.from_user.id, paused=paused)
    await cb.answer("To'xtatildi" if paused else "Davom etadi")
    await cb.message.edit_reply_markup(reply_markup=keyboards.settings_kb(bool(paused)))
    await cb.message.answer("⏸ Avtomatik senariylar to'xtatildi." if paused
                            else "▶️ Avtomatik senariylar yana yuboriladi.")
