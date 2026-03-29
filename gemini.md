# Project constitution — Test Planner Agent

This file is **law** for schemas, behavioral rules, and architecture changes. Planning memory lives in `task_plan.md`, `findings.md`, `progress.md`.

## Discovery (locked defaults for MVP)

| Topic | Decision |
|-------|----------|
| Jira | **Jira Cloud** (`*.atlassian.net`), REST API v3, email + API token |
| LLM | **Pluggable in UI**; default Groq OpenAI-compatible base URL + model |
| Share | **Confluence Cloud** publish (space key + parent optional) + always offer **Markdown** preview/download |
| DOCX | Markdown export in MVP; pixel-perfect Word export deferred |

## Architectural invariants

1. All work-item sources MUST normalize to **`WorkItem`** before generation.
2. Generation MUST follow **`template_outline.json`** section order and IDs.
3. LLM MUST NOT invent requirements absent from `WorkItem` text; use "Not specified in ticket" when needed.
4. Secrets ONLY in `.env` (server-side); browser NEVER stores API keys after session (backend holds config per run — MVP sends creds per request for local trust; production should use server-stored vault).

## JSON schemas

### ConnectorFetchRequest

```json
{
  "provider": "jira",
  "jira_base_url": "https://your-domain.atlassian.net",
  "jira_email": "user@example.com",
  "jira_api_token": "<secret>",
  "issue_key": "PROJ-123"
}
```

### WorkItem (normalized)

```json
{
  "provider": "jira",
  "key": "PROJ-123",
  "summary": "string",
  "description": "string | null",
  "labels": ["string"],
  "issue_type": "string | null",
  "status": "string | null",
  "priority": "string | null",
  "project_key": "string | null",
  "raw": {}
}
```

### LLMConfig

```json
{
  "provider_base_url": "https://api.groq.com/openai/v1",
  "api_key": "<secret>",
  "model": "llama-3.1-8b-instant"
}
```

### TestPlanSection

```json
{
  "id": "objective",
  "title": "Objective",
  "body_markdown": "string"
}
```

### TestPlanDocument

```json
{
  "meta": {
    "ticket_key": "PROJ-123",
    "title": "Product Requirements Document - …",
    "prepared_by": "QA Architecture Team",
    "date": "2026-03-29",
    "version": "1.0"
  },
  "sections": [ { "id": "…", "title": "…", "body_markdown": "…" } ]
}
```

### ShareRequest (Confluence)

```json
{
  "confluence_base_url": "https://your-domain.atlassian.net/wiki",
  "email": "user@example.com",
  "api_token": "<secret>",
  "space_key": "TEAM",
  "title": "Test Plan - PROJ-123",
  "body_markdown": "string",
  "parent_page_id": "optional-string"
}
```

### GenerateTestPlanRequest

```json
{
  "work_item": { },
  "llm": { },
  "additional_context": "optional string",
  "prepared_by": "optional string"
}
```

## Template outline

Canonical machine-readable outline: [`data/template_outline.json`](data/template_outline.json).

## Maintenance log

| Date | Change |
|------|--------|
| 2026-03-29 | Initial constitution, MVP schemas, Jira + Groq + Confluence |
| 2026-03-29 | **Next.js 15 app** in [`web/`](web/): React wizard + `/api/*` routes (TypeScript, Node on Vercel). Legacy FastAPI/Vite removed. |
