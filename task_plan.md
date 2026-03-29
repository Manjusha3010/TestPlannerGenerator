# Task plan — B.L.A.S.T Test Planner Agent

## Phases

### Protocol 0 — Initialization

- [x] `task_plan.md`, `findings.md`, `progress.md`, `gemini.md`
- [x] `.gitignore` for secrets and intermediates
- [x] `architecture/README.md` (SOP index)

### Phase 1 — Blueprint

- [x] Template outline derived from `Test Plan - Template.docx` (see `data/template_outline.json` and `gemini.md`)
- [x] JSON data schemas: `WorkItem`, `TestPlanDocument`, `ShareRequest`, connector metadata
- [x] Discovery defaults documented in `gemini.md` (Jira Cloud, Groq/OpenAI-compatible LLM, Confluence publish + Markdown export)

### Phase 2 — Link

- [x] `.env.example`
- [x] `tools/handshake_jira.py`, `tools/handshake_llm.py`, `tools/handshake_confluence.py`

### Phase 3 — Architect

- [x] SOPs under `architecture/`
- [x] Python tools: fetch, generate, render, publish
- [x] FastAPI backend orchestration

### Phase 4 — Stylize

- [x] Next.js (React + TypeScript) wizard UI (LLM, Jira, ticket, result + Confluence)

### Phase 5 — Trigger

- [x] `RUNBOOK.md` (Vercel + local Next.js), maintenance notes in `gemini.md`

## North star

From a Jira issue key, produce a test plan aligned to the template structure, preview as Markdown, optionally publish to Confluence.

## Deferred (Phase 2+)

- Azure DevOps, X-Ray connectors (same `WorkItem` contract)
- DOCX export matching Word styles exactly
