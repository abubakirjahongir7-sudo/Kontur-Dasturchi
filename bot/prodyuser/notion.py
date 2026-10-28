"""Notion API: sahifani o'qish va unga yangi sahifa yozish."""

import logging
import re
from dataclasses import dataclass
from typing import Any

import aiohttp

from .config import config

log = logging.getLogger(__name__)

API = "https://api.notion.com/v1"
TEXT_LIMIT = 1900  # Notion bitta rich_text uchun 2000 belgigacha ruxsat beradi
READ_LIMIT = 60000  # AI ga yuboriladigan matnning maksimal hajmi


class NotionError(Exception):
    """Foydalanuvchiga ko'rsatiladigan xato."""


@dataclass
class Target:
    id: str
    kind: str  # "page" | "database"
    title: str
    title_prop: str | None = None  # database uchun
    url: str = ""


_UUID = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
_HEX32 = re.compile(r"(?<![0-9a-fA-F])[0-9a-fA-F]{32}(?![0-9a-fA-F])")


def parse_id(link: str) -> str | None:
    """Notion havolasidan sahifa id sini ajratib oladi."""
    link = link.strip()
    path = re.split(r"[?#]", link, maxsplit=1)[0]
    if m := _UUID.findall(path):
        return m[-1].replace("-", "").lower()
    if m := _HEX32.findall(path):
        return m[-1].lower()
    return None


class Notion:
    def __init__(self, token: str) -> None:
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Notion-Version": config.notion_version,
            "Content-Type": "application/json",
        }

    async def _req(self, method: str, path: str, json: dict | None = None,
                   params: dict | None = None) -> dict[str, Any]:
        async with aiohttp.ClientSession(headers=self.headers) as s:
            async with s.request(method, API + path, json=json, params=params,
                                 timeout=aiohttp.ClientTimeout(total=60)) as r:
                data = await r.json(content_type=None)
                if r.status >= 400:
                    code = (data or {}).get("code", "")
                    log.warning("Notion %s %s -> %s %s", method, path, r.status, data)
                    if r.status == 401:
                        raise NotionError("Notion token noto'g'ri yoki o'chirilgan.")
                    if r.status == 404 or code == "object_not_found":
                        raise NotionError(
                            "Sahifa topilmadi. Notion'da sahifani oching → «•••» → «Connections» → "
                            "integratsiyangizni qo'shing va qayta urinib ko'ring."
                        )
                    if r.status == 429:
                        raise NotionError("Notion hozir band. Birozdan keyin urinib ko'ring.")
                    raise NotionError(f"Notion xatosi: {(data or {}).get('message', r.status)}")
                return data

    async def me(self) -> dict[str, Any]:
        return await self._req("GET", "/users/me")

    async def target(self, obj_id: str) -> Target:
        """Havola sahifami yoki ma'lumotlar bazasimi — aniqlaydi."""
        try:
            page = await self._req("GET", f"/pages/{obj_id}")
            return Target(obj_id, "page", _page_title(page), url=page.get("url", ""))
        except NotionError as page_err:
            try:
                db = await self._req("GET", f"/databases/{obj_id}")
            except NotionError:
                raise page_err from None
            title_prop = next((k for k, v in db.get("properties", {}).items() if v.get("type") == "title"), "Name")
            return Target(obj_id, "database", _plain(db.get("title", [])) or "Database",
                          title_prop=title_prop, url=db.get("url", ""))

    # ---------- o'qish ----------

    async def read_text(self, obj_id: str) -> tuple[str, str]:
        """(sarlavha, matn) qaytaradi. Ichki sahifalar va jadvallarni ham o'qiydi."""
        t = await self.target(obj_id)
        lines: list[str] = [f"# {t.title}"]
        if t.kind == "database":
            await self._read_database(obj_id, lines, depth=0)
        else:
            await self._read_blocks(obj_id, lines, depth=0)
        text = "\n".join(lines)
        return t.title, text[:READ_LIMIT]

    async def _children(self, block_id: str) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        cursor = None
        while True:
            params = {"page_size": 100, **({"start_cursor": cursor} if cursor else {})}
            data = await self._req("GET", f"/blocks/{block_id}/children", params=params)
            out.extend(data.get("results", []))
            if not data.get("has_more") or len(out) >= 1000:
                return out
            cursor = data.get("next_cursor")

    async def _read_blocks(self, block_id: str, lines: list[str], depth: int) -> None:
        if depth > 3 or sum(map(len, lines)) > READ_LIMIT:
            return
        for b in await self._children(block_id):
            btype = b.get("type", "")
            body = b.get(btype, {}) or {}
            indent = "  " * depth
            if btype == "child_page":
                lines.append(f"\n{indent}## {body.get('title', '')}")
                await self._read_blocks(b["id"], lines, depth + 1)
                continue
            if btype == "child_database":
                lines.append(f"\n{indent}## {body.get('title', 'Jadval')}")
                try:
                    await self._read_database(b["id"], lines, depth + 1)
                except NotionError:
                    pass
                continue
            if btype == "table_row":
                cells = [_plain(c) for c in body.get("cells", [])]
                lines.append(indent + " | ".join(cells))
            elif "rich_text" in body:
                text = _plain(body["rich_text"])
                prefix = {"heading_1": "# ", "heading_2": "## ", "heading_3": "### ",
                          "bulleted_list_item": "- ", "numbered_list_item": "1. ",
                          "to_do": "[x] " if body.get("checked") else "[ ] ", "quote": "> "}.get(btype, "")
                if text:
                    lines.append(indent + prefix + text)
            if b.get("has_children"):
                await self._read_blocks(b["id"], lines, depth + 1)

    async def _read_database(self, db_id: str, lines: list[str], depth: int) -> None:
        data = await self._req("POST", f"/databases/{db_id}/query", json={"page_size": 50})
        for row in data.get("results", []):
            parts = []
            for name, prop in row.get("properties", {}).items():
                value = _prop_text(prop)
                if value:
                    parts.append(f"{name}: {value}")
            lines.append("  " * depth + "- " + "; ".join(parts))
            if depth < 2:
                await self._read_blocks(row["id"], lines, depth + 1)

    # ---------- yozish ----------

    async def create_page(self, parent: Target, title: str, blocks: list[dict[str, Any]]) -> str:
        if parent.kind == "database":
            body: dict[str, Any] = {
                "parent": {"database_id": parent.id},
                "properties": {parent.title_prop or "Name": {"title": rt(title)}},
            }
        else:
            body = {"parent": {"page_id": parent.id}, "properties": {"title": {"title": rt(title)}}}
        body["children"] = blocks[:100]
        page = await self._req("POST", "/pages", json=body)
        for i in range(100, len(blocks), 100):
            await self._req("PATCH", f"/blocks/{page['id']}/children", json={"children": blocks[i:i + 100]})
        return page.get("url", "")


# ---------- yordamchilar ----------


def _plain(rich: list[dict[str, Any]]) -> str:
    return "".join(r.get("plain_text", "") for r in rich or [])


def _page_title(page: dict[str, Any]) -> str:
    for prop in page.get("properties", {}).values():
        if prop.get("type") == "title":
            return _plain(prop.get("title", [])) or "Nomsiz sahifa"
    return "Nomsiz sahifa"


def _prop_text(prop: dict[str, Any]) -> str:
    t = prop.get("type")
    v = prop.get(t)
    if v is None:
        return ""
    if t in ("title", "rich_text"):
        return _plain(v)
    if t in ("select", "status"):
        return v.get("name", "")
    if t == "multi_select":
        return ", ".join(x.get("name", "") for x in v)
    if t in ("number", "checkbox", "url", "email", "phone_number"):
        return str(v)
    if t == "date":
        return v.get("start", "") or ""
    if t == "formula":
        return str(v.get(v.get("type"), "") or "")
    return ""


def rt(text: str) -> list[dict[str, Any]]:
    """Matnni Notion rich_text bo'laklariga ajratadi."""
    text = text or ""
    return [{"type": "text", "text": {"content": text[i:i + TEXT_LIMIT]}}
            for i in range(0, max(len(text), 1), TEXT_LIMIT)]


def block(kind: str, text: str) -> dict[str, Any]:
    return {"object": "block", "type": kind, kind: {"rich_text": rt(text)}}


def divider() -> dict[str, Any]:
    return {"object": "block", "type": "divider", "divider": {}}
