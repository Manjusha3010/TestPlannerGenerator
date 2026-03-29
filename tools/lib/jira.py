from __future__ import annotations

import base64
import json
from typing import Any

import requests


def _basic_auth(email: str, token: str) -> str:
    raw = f"{email}:{token}".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("ascii")


def adf_to_text(node: Any) -> str:
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, dict):
        parts: list[str] = []
        if node.get("type") == "text" and "text" in node:
            parts.append(str(node["text"]))
        for child in node.get("content") or []:
            parts.append(adf_to_text(child))
        return "".join(parts)
    if isinstance(node, list):
        return "".join(adf_to_text(x) for x in node)
    return ""


def fetch_issue(base_url: str, email: str, api_token: str, issue_key: str) -> dict[str, Any]:
    base = base_url.rstrip("/")
    url = f"{base}/rest/api/3/issue/{issue_key}"
    params = {
        "fields": "summary,description,labels,issuetype,status,priority,project",
    }
    r = requests.get(
        url,
        params=params,
        headers={"Accept": "application/json", "Authorization": _basic_auth(email, api_token)},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


def normalize_work_item(data: dict[str, Any]) -> dict[str, Any]:
    fields = data.get("fields") or {}
    desc = fields.get("description")
    desc_text = adf_to_text(desc) if isinstance(desc, dict) else (desc or "") or ""
    it = fields.get("issuetype") or {}
    st = fields.get("status") or {}
    pr = fields.get("priority") or {}
    proj = fields.get("project") or {}
    return {
        "provider": "jira",
        "key": data.get("key"),
        "summary": fields.get("summary") or "",
        "description": desc_text or None,
        "labels": list(fields.get("labels") or []),
        "issue_type": it.get("name"),
        "status": st.get("name"),
        "priority": pr.get("name"),
        "project_key": proj.get("key"),
        "raw": data,
    }


def handshake(base_url: str, email: str, api_token: str) -> dict[str, Any]:
    base = base_url.rstrip("/")
    url = f"{base}/rest/api/3/myself"
    r = requests.get(
        url,
        headers={"Accept": "application/json", "Authorization": _basic_auth(email, api_token)},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()
