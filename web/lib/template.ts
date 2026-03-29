import fs from "fs";
import path from "path";

export type OutlineSection = {
  id: string;
  title: string;
  order: number;
  llm_guidance?: string;
};

export type TemplateOutline = {
  version: number;
  sections: OutlineSection[];
};

export function loadTemplateOutline(): TemplateOutline {
  const p = path.join(process.cwd(), "data", "template_outline.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as TemplateOutline;
}
