# SOP — Confluence publish

## Goal

Create a wiki page with the rendered test plan body.

## Inputs

- `confluence_base_url`: e.g. `https://company.atlassian.net/wiki`
- Email + API token (same Atlassian account with Confluence access)
- `space_key`
- `title`
- `body_markdown` (converted to Confluence storage HTML subset)

## Steps

1. Verify connectivity (`/wiki/rest/api/user/current`).
2. `POST /wiki/rest/api/content` with `type: page`, `title`, `space: { key }`, `body.storage` representation `storage`.
3. Return created `id` and `_links.webui`.

## Edge cases

- 400: invalid space key or malformed body — surface API message
- Duplicate title: Confluence allows; optionally append timestamp in future
