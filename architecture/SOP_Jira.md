# SOP — Jira work item fetch

## Goal

Given Cloud URL, email, API token, and issue key, return a normalized `WorkItem`.

## Inputs

- `jira_base_url`: HTTPS origin, no trailing slash path beyond host (e.g. `https://company.atlassian.net`)
- Credentials: email + API token (Basic auth)

## Steps

1. `GET {base}/rest/api/3/issue/{key}?fields=summary,description,labels,issuetype,status,priority,project`
2. Map response to `WorkItem` per `gemini.md`.
3. Convert `description` from Atlassian Document Format to plaintext for LLM context.

## Edge cases

- 404: invalid key or project access
- 401: bad token or email
- Description missing: use empty string

## Rate limits

Respect Jira Cloud rate limits; backoff on 429.
