import { createPage } from "@/lib/confluence";
import { apiError } from "@/lib/api-util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  confluence_base_url: string;
  email: string;
  api_token: string;
  space_key: string;
  title: string;
  body_markdown: string;
  parent_page_id?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const result = await createPage(
      body.confluence_base_url,
      body.email,
      body.api_token,
      body.space_key,
      body.title,
      body.body_markdown,
      body.parent_page_id ?? undefined
    );
    const links = (result._links as Record<string, string> | undefined) ?? {};
    return NextResponse.json({
      ok: true,
      id: result.id,
      webui: links.webui,
    });
  } catch (e) {
    return apiError(e, 400);
  }
}
