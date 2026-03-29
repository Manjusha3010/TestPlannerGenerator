from __future__ import annotations

import json
from typing import Any

import requests

SYSTEM_PROMPT = """You are a senior QA architect writing test plan sections.
Rules:
- Use ONLY information from the provided Jira ticket (key, summary, description, labels) and optional user context.
- If something is unknown, say exactly: Not specified in ticket
- Do not invent APIs, URLs, or features not present in the ticket text.
- Respond with Markdown body only for this section (no JSON, no front matter)."""


def chat_completion(
    base_url: str,
    api_key: str,
    model: str,
    user_prompt: str,
    temperature: float = 0.3,
) -> str:
    url = base_url.rstrip("/") + "/chat/completions"
    payload = {
        "model": model,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    }
    r = requests.post(
        url,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        data=json.dumps(payload),
        timeout=120,
    )
    r.raise_for_status()
    data = r.json()
    return data["choices"][0]["message"]["content"].strip()


def handshake(base_url: str, api_key: str, model: str) -> dict[str, Any]:
    text = chat_completion(
        base_url,
        api_key,
        model,
        'Reply with the single word: ok',
        temperature=0,
    )
    return {"sample": text[:200]}
