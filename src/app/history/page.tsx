import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { DeleteReportButton } from "@/components/DeleteReportButton";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const reports = await prisma.dailyReport.findMany({
    orderBy: {
      reportDate: "desc",
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
      items: {
        orderBy: {
          rank: "asc",
        },
        take: 3,
        include: {
          article: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">历史日报</h1>
          <p className="mt-2 text-sm text-slate-600">按日期回看每日 AI 编程推荐。</p>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={15} aria-hidden="true" />
                    {report.reportDate}
                  </div>
                  <Link
                    href={`/?date=${encodeURIComponent(report.reportDate)}`}
                    className="mt-1 block text-lg font-semibold text-slate-950 hover:text-emerald-700"
                  >
                    {report.title}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{report.brief}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.items.map((item) => (
                      <span
                        key={item.id}
                        className="max-w-full truncate rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                      >
                        {item.article.title}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/?date=${encodeURIComponent(report.reportDate)}`}
                    className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    aria-label={`查看 ${report.reportDate} 的日报`}
                  >
                    {report._count.items} 条
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                  <DeleteReportButton reportId={report.id} reportDate={report.reportDate} />
                </div>
              </div>
            </article>
          ))}

          {reports.length === 0 ? (
            <section className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">
              暂无历史日报。
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
