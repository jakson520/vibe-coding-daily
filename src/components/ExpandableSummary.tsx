import { ChevronUp, Ellipsis } from "lucide-react";

type ExpandableSummaryProps = {
  summary?: string | null;
  fullSummary?: string | null;
};

const PREVIEW_LENGTH = 82;

function removeAboutPrefix(summary: string) {
  const normalized = summary.trim();

  if (!normalized.startsWith("关于")) {
    return normalized;
  }

  const colonIndex = normalized.search(/[：:]/u);

  if (colonIndex < 0 || colonIndex > 140) {
    return normalized;
  }

  return normalized.slice(colonIndex + 1).trim();
}

export function ExpandableSummary({ summary, fullSummary }: ExpandableSummaryProps) {
  if (!summary) {
    return null;
  }

  const cleanSummary = removeAboutPrefix(summary);
  const completeSummary = fullSummary?.trim() || cleanSummary;
  const characters = Array.from(cleanSummary);
  const needsTruncation = characters.length > PREVIEW_LENGTH;
  const storedPreview = needsTruncation
    ? characters.slice(0, PREVIEW_LENGTH).join("").trimEnd()
    : cleanSummary;
  const preview = storedPreview.replace(/(?:\.{3}|…)\s*$/u, "").trimEnd();
  const isExpandable = needsTruncation || completeSummary !== cleanSummary || preview !== cleanSummary;

  if (!isExpandable) {
    return <p className="mt-3 text-[15px] font-medium leading-6 text-slate-800">{cleanSummary}</p>;
  }

  return (
    <details className="group mt-3">
      <summary
        title="展开或收起完整摘要"
        className="cursor-pointer list-none text-[15px] font-medium leading-6 text-slate-800 marker:hidden"
      >
        <span className="group-open:hidden">{preview}</span>
        <span className="hidden group-open:inline">{completeSummary}</span>
        <span className="ml-1 inline-flex h-6 min-w-6 translate-y-0.5 items-center justify-center rounded text-emerald-700 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-900">
          <Ellipsis className="group-open:hidden" size={18} aria-hidden="true" />
          <ChevronUp className="hidden group-open:block" size={15} aria-hidden="true" />
          <span className="sr-only">展开或收起完整摘要</span>
        </span>
      </summary>
    </details>
  );
}
