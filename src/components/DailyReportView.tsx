import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckCircle2,
  Flame,
  GraduationCap,
  ShieldAlert,
  Sparkles,
  Wrench,
} from "lucide-react";
import { REPORT_SECTIONS } from "@/lib/sources";
import { ArticleList, type ArticleListItem } from "./ArticleList";

type ReportItem = {
  section: string;
  article: ArticleListItem;
};

type DailyReportViewProps = {
  report: {
    title: string;
    reportDate: string;
    brief: string;
    actionAdvice: string;
    items: ReportItem[];
  };
  selectedTag?: string;
};

const SECTION_ORDER = [
  REPORT_SECTIONS.mostImportant,
  REPORT_SECTIONS.toolUpdates,
  REPORT_SECTIONS.hotProjects,
  REPORT_SECTIONS.tutorials,
  REPORT_SECTIONS.risks,
];

const SECTION_META: Record<
  string,
  { icon: LucideIcon; borderClass: string; iconClass: string }
> = {
  [REPORT_SECTIONS.mostImportant]: {
    icon: Sparkles,
    borderClass: "border-emerald-500",
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  [REPORT_SECTIONS.toolUpdates]: {
    icon: Wrench,
    borderClass: "border-sky-500",
    iconClass: "bg-sky-100 text-sky-700",
  },
  [REPORT_SECTIONS.hotProjects]: {
    icon: Flame,
    borderClass: "border-amber-500",
    iconClass: "bg-amber-100 text-amber-700",
  },
  [REPORT_SECTIONS.tutorials]: {
    icon: GraduationCap,
    borderClass: "border-cyan-500",
    iconClass: "bg-cyan-100 text-cyan-700",
  },
  [REPORT_SECTIONS.risks]: {
    icon: ShieldAlert,
    borderClass: "border-rose-500",
    iconClass: "bg-rose-100 text-rose-700",
  },
};

export function DailyReportView({ report, selectedTag }: DailyReportViewProps) {
  const isPersonalized = report.title.includes("专属版");
  const filteredItems = selectedTag
    ? report.items.filter((item) =>
        item.article.tags.some(({ tag }) => tag.slug === selectedTag),
      )
    : report.items;

  return (
    <div className="space-y-7">
      <section className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarDays size={16} aria-hidden="true" />
              {report.reportDate}
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl">
              Vibe Coding Daily
            </h1>
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              {report.reportDate} 中文日报{isPersonalized ? " · 专属版" : ""}
            </p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {filteredItems.length} 条推荐
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{report.brief}</p>
      </section>

      {SECTION_ORDER.map((section) => {
        const sectionArticles = filteredItems
          .filter((item) => item.section === section)
          .map((item) => item.article);

        if (sectionArticles.length === 0) {
          return null;
        }

        const meta = SECTION_META[section] ?? SECTION_META[REPORT_SECTIONS.mostImportant];
        const Icon = meta.icon;

        return (
          <section key={section} className="space-y-3">
            <div className={`flex items-center gap-3 border-b-2 pb-3 ${meta.borderClass}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.iconClass}`}>
                <Icon size={18} aria-hidden="true" />
              </span>
              <h2 className="text-xl font-bold text-slate-950">{section}</h2>
              <span className="ml-auto text-xs font-semibold text-slate-500">{sectionArticles.length} 条</span>
            </div>
            <ArticleList articles={sectionArticles} />
          </section>
        );
      })}

      <section className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
          <CheckCircle2 className="text-emerald-700" size={18} aria-hidden="true" />
          今日行动建议
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">{report.actionAdvice}</p>
      </section>
    </div>
  );
}
