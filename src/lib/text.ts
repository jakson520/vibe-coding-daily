import crypto from "node:crypto";

export function parseSourceConfig<T extends Record<string, unknown>>(
  config: string | null | undefined,
  fallback: T,
): T {
  if (!config) {
    return fallback;
  }

  try {
    return { ...fallback, ...(JSON.parse(config) as Record<string, unknown>) } as T;
  } catch {
    return fallback;
  }
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function contentHash(input: string) {
  return crypto.createHash("sha1").update(input.toLowerCase().trim()).digest("hex");
}

export function truncateText(value: string | null | undefined, maxLength: number) {
  if (!value) {
    return "";
  }

  const normalized = normalizeWhitespace(stripHtml(value));
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

export function getHongKongDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function daysAgoDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export function daysSince(date: Date | null | undefined) {
  if (!date) {
    return 7;
  }

  const diff = Date.now() - date.getTime();
  return Math.max(0, diff / (1000 * 60 * 60 * 24));
}

export function safeUrl(url: string, base?: string) {
  try {
    return new URL(url, base).toString();
  } catch {
    return base ?? url;
  }
}
