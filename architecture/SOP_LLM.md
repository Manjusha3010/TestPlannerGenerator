# SOP — LLM generation

## Goal

Fill each template section using ticket context and `llm_guidance`, without hallucinating requirements.

## System rules (must be injected)

- Only use facts from the provided Jira key, summary, description, labels, and user `additional_context`.
- If information is missing, write: **Not specified in ticket** (do not fabricate URLs, APIs, or features).
- Output **only** the body for the requested section in Markdown (headings optional; no YAML front matter).

## User prompt pattern

For each section: supply `section_title`, `llm_guidance`, and compact `work_item` fields.

## Model configuration

Provider: OpenAI-compatible chat completions. Temperature: 0.3 for consistency.
