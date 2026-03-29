import { generateTestPlan } from "@/lib/generation";
import { renderMarkdown } from "@/lib/render";
import { loadTemplateOutline } from "@/lib/template";
import { apiError } from "@/lib/api-util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Vercel Pro: raise if you need long multi-section LLM runs (12 calls). Hobby ~10s may time out. */
export const maxDuration = 60;

type LLM = {
  provider_base_url?: string;
  api_key: string;
  model?: string;
};

type Body = {
  work_item: Record<string, unknown>;
  llm: LLM;
  additional_context?: string | null;
  prepared_by?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const outline = loadTemplateOutline();
    const plan = await generateTestPlan(
      outline,
      body.work_item,
      body.llm.provider_base_url ?? "https://api.groq.com/openai/v1",
      body.llm.api_key,
      body.llm.model ?? "llama-3.1-8b-instant",
      {
        additionalContext: body.additional_context ?? null,
        preparedBy: body.prepared_by ?? null,
      }
    );
    const markdown = renderMarkdown(plan);
    return NextResponse.json({ test_plan: plan, markdown });
  } catch (e) {
    return apiError(e, 400);
  }
}
