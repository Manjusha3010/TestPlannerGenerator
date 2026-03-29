from __future__ import annotations

import json
from typing import Any


def load_outline(path) -> dict[str, Any]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)
