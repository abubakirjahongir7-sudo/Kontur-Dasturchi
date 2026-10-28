"""Har 30 soniyada tekshiradi: kimga senariy yuborish vaqti keldi va kimdan analitika so'rash kerak."""

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from aiogram import Bot

from . import db, keyboards
from .config import config
from .services import deliver_scheduled

log = logging.getLogger(__name__)

TICK_SECONDS = 30
# Bot o'chiq bo'lib qolsa, shu muddat ichida o'tib ketgan vaqtlar uchun ham yuboradi
CATCH_UP = timedelta(minutes=30)

_tasks: set[asyncio.Task] = set()


def _spawn(coro) -> None:
    task = asyncio.create_task(coro)
    _tasks.add(task)
    task.add_done_callback(_tasks.discard)


async def _send_due_scenarios(bot: Bot) -> None:
    for user in await db.active_users():
        try:
            now = datetime.now(ZoneInfo(user["tz"]))
        except Exception:
            now = datetime.now(ZoneInfo(config.default_tz))
        for t in user["post_times"]:
            hh, mm = map(int, t.split(":"))
            slot = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
            if timedelta(0) <= now - slot < CATCH_UP:
                if await db.claim_slot(user["id"], f"{slot:%Y-%m-%d} {t}"):
                    _spawn(deliver_scheduled(bot, user["id"]))


async def _send_reminders(bot: Bot) -> None:
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=config.reminder_hours)).isoformat(timespec="seconds")
    for s in await db.due_reminders(cutoff):
        await db.update_scenario(s["id"], s["user_id"], reminder_sent=1)
        try:
            await bot.send_message(
                s["user_id"],
                f"⏰ <b>«{s['title']}»</b> videosini joylaganingizga {config.reminder_hours} soat bo'ldi.\n\n"
                "Instagram → videoni oching → <b>«Statistika»</b> (Insights). Skrinshotlarni yuboring — "
                "qanchalik ommabop bo'lganini aniqlab beraman va kerak bo'lsa senariyni qayta yozaman.",
                reply_markup=keyboards.inline([("📊 Analitika yuborish", f"sc:an:{s['id']}")]),
            )
        except Exception:
            log.exception("Reminder failed for scenario %s", s["id"])


async def run(bot: Bot) -> None:
    while True:
        try:
            await _send_due_scenarios(bot)
            await _send_reminders(bot)
        except Exception:
            log.exception("Scheduler tick failed")
        await asyncio.sleep(TICK_SECONDS)
