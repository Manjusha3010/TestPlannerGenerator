export function renderMarkdown(plan: Record<string, unknown>): string {
  const meta = (plan.meta as Record<string, string>) ?? {};
  const lines: string[] = [
    `# Test Plan - ${meta.ticket_key ?? ""}`,
    "",
    `**Title:** ${meta.title ?? ""}`,
    `**Prepared By:** ${meta.prepared_by ?? ""}`,
    `**Date:** ${meta.date ?? ""}`,
    `**Version:** ${meta.version ?? ""}`,
    "",
  ];
  const sections = (plan.sections as Array<{ title?: string; body_markdown?: string }>) ?? [];
  for (const sec of sections) {
    lines.push(`## ${sec.title ?? ""}`, "", sec.body_markdown ?? "", "");
  }
  return lines.join("\n").trim() + "\n";
}
