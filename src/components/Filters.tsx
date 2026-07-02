import Link from "next/link";
import { Check, ChevronDown, ChevronUp, Tags } from "lucide-react";

type FiltersProps = {
  tags: Array<{
    name: string;
    slug: string;
  }>;
  selectedTag?: string;
};

const COLLAPSED_TAG_COUNT = 12;

function TagLink({
  tag,
  selectedTag,
}: {
  tag: { name: string; slug: string };
  selectedTag?: string;
}) {
  const isSelected = selectedTag === tag.slug;

  return (
    <Link
      href={`/?tag=${encodeURIComponent(tag.slug)}`}
      title={tag.name}
      className={`flex min-h-9 min-w-0 items-center justify-between gap-1 rounded-md border px-2.5 text-sm transition-colors ${
        isSelected
          ? "border-emerald-200 bg-emerald-50 font-semibold text-emerald-900 shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
      }`}
    >
      <span className="min-w-0 truncate">{tag.name}</span>
      {isSelected ? <Check className="shrink-0" size={14} aria-hidden="true" /> : null}
    </Link>
  );
}

export function Filters({ tags, selectedTag }: FiltersProps) {
  const selected = tags.find((tag) => tag.slug === selectedTag);
  const collapsedTags = tags.slice(0, COLLAPSED_TAG_COUNT);

  if (selected && !collapsedTags.some((tag) => tag.slug === selected.slug)) {
    collapsedTags[COLLAPSED_TAG_COUNT - 1] = selected;
  }

  const collapsedSlugs = new Set(collapsedTags.map((tag) => tag.slug));
  const remainingTags = tags.filter((tag) => !collapsedSlugs.has(tag.slug));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <Tags size={17} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-950">标签筛选</h2>
            <p className="mt-0.5 text-xs text-slate-500">{tags.length} 个标签</p>
          </div>
        </div>
        {selected ? (
          <span className="max-w-28 truncate text-xs font-medium text-emerald-700" title={selected.name}>
            {selected.name}
          </span>
        ) : null}
      </div>

      <Link
        href="/"
        className={`mt-3 flex min-h-10 w-full items-center justify-between rounded-md border px-3 text-sm font-semibold transition-colors ${
          selectedTag
            ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            : "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm"
        }`}
      >
        <span>全部内容</span>
        {!selectedTag ? <Check size={15} aria-hidden="true" /> : null}
      </Link>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {collapsedTags.map((tag) => (
          <TagLink key={tag.slug} tag={tag} selectedTag={selectedTag} />
        ))}
      </div>

      {remainingTags.length > 0 ? (
        <details className="group mt-2">
          <summary
            title="展开或收起全部标签"
            className="flex h-9 cursor-pointer list-none items-center justify-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors marker:hidden hover:bg-slate-100 hover:text-slate-950"
          >
            <ChevronDown className="group-open:hidden" size={16} aria-hidden="true" />
            <ChevronUp className="hidden group-open:block" size={16} aria-hidden="true" />
            <span className="group-open:hidden">更多标签（{remainingTags.length}）</span>
            <span className="hidden group-open:inline">收起</span>
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {remainingTags.map((tag) => (
              <TagLink key={tag.slug} tag={tag} selectedTag={selectedTag} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
