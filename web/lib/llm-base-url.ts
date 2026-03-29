/**
 * OpenAI-compatible APIs expect requests to .../v1/chat/completions
 */
export function normalizeOpenAiCompatibleBase(url: string): string {
  let u = url.trim().replace(/\/+$/, "");
  if (!u) return "https://api.groq.com/openai/v1";
  if (!/\/v1$/i.test(u)) {
    u = `${u}/v1`;
  }
  return u;
}
