import { abortAfter } from "./fetch-timeout";
import { normalizeOpenAiCompatibleBase } from "./llm-base-url";

const SYSTEM_PROMPT = `You are a senior QA architect writing test plan sections.
Rules:
- Use ONLY information from the provided Jira ticket (key, summary, description, labels) and optional user context.
- If something is unknown, say exactly: Not specified in ticket
- Do not invent APIs, URLs, or features not present in the ticket text.
- Respond with Markdown body only for this section (no JSON, no front matter).`;

export async function chatCompletion(
  baseUrl: string,
  apiKey: string,
  model: string,
  userPrompt: string,
  temperature = 0.3
): Promise<string> {
  const base = normalizeOpenAiCompatibleBase(baseUrl);
  const url = `${base}/chat/completions`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
    signal: abortAfter(120_000),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`LLM ${r.status}: ${t.slice(0, 500)}`);
  }
  const data = (await r.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  return text;
}

export async function llmHandshake(
  baseUrl: string,
  apiKey: string,
  model: string
): Promise<{ sample: string }> {
  const text = await chatCompletion(baseUrl, apiKey, model, "Reply with the single word: ok", 0);
  return { sample: text.slice(0, 200) };
}
