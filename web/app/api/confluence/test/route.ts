import { confluenceHandshake } from "@/lib/confluence";
import { apiError } from "@/lib/api-util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  confluence_base_url: string;
  email: string;
  api_token: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const user = await confluenceHandshake(body.confluence_base_url, body.email, body.api_token);
    return NextResponse.json({
      ok: true,
      displayName: user.displayName as string | undefined,
      username: user.username as string | undefined,
    });
  } catch (e) {
    return apiError(e, 400);
  }
}
