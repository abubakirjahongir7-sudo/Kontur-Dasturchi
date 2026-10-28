"""Botning asosiy ishi: profilni o'rganish, senariy yozish, tahlil qilish, Notion bilan ishlash.
Handlerlar ham, jadval (scheduler) ham shu funksiyalardan foydalanadi."""

import asyncio
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from aiogram import Bot

from . import db, keyboards, prompts, render
from .config import config
from .llm import Image, LLMError, get_llm
from .notion import Notion, NotionError, Target
from .questions import BY_ID, QUESTIONS
from .schemas import (AnalyticsReport, ImageText, ProfileExtract, ProfileReview, Scenario,
                      ScenarioBatch, Strategy)

log = logging.getLogger(__name__)

_locks: dict[int, asyncio.Lock] = {}
MAX_LEARNINGS = 40


def user_lock(uid: int) -> asyncio.Lock:
    """Bitta foydalanuvchi uchun bir vaqtda faqat bitta og'ir AI ishi."""
    return _locks.setdefault(uid, asyncio.Lock())


# ---------- kontekst ----------


async def profile_context(uid: int, with_history: bool = True) -> str:
    p = await db.get_profile(uid)
    parts = [render.profile_text(p["answers"], p["notes"])]
    if p["strategy"]:
        parts.append("## Kontent strategiya\n" + json.dumps(p["strategy"], ensure_ascii=False, indent=1))
    if p["learnings"]:
        parts.append("## Oldingi videolar tahlilidan saboqlar (albatta amal qiling)\n"
                     + "\n".join(f"- {x}" for x in p["learnings"]))
    if with_history:
        hist = await db.performance_history(uid)
        if hist:
            parts.append("## Oldingi videolar natijalari (yangisidan eskisiga)\n" + "\n".join(
                f"- «{h['title']}» — {h['verdict']}, {h['score']}/10, {h['views']} ko'rish; "
                f"format: {h['format']}; hook: {h['hook']}" for h in hist))
        titles = await db.recent_titles(uid)
        if titles:
            parts.append("## Avval yozilgan senariylar (mavzularini takrorlamang)\n"
                         + "\n".join(f"- {t}" for t in titles))
    return "\n\n".join(parts)


async def _remaining_today(uid: int) -> int:
    since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat(timespec="seconds")
    return config.daily_limit - await db.count_since(uid, since)


# ---------- profil ----------


async def review_profile(uid: int) -> ProfileReview:
    ctx = await profile_context(uid, with_history=False)
    return await get_llm().generate(prompts.PRODUCER_SYSTEM, prompts.REVIEW_TASK.format(profile=ctx), ProfileReview)


async def build_strategy(uid: int) -> dict[str, Any]:
    ctx = await profile_context(uid)
    st = await get_llm().generate(prompts.PRODUCER_SYSTEM, prompts.STRATEGY_TASK.format(profile=ctx), Strategy)
    data = st.model_dump()
    await db.save_profile(uid, strategy=data)
    return data


async def read_image(images: list[Image], question: str) -> str:
    res = await get_llm().generate(prompts.PRODUCER_SYSTEM, prompts.IMAGE_TASK.format(question=question),
                                   ImageText, images=images, max_tokens=4000)
    return res.text.strip()


async def add_note(uid: int, note: str) -> None:
    p = await db.get_profile(uid)
    p["notes"].append(note)
    await db.save_profile(uid, notes=p["notes"])


# ---------- senariylar ----------


async def generate_scenarios(uid: int, count: int, wish: str | None = None) -> list[tuple[int, dict[str, Any]]]:
    count = min(count, await _remaining_today(uid))
    if count <= 0:
        raise LLMError(f"Kunlik limit ({config.daily_limit} ta senariy) tugadi. Ertaga davom etamiz.")
    ctx = await profile_context(uid)
    wish_text = f"\nFoydalanuvchining alohida istagi: {wish}\n" if wish else ""
    batch = await get_llm().generate(
        prompts.PRODUCER_SYSTEM,
        prompts.SCENARIOS_TASK.format(count=count, wish=wish_text, profile=ctx),
        ScenarioBatch,
    )
    out = []
    for s in batch.scenarios[:count]:
        data = s.model_dump()
        out.append((await db.add_scenario(uid, data), data))
    if not out:
        raise LLMError("AI senariy qaytarmadi. Qayta urinib ko'ring.")
    return out


async def rewrite_scenario(uid: int, sid: int, feedback: str | None = None,
                           report: dict[str, Any] | None = None) -> tuple[int, dict[str, Any], int]:
    if await _remaining_today(uid) <= 0:
        raise LLMError(f"Kunlik limit ({config.daily_limit} ta senariy) tugadi. Ertaga davom etamiz.")
    s = await db.get_scenario(sid, uid)
    if s is None:
        raise LLMError("Senariy topilmadi.")
    reasons = []
    if report:
        reasons.append("Bu senariy bo'yicha olingan video kutilgan natijani bermadi. Tahlil:\n"
                       + json.dumps(report, ensure_ascii=False, indent=1)
                       + "\nTahlildagi xatolarni tuzating: kuchliroq hook, yaxshiroq tomosha davomiyligi, aniqroq CTA.")
    if feedback:
        reasons.append(f"Foydalanuvchi izohi (albatta hisobga oling): {feedback}")
    if not reasons:
        reasons.append("Foydalanuvchi yanada kuchliroq variant so'radi: hookni, tuzilmani va CTA ni yaxshilang.")
    ctx = await profile_context(uid)
    new = await get_llm().generate(
        prompts.PRODUCER_SYSTEM,
        prompts.REWRITE_TASK.format(reason="\n".join(reasons),
                                    scenario=json.dumps(s["data"], ensure_ascii=False, indent=1), profile=ctx),
        Scenario,
    )
    data = new.model_dump()
    version = s["version"] + 1
    new_id = await db.add_scenario(uid, data, parent_id=sid, version=version)
    return new_id, data, version


async def send_scenario(bot: Bot, chat_id: int, sid: int, data: dict[str, Any], version: int = 1) -> None:
    parts = render.split(render.scenario_html(sid, data, version))
    for i, part in enumerate(parts):
        last = i == len(parts) - 1
        await bot.send_message(chat_id, part, reply_markup=keyboards.scenario_kb(sid) if last else None)


async def deliver_scheduled(bot: Bot, uid: int) -> None:
    """Jadval bo'yicha senariylarni tayyorlab yuboradi."""
    user = await db.get_user(uid)
    if not user:
        return
    async with user_lock(uid):
        try:
            items = await generate_scenarios(uid, user["per_slot"])
        except LLMError as e:
            await bot.send_message(uid, f"⚠️ Rejadagi senariylarni tayyorlab bo'lmadi: {e}")
            return
        except Exception:
            log.exception("Scheduled generation failed for %s", uid)
            return
    await bot.send_message(uid, f"☀️ <b>Yangi senariylar tayyor ({len(items)} ta)</b>")
    for sid, data in items:
        await send_scenario(bot, uid, sid, data)
    await bot.send_message(
        uid,
        "👆 Tekshirib chiqing. Ma'qul bo'lsa — <b>«📝 Notion'ga yoz»</b>, o'zgartirish kerak bo'lsa — "
        "<b>«✏️ Qayta yoz»</b>. Video joylaganingizdan keyin <b>«🎬 Joyladim»</b> ni bosing — "
        f"{config.reminder_hours} soatdan keyin statistikani so'rayman.",
    )


# ---------- tahlil ----------


async def analyze(uid: int, sid: int, texts: list[str], images: list[Image]) -> dict[str, Any]:
    s = await db.get_scenario(sid, uid)
    if s is None:
        raise LLMError("Senariy topilmadi.")
    ctx = await profile_context(uid)
    posted = f"Video joylangan vaqt (UTC): {s['posted_at']}. Hozir (UTC): {db.now_iso()}." if s["posted_at"] else ""
    report = await get_llm().generate(
        prompts.PRODUCER_SYSTEM,
        prompts.ANALYZE_TASK.format(
            scenario=json.dumps(s["data"], ensure_ascii=False, indent=1),
            texts=("\n".join(texts) or "(faqat skrinshotlar)") + ("\n" + posted if posted else ""),
            profile=ctx,
        ),
        AnalyticsReport,
        images=images,
    )
    data = report.model_dump()
    data["needs_rewrite"] = data["needs_rewrite"] or data["verdict"] in ("average", "poor")
    await db.add_analytics(uid, sid, "\n".join(texts), data)
    await db.update_scenario(sid, uid, status="analyzed", reminder_sent=1)

    p = await db.get_profile(uid)
    learnings = [x for x in p["learnings"] if x not in data["lessons"]] + data["lessons"]
    await db.save_profile(uid, learnings=learnings[-MAX_LEARNINGS:])
    return data


# ---------- Notion ----------


def notion_token(user: dict[str, Any]) -> str | None:
    """Foydalanuvchining o'z tokeni. Bot egasining tokeni faqat egasiga ishlaydi —
    shunda boshqa foydalanuvchilar egasining Notion sahifalarini o'qiy olmaydi."""
    if user.get("notion_token"):
        return user["notion_token"]
    if config.notion_token and user["id"] in config.owner_ids:
        return config.notion_token
    return None


async def notion_import(uid: int, token: str, page_id: str) -> tuple[str, int, int]:
    title, text = await Notion(token).read_text(page_id)
    if len(text.strip()) < 30:
        raise NotionError("Sahifa bo'sh ko'rinadi yoki matnini o'qib bo'lmadi.")
    p = await db.get_profile(uid)
    questions = "\n".join(f"- {q.id}: {q.text}" for q in QUESTIONS)
    existing = "\n".join(f"- {k}: {v}" for k, v in p["answers"].items() if v) or "(yo'q)"
    res = await get_llm().generate(
        prompts.PRODUCER_SYSTEM,
        prompts.EXTRACT_TASK.format(questions=questions, existing=existing, text=text),
        ProfileExtract,
    )
    answers = p["answers"]
    n = 0
    for item in res.answers:
        if item.qid in BY_ID and item.answer.strip():
            answers[item.qid] = item.answer.strip()
            n += 1
    notes = p["notes"] + [f"[Notion: {title}] {x}" for x in res.notes if x.strip()]
    await db.save_profile(uid, answers=answers, notes=notes)
    return title, n, len(res.notes)


async def notion_write(user: dict[str, Any], target_id: str, title: str, blocks: list[dict[str, Any]]) -> tuple[Target, str]:
    token = notion_token(user)
    if not token:
        raise NotionError("Notion ulanmagan. «📎 Notion» bo'limidan tokenni ulang.")
    client = Notion(token)
    target = await client.target(target_id)
    url = await client.create_page(target, title, blocks)
    await db.update_user(user["id"], notion_last_id=target.id, notion_last_title=target.title[:50])
    return target, url
