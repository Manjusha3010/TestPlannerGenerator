import { llmHandshake } from "@/lib/llm";
import { apiError } from "@/lib/api-util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  provider_base_url?: string;
  api_key: string;
  model?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const sample = await llmHandshake(
      body.provider_base_url ?? "https://api.groq.com/openai/v1",
      body.api_key,
      body.model ?? "llama-3.1-8b-instant"
    );
    return NextResponse.json({ ok: true, sample });
  } catch (e) {
    return apiError(e, 400);
  }
}
