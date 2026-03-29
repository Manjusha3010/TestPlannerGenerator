from __future__ import annotations

from datetime import date
from typing import Any

from . import llm as llm_mod
from .template_data import load_outline


def _work_item_prompt_block(work_item: dict[str, Any], extra: str | None) -> str:
    lines = [
        f"Jira key: {work_item.get('key')}",
        f"Summary: {work_item.get('summary')}",
        f"Description:\n{work_item.get('description') or '_(empty)_'}",
        f"Labels: {', '.join(work_item.get('labels') or [])}",
        f"Type: {work_item.get('issue_type')}",
        f"Status: {work_item.get('status')}",
        f"Priority: {work_item.get('priority')}",
    ]
    if extra:
        lines.append(f"Additional context from user:\n{extra}")
    return "\n".join(lines)


def generate_test_plan(
    outline_path,
    work_item: dict[str, Any],
    llm_base_url: str,
    llm_api_key: str,
    llm_model: str,
    additional_context: str | None = None,
    prepared_by: str | None = None,
) -> dict[str, Any]:
    outline = load_outline(outline_path)
    ticket = work_item.get("key") or "TICKET"
    meta_title = work_item.get("summary") or "Test Plan"
    doc: dict[str, Any] = {
        "meta": {
            "ticket_key": ticket,
            "title": meta_title,
            "prepared_by": prepared_by or "QA Architecture Team",
            "date": str(date.today()),
            "version": "1.0",
        },
        "sections": [],
    }
    wi_block = _work_item_prompt_block(work_item, additional_context)
    for sec in sorted(outline.get("sections") or [], key=lambda s: s.get("order", 0)):
        sid = sec["id"]
        title = sec["title"]
        guidance = sec.get("llm_guidance") or ""
        user_prompt = f"""Section: {title}
Section id: {sid}

Guidance: {guidance}

Ticket data:
{wi_block}

Write the section body in Markdown. Start with no H1; you may use ### subheadings if useful."""
        body = llm_mod.chat_completion(llm_base_url, llm_api_key, llm_model, user_prompt)
        doc["sections"].append({"id": sid, "title": title, "body_markdown": body})
    return doc
