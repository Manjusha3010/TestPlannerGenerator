import { fetchIssue, normalizeWorkItem } from "@/lib/jira";
import { apiError } from "@/lib/api-util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  jira_base_url: string;
  jira_email: string;
  jira_api_token: string;
  issue_key: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const raw = await fetchIssue(
      body.jira_base_url,
      body.jira_email,
      body.jira_api_token,
      body.issue_key.trim()
    );
    const workItem = normalizeWorkItem(raw);
    const desc = (workItem.description as string) || "";
    let previewText = `${workItem.key}: ${workItem.summary}\n\n`;
    previewText += desc.length > 2000 ? desc.slice(0, 2000) + "…" : desc;
    return NextResponse.json({ work_item: workItem, preview_text: previewText });
  } catch (e) {
    return apiError(e, 400);
  }
}
