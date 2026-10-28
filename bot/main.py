"""AI prodyuser Telegram bot — ishga tushirish: `python main.py`"""

import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import BotCommand

from prodyuser import db, scheduler
from prodyuser.config import config
from prodyuser.handlers import build_router
from prodyuser.middlewares import UserMiddleware


def check_config() -> None:
    missing = []
    if not config.bot_token:
        missing.append("BOT_TOKEN")
    if config.llm_provider == "gemini" and not config.gemini_api_key:
        missing.append("GEMINI_API_KEY")
    if config.llm_provider != "gemini" and not config.anthropic_api_key:
        missing.append("ANTHROPIC_API_KEY")
    if missing:
        sys.exit(f".env faylida to'ldirilmagan: {', '.join(missing)} (namuna: .env.example)")


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    check_config()
    await db.init(config.db_path)

    session = AiohttpSession(proxy=config.telegram_proxy) if config.telegram_proxy else None
    bot = Bot(config.bot_token, session=session, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(storage=MemoryStorage())
    dp.message.outer_middleware(UserMiddleware())
    dp.callback_query.outer_middleware(UserMiddleware())
    dp.include_router(build_router())

    await bot.set_my_commands([
        BotCommand(command="start", description="Boshlash / davom ettirish"),
        BotCommand(command="menu", description="Asosiy menyu"),
        BotCommand(command="help", description="Yordam"),
        BotCommand(command="cancel", description="Joriy amalni bekor qilish"),
    ])

    sched = asyncio.create_task(scheduler.run(bot))
    logging.info("Bot ishga tushdi (AI: %s, AI proksi: %s)", config.llm_provider,
                 "bor" if config.ai_proxy else "yo'q")
    try:
        await dp.start_polling(bot)
    finally:
        sched.cancel()
        await db.close()
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
