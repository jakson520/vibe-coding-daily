import { CONTENT_TYPES, KEYWORDS } from "../sources";
import { daysSince } from "../text";

type ScoreInput = {
  title: string;
  rawSummary?: string | null;
  publishedAt?: Date | null;
  heat?: number | null;
  trustScore: number;
  sourceName: string;
  sourceType: string;
};

export function classifyContent(input: Pick<ScoreInput, "title" | "rawSummary" | "sourceName">) {
  const text = `${input.title} ${input.rawSummary ?? ""} ${input.sourceName}`.toLowerCase();

  if (/risk|security|vulnerability|privacy|leak|prompt injection|safety|jailbreak/.test(text)) {
    return CONTENT_TYPES.risk;
  }

  if (/tutorial|guide|how to|course|walkthrough|learn|example/.test(text)) {
    return CONTENT_TYPES.tutorial;
  }

  if (/github|repo|repository|open source|stars|launch|show hn/.test(text)) {
    return CONTENT_TYPES.projectCase;
  }

  if (/changelog|release|update|version|cursor|codex|copilot|claude code/.test(text)) {
    return CONTENT_TYPES.toolUpdate;
  }

  return CONTENT_TYPES.trend;
}

export function scoreArticle(input: ScoreInput) {
  const text = `${input.title} ${input.rawSummary ?? ""}`.toLowerCase();
  const keywordHits = KEYWORDS.reduce((count, keyword) => {
    return text.includes(keyword.toLowerCase()) ? count + 1 : count;
  }, 0);

  const relevanceScore = Math.min(1, keywordHits / 3);
  const freshnessScore = Math.max(0, 1 - daysSince(input.publishedAt) / 14);
  const credibilityScore = Math.max(0, Math.min(1, input.trustScore));
  const heatScore = Math.max(0, Math.min(1, Math.log1p(input.heat ?? 0) / Math.log1p(10000)));
  const finalScore =
    relevanceScore * 0.4 + freshnessScore * 0.25 + credibilityScore * 0.2 + heatScore * 0.15;

  return {
    relevanceScore,
    freshnessScore,
    credibilityScore,
    heatScore,
    finalScore,
  };
}

export function passesQualityFilter(title: string, url: string, rawSummary?: string | null) {
  const normalizedTitle = title.trim();
  const text = `${normalizedTitle} ${rawSummary ?? ""}`.toLowerCase();

  if (normalizedTitle.length < 8) {
    return false;
  }

  if (/hiring|who is hiring|freelancer|coupon|promo code|giveaway/.test(text)) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
