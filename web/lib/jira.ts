import { normalizeJiraSiteUrl } from "./atlassian-urls";
import { abortAfter } from "./fetch-timeout";

export function basicAuthHeader(email: string, token: string): string {
  const raw = Buffer.from(`${email}:${token}`, "utf8").toString("base64");
  return `Basic ${raw}`;
}

export function adfToText(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(adfToText).join("");
  if (typeof node === "object" && node !== null) {
    const o = node as Record<string, unknown>;
    const parts: string[] = [];
    if (o.type === "text" && typeof o.text === "string") parts.push(o.text);
    const content = o.content;
    if (Array.isArray(content)) parts.push(...content.map(adfToText));
    return parts.join("");
  }
  return "";
}

export async function fetchIssue(
  baseUrl: string,
  email: string,
  apiToken: string,
  issueKey: string
): Promise<Record<string, unknown>> {
  const base = normalizeJiraSiteUrl(baseUrl);
  const url = new URL(`${base}/rest/api/3/issue/${encodeURIComponent(issueKey)}`);
  url.searchParams.set("fields", "summary,description,labels,issuetype,status,priority,project");
  const r = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: basicAuthHeader(email, apiToken),
    },
    signal: abortAfter(60_000),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Jira ${r.status}: ${t.slice(0, 500)}`);
  }
  return r.json() as Promise<Record<string, unknown>>;
}

export function normalizeWorkItem(data: Record<string, unknown>): Record<string, unknown> {
  const fields = (data.fields as Record<string, unknown> | undefined) ?? {};
  const desc = fields.description;
  const descText =
    typeof desc === "object" && desc !== null ? adfToText(desc) : String(desc ?? "") || "";
  const it = fields.issuetype as { name?: string } | undefined;
  const st = fields.status as { name?: string } | undefined;
  const pr = fields.priority as { name?: string } | undefined;
  const proj = fields.project as { key?: string } | undefined;
  return {
    provider: "jira",
    key: data.key,
    summary: (fields.summary as string) ?? "",
    description: descText || null,
    labels: Array.isArray(fields.labels) ? [...(fields.labels as string[])] : [],
    issue_type: it?.name,
    status: st?.name,
    priority: pr?.name,
    project_key: proj?.key,
  };
}

export async function jiraHandshake(
  baseUrl: string,
  email: string,
  apiToken: string
): Promise<Record<string, unknown>> {
  const base = normalizeJiraSiteUrl(baseUrl);
  const r = await fetch(`${base}/rest/api/3/myself`, {
    headers: {
      Accept: "application/json",
      Authorization: basicAuthHeader(email, apiToken),
    },
    signal: abortAfter(30_000),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Jira ${r.status}: ${t.slice(0, 500)}`);
  }
  return r.json() as Promise<Record<string, unknown>>;
}
