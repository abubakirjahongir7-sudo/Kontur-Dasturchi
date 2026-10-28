"""Sozlamalar: hammasi .env faylidan o'qiladi."""

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()

# Rossiya serverida Gemini, Claude va Notion API'lari ishlamaydi (region bloklangan).
# AI_PROXY berilsa, shu xizmatlarga so'rovlar chet eldagi proksi orqali ketadi.
# Gemini va Claude kutubxonalari proksini HTTPS_PROXY muhit o'zgaruvchisidan o'qiydi,
# Telegram (aiogram) esa uni o'qimaydi — u to'g'ridan-to'g'ri ishlayveradi.
_ai_proxy = os.getenv("AI_PROXY", "").strip()
if _ai_proxy:
    os.environ["HTTPS_PROXY"] = os.environ["HTTP_PROXY"] = _ai_proxy


def _ids(raw: str | None) -> frozenset[int]:
    if not raw:
        return frozenset()
    return frozenset(int(x) for x in raw.replace(" ", "").split(",") if x)


@dataclass(frozen=True)
class Config:
    bot_token: str = os.getenv("BOT_TOKEN", "")

    # "claude" yoki "gemini"
    llm_provider: str = os.getenv("LLM_PROVIDER", "claude").strip().lower()
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    claude_model: str = os.getenv("CLAUDE_MODEL", "claude-opus-5-5")
    # low | medium | high | xhigh | max — senariy sifati uchun "high" tavsiya etiladi
    claude_effort: str = os.getenv("CLAUDE_EFFORT", "high")
    # AI xavfsizlik filtri so'rovni rad etsa, server boshqa modelda qayta urinadi
    claude_fallbacks: bool = os.getenv("CLAUDE_FALLBACKS", "1") == "1"
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    # Asosiy model band bo'lsa navbat bilan sinab ko'riladigan zaxira modellar
    gemini_fallback_models: tuple[str, ...] = tuple(
        m.strip() for m in os.getenv("GEMINI_FALLBACK_MODELS", "gemini-flash-latest,gemini-2.5-flash").split(",")
        if m.strip()
    )

    # Bot egasining Notion integratsiya tokeni. Faqat OWNER_IDS dagilar uchun ishlatiladi:
    # boshqa foydalanuvchilar o'z tokenini ulaydi va bir-birining Notion'iga kira olmaydi.
    notion_token: str = os.getenv("NOTION_TOKEN", "")
    notion_version: str = os.getenv("NOTION_VERSION", "2022-06-28")

    owner_ids: frozenset[int] = field(default_factory=lambda: _ids(os.getenv("OWNER_IDS")))
    # Bo'sh bo'lsa — bot hamma uchun ochiq
    allowed_user_ids: frozenset[int] = field(default_factory=lambda: _ids(os.getenv("ALLOWED_USER_IDS")))

    # Masalan: http://login:parol@1.2.3.4:8000 (faqat http/https proksi)
    ai_proxy: str = _ai_proxy
    # Telegram ham bloklangan bo'lsa: http://... yoki socks5://...
    telegram_proxy: str = os.getenv("TELEGRAM_PROXY", "").strip()

    db_path: str = os.getenv("DB_PATH", "data/bot.db")
    default_tz: str = os.getenv("DEFAULT_TZ", "Asia/Tashkent")
    # Video joylangandan necha soat keyin analitika so'raladi
    reminder_hours: int = int(os.getenv("ANALYTICS_REMINDER_HOURS", "24"))
    # Bitta foydalanuvchi uchun kunlik AI senariylar limiti (xarajatni nazorat qilish)
    daily_limit: int = int(os.getenv("MAX_SCENARIOS_PER_DAY", "15"))


config = Config()
