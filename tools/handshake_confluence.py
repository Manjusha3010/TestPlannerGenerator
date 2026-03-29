#!/usr/bin/env python3
"""Verify Confluence Cloud credentials. Writes sample JSON to .tmp/ on success."""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

_TOOLS = Path(__file__).resolve().parent
if str(_TOOLS) not in sys.path:
    sys.path.insert(0, str(_TOOLS))

from lib.confluence import handshake  # noqa: E402
from lib.paths import tmp_dir  # noqa: E402


def main() -> int:
    load_dotenv()
    base = os.environ.get("CONFLUENCE_BASE_URL", "").strip()
    email = os.environ.get("CONFLUENCE_EMAIL", os.environ.get("JIRA_EMAIL", "")).strip()
    token = os.environ.get(
        "CONFLUENCE_API_TOKEN",
        os.environ.get("JIRA_API_TOKEN", ""),
    ).strip()
    if not base or not email or not token:
        print("Set CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN in .env", file=sys.stderr)
        return 1
    try:
        user = handshake(base, email, token)
    except Exception as e:
        print(f"Confluence handshake failed: {e}", file=sys.stderr)
        return 2
    out = tmp_dir() / "handshake_confluence.json"
    out.write_text(json.dumps(user, indent=2), encoding="utf-8")
    print(f"ok wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
