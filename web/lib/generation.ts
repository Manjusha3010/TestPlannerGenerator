import { chatCompletion } from "./llm";
import type { TemplateOutline } from "./template";

function workItemPromptBlock(workItem: Record<string, unknown>, extra: string | null): string {
  const lines = [
    `Jira key: ${workItem.key}`,
    `Summary: ${workItem.summary}`,
    `Description:\n${workItem.description || "_(empty)_"}`,
    `Labels: ${((workItem.labels as string[]) ?? []).join(", ")}`,
    `Type: ${workItem.issue_type}`,
    `Status: ${workItem.status}`,
    `Priority: ${workItem.priority}`,
  ];
  if (extra) lines.push(`Additional context from user:\n${extra}`);
  return lines.join("\n");
}

export async function generateTestPlan(
  outline: TemplateOutline,
  workItem: Record<string, unknown>,
  llmBaseUrl: string,
  llmApiKey: string,
  llmModel: string,
  options?: { additionalContext?: string | null; preparedBy?: string | null }
): Promise<Record<string, unknown>> {
  const ticket = (workItem.key as string) || "TICKET";
  const metaTitle = (workItem.summary as string) || "Test Plan";
  const today = new Date().toISOString().slice(0, 10);
  const sections: Array<{ id: string; title: string; body_markdown: string }> = [];

  const wiBlock = workItemPromptBlock(workItem, options?.additionalContext ?? null);

  const ordered = [...outline.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const sec of ordered) {
    const userPrompt = `Section: ${sec.title}
Section id: ${sec.id}

Guidance: ${sec.llm_guidance ?? ""}

Ticket data:
${wiBlock}

Write the section body in Markdown. Start with no H1; you may use ### subheadings if useful.`;
    const body = await chatCompletion(llmBaseUrl, llmApiKey, llmModel, userPrompt);
    sections.push({ id: sec.id, title: sec.title, body_markdown: body });
  }

  return {
    meta: {
      ticket_key: ticket,
      title: metaTitle,
      prepared_by: options?.preparedBy || "QA Architecture Team",
      date: today,
      version: "1.0",
    },
    sections,
  };
}
