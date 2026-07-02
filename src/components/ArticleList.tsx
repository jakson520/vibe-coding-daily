import { ExternalLink, Flame, Gauge } from "lucide-react";
import { ExpandableSummary } from "./ExpandableSummary";
import { FavoriteButton } from "./FavoriteButton";

export type ArticleListItem = {
  id: string;
  title: string;
  url: string;
  heat: number;
  rawSummary: string | null;
  source: {
    name: string;
  };
  analysis: {
    summaryZh: string;
    whyItMatters: string;
    contentType: string;
    finalScore: number;
  } | null;
  tags: Array<{
    tag: {
      name: string;
      slug: string;
    };
  }>;
  favorites: Array<{ id: string }>;
};

type ArticleListProps = {
  articles: ArticleListItem[];
};

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <article
          key={article.id}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span>{article.source.name}</span>
                {article.analysis?.contentType ? (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                    {article.analysis.contentType}
                  </span>
                ) : null}
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[17px] font-bold leading-6 text-slate-950 hover:text-emerald-700"
              >
                {article.title}
                <ExternalLink className="shrink-0" size={14} aria-hidden="true" />
              </a>
            </div>
            <FavoriteButton
              key={`${article.id}:${article.favorites.length}`}
              articleId={article.id}
              initialFavorite={article.favorites.length > 0}
            />
          </div>

          <ExpandableSummary
            summary={article.analysis?.summaryZh}
            fullSummary={article.rawSummary}
          />

          <p className="mt-3 border-l-2 border-amber-400 pl-3 text-sm leading-6 text-slate-600">
            {article.analysis?.whyItMatters}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map(({ tag }) => (
                <span
                  key={tag.slug}
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1" title="推荐分">
                <Gauge size={14} aria-hidden="true" />
                {Math.round((article.analysis?.finalScore ?? 0) * 100)}
              </span>
              <span className="inline-flex items-center gap-1" title="热度">
                <Flame size={14} aria-hidden="true" />
                {Math.round(article.heat)}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
