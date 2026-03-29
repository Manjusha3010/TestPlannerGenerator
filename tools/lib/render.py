from __future__ import annotations

from typing import Any


def render_markdown(plan: dict[str, Any]) -> str:
    meta = plan.get("meta") or {}
    lines: list[str] = [
        f"# Test Plan - {meta.get('ticket_key', '')}",
        "",
        f"**Title:** {meta.get('title', '')}",
        f"**Prepared By:** {meta.get('prepared_by', '')}",
        f"**Date:** {meta.get('date', '')}",
        f"**Version:** {meta.get('version', '')}",
        "",
    ]
    for sec in plan.get("sections") or []:
        lines.append(f"## {sec.get('title')}")
        lines.append("")
        lines.append(sec.get("body_markdown") or "")
        lines.append("")
    return "\n".join(lines).strip() + "\n"
