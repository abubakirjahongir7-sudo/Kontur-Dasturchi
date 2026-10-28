"""AI provayderlar: Claude (Anthropic) yoki Gemini. .env dagi LLM_PROVIDER tanlaydi."""

import asyncio
import base64
import json
import logging
from typing import Protocol, TypeVar

import httpx
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
        gateway = {}
        if config.ai_gateway_url:
            gateway = {"base_url": f"{config.ai_gateway_url}/anthropic",
                       "default_headers": {"x-proxy-secret": config.ai_gateway_secret}}
        self.client = anthropic.AsyncAnthropic(api_key=config.anthropic_api_key or None, **gateway)

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


GATEWAY_TIMEOUT_S = 300


class _KeepAliveTransport(httpx.AsyncBaseTransport):
    """Cloudflare Worker orqali so'rov: Worker AI javobini kutayotganda probel yuborib ulanishni tirik
    ushlab turadi (aks holda Rossiyadan uzoq kutilgan ulanish uziladi), oxirida esa
    {"status": ..., "body": "..."} qaytaradi. Bu yerda asl javob tiklanadi, shuning uchun Gemini
    kutubxonasi xato kodlarini (503 va h.k.) odatdagidek ko'radi."""

    def __init__(self) -> None:
        self._inner = httpx.AsyncHTTPTransport()

    async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
        request.headers["x-keepalive"] = "1"
        request.headers["accept-encoding"] = "identity"
        resp = await self._inner.handle_async_request(request)
        try:
            raw = b"".join([chunk async for chunk in resp.stream])
        finally:
            await resp.aclose()
        headers = {"content-type": resp.headers.get("content-type", "application/json")}
        if resp.status_code != 200 or resp.headers.get("x-keepalive") != "1":
            return httpx.Response(resp.status_code, headers=headers, content=raw, request=request)
        try:
            envelope = json.loads(raw)
            return httpx.Response(envelope["status"], headers={"content-type": "application/json"},
                                  content=envelope["body"].encode(), request=request)
        except (ValueError, KeyError, TypeError):
            log.error("Worker javobi noto'g'ri: %r", raw[:300])
            return httpx.Response(502, headers=headers, content=b'{"error":{"code":502}}', request=request)

    async def aclose(self) -> None:
        await self._inner.aclose()


class GeminiLLM:
    def __init__(self) -> None:
        from google import genai
        from google.genai import errors, types

        self.types, self.errors = types, errors
        http_options = None
        if config.ai_gateway_url:
            http_options = types.HttpOptions(
                base_url=f"{config.ai_gateway_url}/gemini/",
                headers={"x-proxy-secret": config.ai_gateway_secret},
                timeout=GATEWAY_TIMEOUT_S * 1000,
                httpx_async_client=httpx.AsyncClient(transport=_KeepAliveTransport(),
                                                     timeout=GATEWAY_TIMEOUT_S),
            )
        self.client = genai.Client(api_key=config.gemini_api_key or None, http_options=http_options)

    async def generate(self, system: str, prompt: str, schema: type[T],
                       images: list[Image] | None = None, max_tokens: int = 16000) -> T:
        types, errors = self.types, self.errors
        parts: list = [types.Part.from_bytes(data=data, mime_type=mime) for data, mime in images or []]
        parts.append(prompt)
        cfg = types.GenerateContentConfig(
            system_instruction=system,
            response_mime_type="application/json",
            response_schema=schema,
            max_output_tokens=max_tokens,
        )
        # Model band bo'lsa (503), limit tugasa (429) yoki javob bermasa — keyingi zaxira modelga o'tamiz
        models = [config.gemini_model, *config.gemini_fallback_models]
        resp = None
        for i, model in enumerate(models):
            try:
                resp = await asyncio.wait_for(
                    self.client.aio.models.generate_content(model=model, contents=parts, config=cfg),
                    timeout=config.gemini_attempt_timeout,
                )
                break
            except TimeoutError as e:
                if i < len(models) - 1:
                    log.warning("Gemini %s %s s da javob bermadi, %s ga o'tilmoqda",
                                model, config.gemini_attempt_timeout, models[i + 1])
                    continue
                raise LLMError("Gemini juda uzoq javob bermadi. Bir necha daqiqadan keyin urinib ko'ring.") from e
            except errors.APIError as e:
                busy = e.code in (429, 500, 503, 504)
                if busy and i < len(models) - 1:
                    log.warning("Gemini %s band (%s), %s ga o'tilmoqda", model, e.code, models[i + 1])
                    continue
                log.error("Gemini error %s: %s", e.code, e)
                if busy:
                    raise LLMError("Gemini hozir band. Bir necha daqiqadan keyin urinib ko'ring.") from e
                if e.code in (401, 403):
                    raise LLMError("GEMINI_API_KEY noto'g'ri yoki ruxsat yo'q.") from e
                raise LLMError("Gemini so'rovni qabul qilmadi.") from e
            except Exception as e:
                log.exception("Gemini connection error")
                raise LLMError("Gemini serveriga ulanib bo'lmadi.") from e
        assert resp is not None

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
