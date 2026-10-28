"""Video statistikasini qabul qilish, AI tahlili va natija past bo'lsa senariyni qayta yozish."""

from functools import partial
from html import escape
from io import BytesIO

from aiogram import Bot, F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message
from aiogram.utils.chat_action import ChatActionSender

from .. import db, keyboards, render, services
from ..llm import LLMError
from ..states import Analytics

# Telegram HTML uchun faqat <, > va & ni ekranlash kifoya — apostroflar o'z holicha qoladi
e = partial(escape, quote=False)

router = Router(name="analytics")

MAX_IMAGES = 10
INSTRUCTION = (
    "📊 <b>#{sid} «{title}»</b> uchun statistikani yuboring:\n\n"
    "1. Instagram → videoni oching → <b>«Statistika»</b> (Insights)\n"
    "2. Barcha ekranlarni skrinshot qiling: umumiy ko'rsatkichlar, qamrov, tomosha davomiyligi grafigi, "
    "obunachilar/obunachi emaslar, faollik\n"
    "3. Rasmlarni shu yerga yuboring (bir nechtasini birga yuborsa ham bo'ladi). "
    "Xohlasangiz raqamlarni matn bilan ham yozing\n\n"
    "Hammasini yuborgach — <b>«✅ Tahlil qil»</b>."
)


async def show_pick(message: Message, uid: int) -> None:
    items = await db.list_scenarios(uid, 10)
    if not items:
        await message.answer("Hali senariylar yo'q. Avval «🎬 Senariy olish».")
        return
    icons = {"new": "🆕", "posted": "🎬", "analyzed": "📊"}
    rows = [[(f"{icons.get(s['status'], '')} #{s['id']} {s['title']}"[:60], f"sc:an:{s['id']}")] for s in items]
    await message.answer("Qaysi senariy bo'yicha olingan video statistikasini yuborasiz?",
                         reply_markup=keyboards.inline(*rows))


@router.callback_query(F.data.startswith("sc:an:"))
async def start_collect(cb: CallbackQuery, state: FSMContext) -> None:
    sid = int(cb.data.rsplit(":", 1)[1])
    s = await db.get_scenario(sid, cb.from_user.id)
    if not s:
        await cb.answer("Topilmadi")
        return
    await cb.answer()
    await state.set_state(Analytics.collect)
    await state.set_data({"sid": sid, "photos": [], "texts": [], "groups": []})
    await cb.message.answer(INSTRUCTION.format(sid=sid, title=e(s["title"])), reply_markup=keyboards.analytics_kb())


async def _ack(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    group = message.media_group_id
    if group:
        if group in data["groups"]:
            return
        await state.update_data(groups=data["groups"] + [group])
    await message.answer(
        f"✔️ Qabul qilindi: {len(data['photos'])} ta rasm, {len(data['texts'])} ta matn. "
        "Yana yuboring yoki «✅ Tahlil qil».",
        reply_markup=keyboards.analytics_kb(),
    )


@router.message(Analytics.collect, F.photo)
async def collect_photo(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    if len(data["photos"]) >= MAX_IMAGES:
        await message.answer(f"Ko'pi bilan {MAX_IMAGES} ta rasm. «✅ Tahlil qil» ni bosing.")
        return
    await state.update_data(photos=data["photos"] + [[message.photo[-1].file_id, "image/jpeg"]])
    await _ack(message, state)


@router.message(Analytics.collect, F.document.mime_type.in_({"image/png", "image/jpeg", "image/webp"}))
async def collect_doc(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    if len(data["photos"]) >= MAX_IMAGES:
        return
    await state.update_data(photos=data["photos"] + [[message.document.file_id, message.document.mime_type]])
    await _ack(message, state)


@router.message(Analytics.collect, F.text)
async def collect_text(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    await state.update_data(texts=data["texts"] + [message.text.strip()])
    await _ack(message, state)


@router.callback_query(Analytics.collect, F.data == "an:go")
async def run_analysis(cb: CallbackQuery, bot: Bot, state: FSMContext) -> None:
    data = await state.get_data()
    if not data["photos"] and not data["texts"]:
        await cb.answer("Avval skrinshot yoki raqamlarni yuboring", show_alert=True)
        return
    await cb.answer()
    await state.clear()
    await cb.message.edit_reply_markup(reply_markup=None)
    uid, chat_id, sid = cb.from_user.id, cb.message.chat.id, data["sid"]

    lock = services.user_lock(uid)
    if lock.locked():
        await cb.message.answer("⏳ Hozir boshqa ish ustidaman. Biroz kutib, statistikani qayta yuboring.")
        return
    async with lock:
        await cb.message.answer("🔍 Statistikani tahlil qilyapman...")
        try:
            async with ChatActionSender.typing(bot=bot, chat_id=chat_id):
                images = []
                for file_id, mime in data["photos"]:
                    buf = BytesIO()
                    await bot.download(file_id, destination=buf)
                    images.append((buf.getvalue(), mime))
                report = await services.analyze(uid, sid, data["texts"], images)
        except LLMError as err:
            await cb.message.answer(f"⚠️ {err}")
            return

        s = await db.get_scenario(sid, uid)
        title = s["title"] if s else ""
        parts = render.split(render.report_html(sid, title, report))
        for i, part in enumerate(parts):
            last = i == len(parts) - 1
            await cb.message.answer(part, reply_markup=keyboards.inline(
                [("📝 Senariy + tahlilni Notion'ga yoz", f"sc:notion:{sid}")]) if last else None)

        if not report["needs_rewrite"]:
            await cb.message.answer("🔥 Yaxshi natija! Bu yondashuvni keyingi senariylarda ham ishlataman.")
            return

        await cb.message.answer("♻️ Natija kutilgandek emas — tahlil asosida senariyni qaytadan, mukammalroq yozyapman...")
        try:
            async with ChatActionSender.typing(bot=bot, chat_id=chat_id):
                new_id, new_data, version = await services.rewrite_scenario(uid, sid, report=report)
        except LLMError as err:
            await cb.message.answer(f"⚠️ {err}")
            return
    await services.send_scenario(bot, chat_id, new_id, new_data, version)
