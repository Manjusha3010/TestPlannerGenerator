# SOP — Template mapping

## Goal

Bind `data/template_outline.json` sections to generation slots without altering order or ids.

## Rules

1. Load outline from repo `data/template_outline.json`.
2. Each section gets a `body_markdown` filled only via `SOP_LLM.md` process.
3. Do not drop sections; bodies may state "Not specified in ticket" when source lacks info.
