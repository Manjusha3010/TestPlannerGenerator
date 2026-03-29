# Runbook — BLAST Test Planner

> **Vercel (read this if deploy fails):** In the Vercel project, set **Root Directory** to **`web`**. If it stays at the repository root, install will not get Next.js (`node_modules` empty for the app) and the build fails. Optional: set **Node.js Version** to **20.x** (see `web/.nvmrc`).

The application is a **single Next.js 15 (TypeScript) project** under [`web/`](web/). Frontend and API routes are **both Node.js** on the same deployment—suited for **Vercel**.

## Local development

**Option A — from repo root** (recommended after a fresh clone):

```powershell
cd D:\manjusha\AITester2xBlueprint\AI_Agents
npm run install:web
npm run dev
```

**Option B — only inside `web/`:**

```powershell
cd web
npm install
npm run dev
```

Leave the terminal running. Open **http://localhost:3000** in your browser (or Cursor’s Browser tab: paste that URL in the address bar).

**Do not** run `npm run dev` from the repo root without the root `package.json` scripts — the app lives in `web/`. If you see `Could not read package.json`, use Option A or `cd web` first.

API routes are served at the same origin (e.g. `POST /api/generate`).

## Deploy on Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com), **New Project** → import the repo.
3. Set **Root Directory** to `web` (important: not the monorepo root).
4. Framework preset: **Next.js** (auto-detected). Build: `npm run build`, Output: default.
5. Deploy. Production URL will serve the wizard and `/api/*` routes.

[`web/vercel.json`](web/vercel.json) pins the framework and build so Vercel behaves consistently with this repo.

Optional env vars (only if you add server-side defaults later); the UI currently sends Jira/LLM/Confluence credentials per request.

### Vercel CLI: `link` and `pull` (local env / project sync)

Use this when you want **`.env.local`** filled from the Vercel project (or to attach the CLI to the same GitHub deploy).

From repo root:

```powershell
cd web
npm install
npx vercel login
npx vercel link
npx vercel pull --yes
```

Or use the shortcuts after `npm install` inside `web/`:

```powershell
npm run vercel:link
npm run vercel:pull
```

- **`vercel link`** — choose your team and the **TestPlannerGenerator** / Next.js project (root directory should already be `web` on the Vercel dashboard).
- **`vercel pull`** — writes **`.env.local`** (and **`.vercel/project.json`**). Those paths are **gitignored**; do not commit secrets.

From the **repo root** you can run `npm run vercel:link` and `npm run vercel:pull` if you prefer.

### Serverless duration

`POST /api/generate` runs **12 sequential LLM calls** (one per template section). On **Vercel Hobby**, the default function timeout is short and may fail. Use **Vercel Pro** (or higher) and the route already sets `maxDuration = 60` seconds. For very slow providers, consider merging sections into fewer LLM calls in a future change.

## Legacy: Python tools (optional)

The [`tools/`](tools/) Python handshakes still work for local Jira/LLM/Confluence checks; they are **not** used by the Vercel deployment.

## Template data

The canonical outline for the running app is [`web/data/template_outline.json`](web/data/template_outline.json). If you edit [`data/template_outline.json`](data/template_outline.json) at repo root, copy changes into `web/data/` before deploy.

## Troubleshooting

### "Connection failed" / cannot reach `/api/...`

- **Local:** Run `npm run dev` from the `web` folder and open **http://localhost:3000** (not port 5174).
- **Vercel:** Set **Root Directory** to `web` and redeploy. Use the deployment URL Vercel gives you so the UI and `/api/*` share the same origin.

### Jira / Confluence URLs

- **Jira:** Use the site root, e.g. `https://your-domain.atlassian.net`. Browse URLs that end in `/jira` are normalized automatically.
- **Confluence:** Prefer `https://your-domain.atlassian.net/wiki`. If you only enter `https://your-domain.atlassian.net`, `/wiki` is appended for Atlassian Cloud.

### LLM base URL

- Use an OpenAI-compatible base ending in `/v1` (e.g. `https://api.groq.com/openai/v1`). If `/v1` is missing, it is added automatically.

### Generate timeouts on Vercel

- See **Serverless duration** above; Hobby limits may be too low for 12 LLM round-trips.

### Build log shows `next: not found` or “Cannot find module ‘next’”

- **Root Directory** is almost certainly **not** `web`. Fix in Vercel → Project → Settings → General → *Root Directory*.

### Build log shows ESLint / plugin errors only on Vercel

- This repo sets `eslint.ignoreDuringBuilds: true` in [`web/next.config.ts`](web/next.config.ts) so production builds do not fail on lint drift. Run `npm run lint` locally when developing.
