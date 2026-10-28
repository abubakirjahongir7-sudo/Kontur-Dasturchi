from typing import Any, Awaitable, Callable

from aiogram import BaseMiddleware
from aiogram.types import CallbackQuery, Message, TelegramObject

from . import db
from .config import config


class UserMiddleware(BaseMiddleware):
    """Ruxsatni tekshiradi va foydalanuvchini bazadan olib, handlerlarga `user` sifatida beradi."""

    async def __call__(self, handler: Callable[[TelegramObject, dict[str, Any]], Awaitable[Any]],
                       event: TelegramObject, data: dict[str, Any]) -> Any:
        tg_user = data.get("event_from_user")
        if tg_user is None or tg_user.is_bot:
            return None
        if isinstance(event, Message) and event.chat.type != "private":
            return None
        if config.allowed_user_ids and tg_user.id not in config.allowed_user_ids:
            if isinstance(event, Message):
                await event.answer("⛔ Bu bot hozircha yopiq.")
            elif isinstance(event, CallbackQuery):
                await event.answer("⛔ Ruxsat yo'q", show_alert=True)
            return None
        user = await db.get_user(tg_user.id)
        if user is None:
            user = await db.ensure_user(tg_user.id, tg_user.first_name, tg_user.username, config.default_tz)
        data["user"] = user
        return await handler(event, data)
