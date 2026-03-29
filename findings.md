# Findings

## Template source

- `Test Plan - Template.docx` section flow (TOC / headings): **Test Plan**, **Objective**, **Scope**, **Inclusions**, **Test Environments**, **Defect Reporting Procedure**, **Test Strategy**, **Test Schedule**, **Test Deliverables**, **Entry and Exit Criteria** (with sub-blocks for test execution / closure), **Tools**, **Risks and Mitigations**, **Approvals**.
- Sample body text in the template references **Restful Booker API** as example filler; generated plans must replace with content from the fetched Jira issue, not copy example scope text.

## Jira Cloud

- Issue fetch: `GET /rest/api/3/issue/{issueIdOrKey}` with fields `summary,description,labels,issuetype,status,priority,project,key`.
- Auth: email + API token (Basic) or PAT; Cloud uses `https://{domain}.atlassian.net`.

## Confluence Cloud

- Create page: `POST /wiki/rest/api/content` with `type: page`, `title`, `space.key`, `body.storage` (representation `storage` for wiki markup) or use storage format for HTML-like content. MVP uses **storage** format with escaped content; simple conversion from Markdown to Confluence storage is limited — backend uses a plain `body` text wrapper in storage CDATA-style via `atlassian-doc` pattern: for MVP we send Markdown inside a single `<p>` with/wiki markdown expand or use **wiki** representation if available.
- Practical approach: use Confluence REST v2 **adf** or **storage**: easiest is `body.storage.value` with `<p>...</p>` and newlines as `<br/>` for preview text, or inject as preformatted.

*Update 2026-03-29:* Implemented publish with `body.storage` using HTML-escaped paragraphs from Markdown lines for reliability without extra deps.

## LLM

- Groq OpenAI-compatible: `https://api.groq.com/openai/v1/chat/completions`. Defaults: **`llama-3.1-8b-instant`** (replaces deprecated `llama3-8b-8192`); larger workloads: `llama-3.3-70b-versatile` or `openai/gpt-oss-120b`. See https://console.groq.com/docs/deprecations

## Connector pattern (future ADO / X-Ray)

- All providers normalize to `WorkItem` per `gemini.md`. UI adds `provider` enum later.

## Runtime (2026-03-29)

- Production app: **Next.js** in `web/` — TypeScript API routes (`app/api/**/route.ts`) replace FastAPI for Vercel. Optional Python `tools/` handshakes remain for local CLI use.
- Deploy: Vercel **Root Directory** = `web`.
