import { normalizeConfluenceBaseUrl } from "./atlassian-urls";
import { abortAfter } from "./fetch-timeout";

function basicAuthHeader(email: string, token: string): string {
  const raw = Buffer.from(`${email}:${token}`, "utf8").toString("base64");
  return `Basic ${raw}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function markdownToStorageHtml(md: string): string {
  const blocks = md.replace(/\r\n/g, "\n").split("\n\n");
  const parts: string[] = [];
  for (const blockRaw of blocks) {
    const block = blockRaw.trim();
    if (!block) continue;
    const lines = block.split("\n");
    const lineParts: string[] = [];
    for (const line of lines) {
      const segs = line.split("**");
      let lineHtml: string;
      if (segs.length % 2 === 1) {
        lineHtml = segs
          .map((p, i) => (i % 2 === 0 ? escapeHtml(p) : `<strong>${escapeHtml(p)}</strong>`))
          .join("");
      } else {
        lineHtml = escapeHtml(line);
      }
      lineParts.push(lineHtml + "<br/>");
    }
    parts.push("<p>" + lineParts.join("") + "</p>");
  }
  return parts.length ? parts.join("") : "<p></p>";
}

export async function confluenceHandshake(
  baseUrl: string,
  email: string,
  apiToken: string
): Promise<Record<string, unknown>> {
  const base = normalizeConfluenceBaseUrl(baseUrl);
  const r = await fetch(`${base}/rest/api/user/current`, {
    headers: {
      Accept: "application/json",
      Authorization: basicAuthHeader(email, apiToken),
    },
    signal: abortAfter(30_000),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Confluence ${r.status}: ${t.slice(0, 500)}`);
  }
  return r.json() as Promise<Record<string, unknown>>;
}

export async function createPage(
  baseUrl: string,
  email: string,
  apiToken: string,
  spaceKey: string,
  title: string,
  bodyMarkdown: string,
  parentPageId?: string | null
): Promise<Record<string, unknown>> {
  const base = normalizeConfluenceBaseUrl(baseUrl);
  const storage = markdownToStorageHtml(bodyMarkdown);
  const body: Record<string, unknown> = {
    type: "page",
    title,
    space: { key: spaceKey },
    body: {
      storage: {
        value: storage,
        representation: "storage",
      },
    },
  };
  if (parentPageId) body.ancestors = [{ id: parentPageId }];
  const r = await fetch(`${base}/rest/api/content`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: basicAuthHeader(email, apiToken),
    },
    body: JSON.stringify(body),
    signal: abortAfter(120_000),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Confluence ${r.status}: ${t.slice(0, 500)}`);
  }
  return r.json() as Promise<Record<string, unknown>>;
}
