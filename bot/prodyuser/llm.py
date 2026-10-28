"""AI provayderlar: Claude (Anthropic) yoki Gemini. .env dagi LLM_PROVIDER tanlaydi."""

import base64
import logging
from typing import Protocol, TypeVar

from pydantic import BaseModel

from .config import config

log = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)
Image = tuple[bytes, str]  # (bayt, mime turi)


class LLMError(Exception):
    """Foydalanuvchiga ko'rsatiladigan xato."""


class LLM(Protocol):
    async def generate(self, system: str, prompt: str, schema: type[T],
                       images: list[Image] | None = None, max_tokens: int = 16000) -> T: ...


class ClaudeLLM:
    def __init__(self) -> None:
        import anthropic

        self._anthropic = anthropic
        self.client = anthropic.AsyncAnthropic(api_key=config.anthropic_api_key or None)

    async def generate(self, system: str, prompt: str, schema: type[T],
                       images: list[Image] | None = None, max_tokens: int = 16000) -> T:
        anthropic = self._anthropic
        content: list[dict] = [
            {"type": "image", "source": {"type": "base64", "media_type": mime,
                                         "data": base64.standard_b64encode(data).decode()}}
            for data, mime in images or []
        ]
        content.append({"type": "text", "text": prompt})

        extra = {}
        if config.claude_fallbacks:
            # Xavfsizlik filtri noto'g'ri rad etsa, so'rov server tomonda boshqa modelda takrorlanadi
            extra = {"fallbacks": "default", "betas": ["server-side-fallback-2026-07-01"]}

        try:
            resp = await self.client.beta.messages.parse(
                model=config.claude_model,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": content}],
                output_format=schema,
                output_config={"effort": config.claude_effort},
                **extra,
            )
        except anthropic.AuthenticationError as e:
            raise LLMError("ANTHROPIC_API_KEY noto'g'ri.") from e
        except anthropic.RateLimitError as e:
            raise LLMError("AI hozir band (limit). Bir necha daqiqadan keyin urinib ko'ring.") from e
        except anthropic.BadRequestError as e:
            log.error("Claude bad request: %s", e.message)
            raise LLMError("AI so'rovni qabul qilmadi.") from e
        except anthropic.APIStatusError as e:
            log.error("Claude API error %s: %s", e.status_code, e.message)
            raise LLMError("AI serverida xato. Keyinroq urinib ko'ring.") from e
        except anthropic.APIConnectionError as e:
            raise LLMError("AI serveriga ulanib bo'lmadi.") from e

        if resp.stop_reason == "refusal":
            raise LLMError("AI bu so'rovga javob berishdan bosh tortdi. Ma'lumotlarni boshqacha yozib ko'ring.")
        if resp.stop_reason == "max_tokens":
            raise LLMError("AI javobi juda uzun bo'lib ketdi. Kamroq senariy so'rab ko'ring.")
        if resp.parsed_output is None:
            raise LLMError("AI javobini o'qib bo'lmadi.")
        return resp.parsed_output


class GeminiLLM:
    def __init__(self) -> None:
        from google import genai
        from google.genai import types

        self.types = types
        self.client = genai.Client(api_key=config.gemini_api_key or None)

    async def generate(self, system: str, prompt: str, schema: type[T],
                       images: list[Image] | None = None, max_tokens: int = 16000) -> T:
        types = self.types
        parts: list = [types.Part.from_bytes(data=data, mime_type=mime) for data, mime in images or []]
        parts.append(prompt)
        try:
            resp = await self.client.aio.models.generate_content(
                model=config.gemini_model,
                contents=parts,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    response_mime_type="application/json",
                    response_schema=schema,
                    max_output_tokens=max_tokens,
                ),
            )
        except Exception as e:  # google-genai turli xil xato klasslarini qaytaradi
            log.exception("Gemini error")
            raise LLMError("Gemini javob bermadi. Keyinroq urinib ko'ring.") from e

        if isinstance(resp.parsed, schema):
            return resp.parsed
        try:
            return schema.model_validate_json(resp.text or "")
        except Exception as e:
            log.error("Gemini javobi noto'g'ri: %r", (resp.text or "")[:500])
            raise LLMError("AI javobini o'qib bo'lmadi.") from e


_llm: LLM | None = None


def get_llm() -> LLM:
    global _llm
    if _llm is None:
        _llm = GeminiLLM() if config.llm_provider == "gemini" else ClaudeLLM()
    return _llm
