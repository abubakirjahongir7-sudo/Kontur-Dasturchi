"""SQLite ma'lumotlar bazasi. Har bir yozuv telegram user_id bo'yicha ajratilgan —
foydalanuvchilar bir-birining ma'lumotini ko'ra olmaydi."""

import json
import os
from datetime import datetime, timezone
from typing import Any

import aiosqlite

_db: aiosqlite.Connection | None = None

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY,
    first_name      TEXT,
    username        TEXT,
    tz              TEXT NOT NULL,
    post_times      TEXT NOT NULL DEFAULT '["09:00"]',
    per_slot        INTEGER NOT NULL DEFAULT 1,
    paused          INTEGER NOT NULL DEFAULT 0,
    onboarding_done INTEGER NOT NULL DEFAULT 0,
    onb_mode        TEXT,
    pending_q       TEXT NOT NULL DEFAULT '[]',
    notion_token    TEXT,
    notion_last_id  TEXT,
    notion_last_title TEXT,
    created_at      TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS profiles (
    user_id    INTEGER PRIMARY KEY,
    answers    TEXT NOT NULL DEFAULT '{}',
    notes      TEXT NOT NULL DEFAULT '[]',
    strategy   TEXT,
    learnings  TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS scenarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL,
    parent_id     INTEGER,
    version       INTEGER NOT NULL DEFAULT 1,
    title         TEXT NOT NULL,
    data          TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'new',
    created_at    TEXT NOT NULL,
    posted_at     TEXT,
    reminder_sent INTEGER NOT NULL DEFAULT 0,
    notion_url    TEXT
);
CREATE INDEX IF NOT EXISTS idx_scenarios_user ON scenarios(user_id, id);
CREATE TABLE IF NOT EXISTS analytics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    scenario_id INTEGER NOT NULL,
    raw_text    TEXT,
    report      TEXT NOT NULL,
    score       INTEGER,
    verdict     TEXT,
    views       INTEGER,
    created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics(user_id, id);
CREATE TABLE IF NOT EXISTS sent_slots (
    user_id  INTEGER NOT NULL,
    slot_key TEXT NOT NULL,
    PRIMARY KEY (user_id, slot_key)
);
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _conn() -> aiosqlite.Connection:
    assert _db is not None, "db.init() chaqirilmagan"
    return _db


async def init(path: str) -> None:
    global _db
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    _db = await aiosqlite.connect(path)
    _db.row_factory = aiosqlite.Row
    await _db.executescript(SCHEMA)
    await _db.commit()


async def close() -> None:
    if _db is not None:
        await _db.close()


# ---------- users ----------

USER_JSON = ("post_times", "pending_q")


def _user(row: aiosqlite.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    u = dict(row)
    for k in USER_JSON:
        u[k] = json.loads(u[k])
    return u


async def get_user(uid: int) -> dict[str, Any] | None:
    async with _conn().execute("SELECT * FROM users WHERE id = ?", (uid,)) as cur:
        return _user(await cur.fetchone())


async def ensure_user(uid: int, first_name: str | None, username: str | None, tz: str) -> dict[str, Any]:
    db = _conn()
    await db.execute(
        "INSERT INTO users (id, first_name, username, tz, created_at) VALUES (?, ?, ?, ?, ?) "
        "ON CONFLICT(id) DO UPDATE SET first_name = excluded.first_name, username = excluded.username",
        (uid, first_name, username, tz, now_iso()),
    )
    await db.execute(
        "INSERT OR IGNORE INTO profiles (user_id, updated_at) VALUES (?, ?)", (uid, now_iso())
    )
    await db.commit()
    user = await get_user(uid)
    assert user is not None
    return user


async def update_user(uid: int, **fields: Any) -> None:
    if not fields:
        return
    for k in USER_JSON:
        if k in fields:
            fields[k] = json.dumps(fields[k], ensure_ascii=False)
    cols = ", ".join(f"{k} = ?" for k in fields)
    await _conn().execute(f"UPDATE users SET {cols} WHERE id = ?", (*fields.values(), uid))
    await _conn().commit()


async def active_users() -> list[dict[str, Any]]:
    async with _conn().execute(
        "SELECT * FROM users WHERE onboarding_done = 1 AND paused = 0"
    ) as cur:
        return [u for u in map(_user, await cur.fetchall()) if u]


async def delete_user_data(uid: int) -> None:
    db = _conn()
    for table, col in (("analytics", "user_id"), ("scenarios", "user_id"), ("sent_slots", "user_id"),
                       ("profiles", "user_id"), ("users", "id")):
        await db.execute(f"DELETE FROM {table} WHERE {col} = ?", (uid,))
    await db.commit()


async def claim_slot(uid: int, slot_key: str) -> bool:
    """Jadvaldagi vaqt uchun senariy hali yuborilmagan bo'lsa True qaytaradi va uni band qiladi."""
    cur = await _conn().execute(
        "INSERT OR IGNORE INTO sent_slots (user_id, slot_key) VALUES (?, ?)", (uid, slot_key)
    )
    await _conn().commit()
    return cur.rowcount == 1


# ---------- profile ----------


async def get_profile(uid: int) -> dict[str, Any]:
    async with _conn().execute("SELECT * FROM profiles WHERE user_id = ?", (uid,)) as cur:
        row = await cur.fetchone()
    if row is None:
        return {"answers": {}, "notes": [], "strategy": None, "learnings": []}
    p = dict(row)
    p["answers"] = json.loads(p["answers"])
    p["notes"] = json.loads(p["notes"])
    p["learnings"] = json.loads(p["learnings"])
    p["strategy"] = json.loads(p["strategy"]) if p["strategy"] else None
    return p


async def save_profile(uid: int, **fields: Any) -> None:
    allowed = {"answers", "notes", "strategy", "learnings"}
    data = {k: json.dumps(v, ensure_ascii=False) if v is not None else None
            for k, v in fields.items() if k in allowed}
    data["updated_at"] = now_iso()
    cols = ", ".join(f"{k} = ?" for k in data)
    await _conn().execute(f"UPDATE profiles SET {cols} WHERE user_id = ?", (*data.values(), uid))
    await _conn().commit()


async def set_answer(uid: int, qid: str, value: str) -> None:
    p = await get_profile(uid)
    p["answers"][qid] = value
    await save_profile(uid, answers=p["answers"])


# ---------- scenarios ----------


def _scenario(row: aiosqlite.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    s = dict(row)
    s["data"] = json.loads(s["data"])
    return s


async def add_scenario(uid: int, data: dict[str, Any], parent_id: int | None = None, version: int = 1) -> int:
    cur = await _conn().execute(
        "INSERT INTO scenarios (user_id, parent_id, version, title, data, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (uid, parent_id, version, data.get("title", "Senariy"), json.dumps(data, ensure_ascii=False), now_iso()),
    )
    await _conn().commit()
    assert cur.lastrowid is not None
    return cur.lastrowid


async def get_scenario(sid: int, uid: int) -> dict[str, Any] | None:
    """Faqat egasiga qaytaradi — boshqa foydalanuvchi id ni taxmin qilsa ham ko'ra olmaydi."""
    async with _conn().execute(
        "SELECT * FROM scenarios WHERE id = ? AND user_id = ?", (sid, uid)
    ) as cur:
        return _scenario(await cur.fetchone())


async def list_scenarios(uid: int, limit: int = 10, offset: int = 0) -> list[dict[str, Any]]:
    async with _conn().execute(
        "SELECT * FROM scenarios WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?", (uid, limit, offset)
    ) as cur:
        return [s for s in map(_scenario, await cur.fetchall()) if s]


async def count_scenarios(uid: int) -> int:
    async with _conn().execute("SELECT COUNT(*) FROM scenarios WHERE user_id = ?", (uid,)) as cur:
        row = await cur.fetchone()
    return row[0] if row else 0


async def count_since(uid: int, since_iso: str) -> int:
    async with _conn().execute(
        "SELECT COUNT(*) FROM scenarios WHERE user_id = ? AND created_at >= ?", (uid, since_iso)
    ) as cur:
        row = await cur.fetchone()
    return row[0] if row else 0


async def update_scenario(sid: int, uid: int, **fields: Any) -> None:
    if not fields:
        return
    cols = ", ".join(f"{k} = ?" for k in fields)
    await _conn().execute(
        f"UPDATE scenarios SET {cols} WHERE id = ? AND user_id = ?", (*fields.values(), sid, uid)
    )
    await _conn().commit()


async def recent_titles(uid: int, limit: int = 40) -> list[str]:
    async with _conn().execute(
        "SELECT title FROM scenarios WHERE user_id = ? ORDER BY id DESC LIMIT ?", (uid, limit)
    ) as cur:
        return [r[0] for r in await cur.fetchall()]


async def due_reminders(cutoff_iso: str) -> list[dict[str, Any]]:
    """Joylanganiga belgilangan vaqt o'tgan, lekin hali tahlil qilinmagan senariylar."""
    async with _conn().execute(
        "SELECT * FROM scenarios WHERE status = 'posted' AND reminder_sent = 0 AND posted_at <= ?",
        (cutoff_iso,),
    ) as cur:
        return [s for s in map(_scenario, await cur.fetchall()) if s]


# ---------- analytics ----------


async def add_analytics(uid: int, sid: int, raw_text: str, report: dict[str, Any]) -> int:
    cur = await _conn().execute(
        "INSERT INTO analytics (user_id, scenario_id, raw_text, report, score, verdict, views, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (uid, sid, raw_text, json.dumps(report, ensure_ascii=False), report.get("score"),
         report.get("verdict"), report.get("views"), now_iso()),
    )
    await _conn().commit()
    assert cur.lastrowid is not None
    return cur.lastrowid


async def latest_report(sid: int, uid: int) -> dict[str, Any] | None:
    async with _conn().execute(
        "SELECT report FROM analytics WHERE scenario_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1", (sid, uid)
    ) as cur:
        row = await cur.fetchone()
    return json.loads(row[0]) if row else None


async def performance_history(uid: int, limit: int = 15) -> list[dict[str, Any]]:
    async with _conn().execute(
        "SELECT a.score, a.verdict, a.views, s.title, s.data FROM analytics a "
        "JOIN scenarios s ON s.id = a.scenario_id WHERE a.user_id = ? ORDER BY a.id DESC LIMIT ?",
        (uid, limit),
    ) as cur:
        rows = await cur.fetchall()
    out = []
    for r in rows:
        d = json.loads(r["data"])
        out.append({"title": r["title"], "score": r["score"], "verdict": r["verdict"], "views": r["views"],
                    "hook": d.get("hook", ""), "format": d.get("format", "")})
    return out
