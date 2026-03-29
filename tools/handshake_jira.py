#!/usr/bin/env python3
"""Verify Jira Cloud credentials. Writes sample JSON to .tmp/ on success."""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Allow `python tools/handshake_jira.py` from repo root
_TOOLS = Path(__file__).resolve().parent
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from lib.jira import handshake  # noqa: E402
from lib.paths import tmp_dir  # noqa: E402


def main() -> int:
    load_dotenv()
    base = os.environ.get("JIRA_BASE_URL", "").strip()
    email = os.environ.get("JIRA_EMAIL", "").strip()
    token = os.environ.get("JIRA_API_TOKEN", "").strip()
    if not base or not email or not token:
        print("Set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN in .env", file=sys.stderr)
        return 1
    try:
        me = handshake(base, email, token)
    except Exception as e:
        print(f"Jira handshake failed: {e}", file=sys.stderr)
        return 2
    out = tmp_dir() / "handshake_jira.json"
    out.write_text(json.dumps(me, indent=2), encoding="utf-8")
    print(f"ok wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
