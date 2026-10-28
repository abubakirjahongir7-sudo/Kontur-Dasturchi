"""Senariy, strategiya va tahlilni Telegram (HTML) va Notion ko'rinishiga keltirish."""

from html import escape as e
from typing import Any

from . import notion
from .questions import QUESTIONS, SECTIONS

GOALS = {"views": "👀 Ko'rishlar", "followers": "➕ Obunachilar", "clients": "💰 Mijozlar"}
VERDICTS = {"viral": "🔥 Viral", "good": "✅ Yaxshi", "average": "😐 O'rtacha", "poor": "📉 Past"}
TG_LIMIT = 4000


def split(text: str, limit: int = TG_LIMIT) -> list[str]:
    """Uzun xabarni qatorlar bo'yicha bo'laklarga ajratadi (Telegram limiti 4096)."""
    parts, cur = [], ""
    for line in text.split("\n"):
        while len(line) > limit:
            if cur:
                parts.append(cur)
                cur = ""
            parts.append(line[:limit])
            line = line[limit:]
        if len(cur) + len(line) + 1 > limit:
            parts.append(cur)
            cur = line
        else:
            cur = f"{cur}\n{line}" if cur else line
    if cur:
        parts.append(cur)
    return parts or [""]


# ---------- senariy ----------


def scenario_html(sid: int, s: dict[str, Any], version: int = 1) -> str:
    v = f" · v{version}" if version > 1 else ""
    out = [
        f"🎬 <b>#{sid}{v} · {e(s['title'])}</b>",
        f"{GOALS.get(s['goal'], e(s['goal']))} · 📌 {e(s['content_pillar'])} · ⏱ {s['duration_sec']} s",
        f"🎥 {e(s['format'])}",
        "",
        f"🪝 <b>Hook:</b> {e(s['hook'])}",
    ]
    if s.get("hook_on_screen"):
        out.append(f"🔤 <b>Ekranda:</b> {e(s['hook_on_screen'])}")
    out += ["", "<b>📋 Senariy</b>"]
    for sc in s["scenes"]:
        out.append(f"\n<b>{e(sc['time'])}</b>")
        if sc.get("visual"):
            out.append(f"🎥 {e(sc['visual'])}")
        if sc.get("speech"):
            out.append(f"🗣 {e(sc['speech'])}")
        if sc.get("on_screen_text"):
            out.append(f"🔤 {e(sc['on_screen_text'])}")
    out += [
        "",
        f"📣 <b>CTA:</b> {e(s['cta'])}",
        "",
        f"✍️ <b>Caption:</b>\n{e(s['caption'])}",
        e(" ".join(s["hashtags"])),
        "",
        f"🎵 <b>Musiqa:</b> {e(s['music_vibe'])}",
    ]
    if s.get("filming_tips"):
        out.append("💡 <b>Suratga olish:</b>")
        out += [f"• {e(t)}" for t in s["filming_tips"]]
    out += [
        "",
        f"🧠 <b>Nega ishlaydi:</b> {e(s['why_it_works'])}",
        f"🕒 <b>Joylash vaqti:</b> {e(s['best_time_to_post'])}",
    ]
    return "\n".join(out)


def scenario_blocks(s: dict[str, Any], report: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    b = notion.block
    blocks = [
        b("paragraph",
          f"{GOALS.get(s['goal'], s['goal'])} · {s['content_pillar']} · {s['duration_sec']} s · {s['format']}"),
        b("heading_2", "🪝 Hook"),
        b("paragraph", s["hook"]),
    ]
    if s.get("hook_on_screen"):
        blocks.append(b("quote", f"Ekranda: {s['hook_on_screen']}"))
    blocks.append(b("heading_2", "📋 Senariy"))
    for sc in s["scenes"]:
        blocks.append(b("heading_3", sc["time"]))
        if sc.get("visual"):
            blocks.append(b("bulleted_list_item", f"🎥 Kadr: {sc['visual']}"))
        if sc.get("speech"):
            blocks.append(b("bulleted_list_item", f"🗣 Gap: {sc['speech']}"))
        if sc.get("on_screen_text"):
            blocks.append(b("bulleted_list_item", f"🔤 Ekranda: {sc['on_screen_text']}"))
    blocks += [
        b("heading_2", "📣 CTA"),
        b("paragraph", s["cta"]),
        b("heading_2", "✍️ Caption"),
        b("paragraph", s["caption"]),
        b("paragraph", " ".join(s["hashtags"])),
        b("heading_2", "🎵 Musiqa"),
        b("paragraph", s["music_vibe"]),
    ]
    if s.get("filming_tips"):
        blocks.append(b("heading_2", "💡 Suratga olish"))
        blocks += [b("bulleted_list_item", t) for t in s["filming_tips"]]
    blocks += [
        b("heading_2", "🧠 Nega ishlaydi"),
        b("paragraph", s["why_it_works"]),
        b("heading_2", "🕒 Joylash vaqti"),
        b("paragraph", s["best_time_to_post"]),
    ]
    if report:
        blocks += [notion.divider(), *report_blocks(report)]
    return blocks


# ---------- tahlil ----------


def report_html(sid: int, title: str, r: dict[str, Any]) -> str:
    out = [
        f"📊 <b>Tahlil · #{sid} {e(title)}</b>",
        f"{VERDICTS.get(r['verdict'], r['verdict'])} · Baho: <b>{r['score']}/10</b>",
        "",
        e(r["summary"]),
    ]
    if r.get("metrics"):
        out += ["", "<b>📈 Ko'rsatkichlar</b>"] + [f"• {e(m['name'])}: {e(m['value'])}" for m in r["metrics"]]
    if r.get("what_worked"):
        out += ["", "<b>✅ Ishlagan</b>"] + [f"• {e(x)}" for x in r["what_worked"]]
    if r.get("what_failed"):
        out += ["", "<b>❌ Ishlamagan</b>"] + [f"• {e(x)}" for x in r["what_failed"]]
    out += ["", f"🪝 <b>Hook:</b> {e(r['hook_analysis'])}", f"⏳ <b>Tomosha:</b> {e(r['retention_analysis'])}"]
    if r.get("recommendations"):
        out += ["", "<b>🛠 Tavsiyalar</b>"] + [f"• {e(x)}" for x in r["recommendations"]]
    if r.get("lessons"):
        out += ["", "<b>🧠 Bot eslab qoldi</b>"] + [f"• {e(x)}" for x in r["lessons"]]
    if r.get("missing_data"):
        out += ["", "<i>Aniqroq tahlil uchun keyingi safar yuboring: " + e(", ".join(r["missing_data"])) + "</i>"]
    return "\n".join(out)


def report_blocks(r: dict[str, Any]) -> list[dict[str, Any]]:
    b = notion.block
    blocks = [
        b("heading_2", f"📊 Tahlil: {VERDICTS.get(r['verdict'], r['verdict'])} · {r['score']}/10"),
        b("paragraph", r["summary"]),
    ]
    blocks += [b("bulleted_list_item", f"{m['name']}: {m['value']}") for m in r.get("metrics", [])]
    for head, key in (("✅ Ishlagan", "what_worked"), ("❌ Ishlamagan", "what_failed"),
                      ("🛠 Tavsiyalar", "recommendations")):
        if r.get(key):
            blocks.append(b("heading_3", head))
            blocks += [b("bulleted_list_item", x) for x in r[key]]
    blocks += [b("paragraph", f"Hook: {r['hook_analysis']}"), b("paragraph", f"Tomosha: {r['retention_analysis']}")]
    return blocks


# ---------- profil va strategiya ----------


def strategy_html(st: dict[str, Any]) -> str:
    out = [
        "🧭 <b>Kontent strategiyangiz</b>",
        "",
        f"<b>Pozitsiya:</b> {e(st['positioning'])}",
        f"<b>Auditoriya:</b> {e(st['audience_portrait'])}",
        "",
        "<b>Og'riqlar:</b>", *[f"• {e(x)}" for x in st["pains"]],
        "<b>Istaklar:</b>", *[f"• {e(x)}" for x in st["desires"]],
        "<b>E'tirozlar:</b>", *[f"• {e(x)}" for x in st["objections"]],
        "",
        f"<b>Ovoz ohangi:</b> {e(st['tone_of_voice'])}",
        "",
        "<b>Rubrikalar:</b>",
        *[f"• {e(p['name'])} — {p['share_percent']}%: {e(p['description'])}" for p in st["content_pillars"]],
        "",
        "<b>Hook turlari:</b>", *[f"• {e(x)}" for x in st["hook_styles"]],
        "",
        f"<b>Voronka:</b> {e(st['funnel'])}",
        f"<b>Joylash rejasi:</b> {e(st['posting_plan'])}",
        f"<b>Hozirgi fokus:</b> {e(st['growth_focus'])}",
    ]
    if st.get("avoid"):
        out += ["<b>Qochish kerak:</b>", *[f"• {e(x)}" for x in st["avoid"]]]
    return "\n".join(out)


def profile_text(answers: dict[str, str], notes: list[str]) -> str:
    """Profilni oddiy matn ko'rinishida (AI uchun ham, Notion uchun ham)."""
    out = []
    for key, (title, _) in SECTIONS.items():
        out.append(f"\n## {title}")
        for q in QUESTIONS:
            if q.section == key:
                out.append(f"- {q.text}\n  Javob: {answers.get(q.id) or '—'}")
    if notes:
        out.append("\n## Qo'shimcha ma'lumotlar")
        out += [f"- {n}" for n in notes]
    return "\n".join(out).strip()


def profile_html(answers: dict[str, str]) -> str:
    out = ["👤 <b>Profilingiz</b>"]
    for key, (title, _) in SECTIONS.items():
        out.append(f"\n<b>{e(title)}</b>")
        for q in QUESTIONS:
            if q.section == key:
                a = answers.get(q.id) or "—"
                out.append(f"• <i>{e(q.text)}</i>\n  {e(a)}")
    return "\n".join(out)


def profile_blocks(answers: dict[str, str], notes: list[str], strategy: dict[str, Any] | None) -> list[dict[str, Any]]:
    b = notion.block
    blocks: list[dict[str, Any]] = []
    for key, (title, _) in SECTIONS.items():
        blocks.append(b("heading_2", title))
        for q in QUESTIONS:
            if q.section == key:
                blocks.append(b("heading_3", q.text))
                blocks.append(b("paragraph", answers.get(q.id) or "—"))
    if notes:
        blocks.append(b("heading_2", "Qo'shimcha ma'lumotlar"))
        blocks += [b("bulleted_list_item", n) for n in notes]
    if strategy:
        st = strategy
        blocks += [
            notion.divider(),
            b("heading_1", "🧭 Kontent strategiya"),
            b("paragraph", f"Pozitsiya: {st['positioning']}"),
            b("paragraph", f"Auditoriya: {st['audience_portrait']}"),
            b("heading_3", "Og'riqlar"), *[b("bulleted_list_item", x) for x in st["pains"]],
            b("heading_3", "Istaklar"), *[b("bulleted_list_item", x) for x in st["desires"]],
            b("heading_3", "E'tirozlar"), *[b("bulleted_list_item", x) for x in st["objections"]],
            b("paragraph", f"Ovoz ohangi: {st['tone_of_voice']}"),
            b("heading_3", "Rubrikalar"),
            *[b("bulleted_list_item", f"{p['name']} — {p['share_percent']}%: {p['description']}")
              for p in st["content_pillars"]],
            b("heading_3", "Hook turlari"), *[b("bulleted_list_item", x) for x in st["hook_styles"]],
            b("paragraph", f"Voronka: {st['funnel']}"),
            b("paragraph", f"Joylash rejasi: {st['posting_plan']}"),
            b("paragraph", f"Hozirgi fokus: {st['growth_focus']}"),
            b("heading_3", "Qochish kerak"), *[b("bulleted_list_item", x) for x in st.get("avoid", [])],
        ]
    return blocks
