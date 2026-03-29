import { jiraHandshake } from "@/lib/jira";
import { apiError } from "@/lib/api-util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  jira_base_url: string;
  jira_email: string;
  jira_api_token: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const me = await jiraHandshake(body.jira_base_url, body.jira_email, body.jira_api_token);
    return NextResponse.json({
      ok: true,
      user: {
        displayName: me.displayName as string | undefined,
        emailAddress: me.emailAddress as string | undefined,
      },
    });
  } catch (e) {
    return apiError(e, 400);
  }
}
