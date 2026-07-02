import { KEYWORDS } from "./sources";

const TAG_RULES: Array<{ name: string; pattern: RegExp }> = [
  { name: "Vibe Coding", pattern: /vibe\s+coding/i },
  { name: "AI Coding", pattern: /ai\s+coding|coding assistant|code agent|agentic coding/i },
  { name: "Cursor", pattern: /cursor/i },
  { name: "Claude Code", pattern: /claude\s+code/i },
  { name: "Codex", pattern: /codex|openai/i },
  { name: "GitHub Copilot", pattern: /copilot|github copilot/i },
  { name: "AI Agent", pattern: /ai agent|agentic|agents/i },
  { name: "No-Code", pattern: /no-code|nocode|app builder|ai app builder/i },
  { name: "风险", pattern: /risk|security|vulnerability|privacy|prompt injection|leak/i },
  { name: "教程", pattern: /tutorial|guide|how to|course|walkthrough/i },
  { name: "开源项目", pattern: /github|open source|repo|repository|stars/i },
];

export function extractTags(title: string, summary?: string | null) {
  const text = `${title} ${summary ?? ""}`;
  const tags = new Set<string>();

  for (const rule of TAG_RULES) {
    if (rule.pattern.test(text)) {
      tags.add(rule.name);
    }
  }

  for (const keyword of KEYWORDS) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      tags.add(keyword);
    }
  }

  return Array.from(tags).slice(0, 6);
}

export function slugifyTag(tag: string) {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isRelevantToKeywords(title: string, summary?: string | null) {
  const text = `${title} ${summary ?? ""}`.toLowerCase();
  return KEYWORDS.some((keyword) => text.includes(keyword.toLowerCase()));
}
