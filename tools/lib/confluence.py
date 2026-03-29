from __future__ import annotations

import base64
import html
import json
from typing import Any

import requests


def _basic_auth(email: str, token: str) -> str:
    raw = f"{email}:{token}".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("ascii")


def handshake(base_url: str, email: str, api_token: str) -> dict[str, Any]:
    base = base_url.rstrip("/")
    url = f"{base}/rest/api/user/current"
    r = requests.get(
        url,
        headers={"Accept": "application/json", "Authorization": _basic_auth(email, api_token)},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def markdown_to_storage_html(md: str) -> str:
    """Minimal Markdown → Confluence storage: paragraphs and **bold**."""
    lines: list[str] = []
    for block in md.replace("\r\n", "\n").split("\n\n"):
        block = block.strip()
        if not block:
            continue
        out = []
        for line in block.split("\n"):
            parts = line.split("**")
            if len(parts) % 2 == 1:
                esc = [html.escape(p) for p in parts]
                line_html = "".join(
                    esc[i] if i % 2 == 0 else f"<strong>{esc[i]}</strong>" for i in range(len(esc))
                )
            else:
                line_html = html.escape(line)
            out.append(line_html + "<br/>")
        lines.append("<p>" + "".join(out) + "</p>")
    return "".join(lines) if lines else "<p></p>"


def create_page(
    base_url: str,
    email: str,
    api_token: str,
    space_key: str,
    title: str,
    body_markdown: str,
    parent_page_id: str | None = None,
) -> dict[str, Any]:
    base = base_url.rstrip("/")
    url = f"{base}/rest/api/content"
    storage = markdown_to_storage_html(body_markdown)
    body: dict[str, Any] = {
        "type": "page",
        "title": title,
        "space": {"key": space_key},
        "body": {
            "storage": {
                "value": storage,
                "representation": "storage",
            }
        },
    }
    if parent_page_id:
        body["ancestors"] = [{"id": parent_page_id}]
    r = requests.post(
        url,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": _basic_auth(email, api_token),
        },
        data=json.dumps(body),
        timeout=120,
    )
    r.raise_for_status()
    return r.json()
