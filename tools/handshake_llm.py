#!/usr/bin/env python3
"""Verify LLM (OpenAI-compatible) API. Writes sample JSON to .tmp/ on success."""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

_TOOLS = Path(__file__).resolve().parent
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from lib.llm import handshake  # noqa: E402
from lib.paths import tmp_dir  # noqa: E402


def main() -> int:
    load_dotenv()
    base = os.environ.get("LLM_BASE_URL", "https://api.groq.com/openai/v1").strip()
    key = os.environ.get("LLM_API_KEY", "").strip()
    model = os.environ.get("LLM_MODEL", "llama-3.1-8b-instant").strip()
    if not key:
        print("Set LLM_API_KEY in .env", file=sys.stderr)
        return 1
    try:
        sample = handshake(base, key, model)
    except Exception as e:
        print(f"LLM handshake failed: {e}", file=sys.stderr)
        return 2
    out = tmp_dir() / "handshake_llm.json"
    out.write_text(json.dumps(sample, indent=2), encoding="utf-8")
    print(f"ok wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
