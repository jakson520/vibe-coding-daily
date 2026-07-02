import { AlertCircle, CheckCircle2, CircleDashed } from "lucide-react";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusMeta: Record<string, { label: string; className: string; icon: ReactNode }> = {
  success: {
    label: "success",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 size={14} aria-hidden="true" />,
  },
  failed: {
    label: "failed",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: <AlertCircle size={14} aria-hidden="true" />,
  },
  skipped: {
    label: "skipped",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: <CircleDashed size={14} aria-hidden="true" />,
  },
};

function formatDate(date: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminSourcesPage() {
  // TODO: production needs authentication and authorization before exposing admin data.
  const sources = await prisma.source.findMany({
    orderBy: [{ enabled: "desc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">信息源后台</h1>
            <p className="mt-2 text-sm text-slate-600">查看每个信息源最近一次采集结果。</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            {sources.length} 个信息源
          </div>
        </div>

        <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[980px] w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">名称</th>
                <th className="px-4 py-3 font-semibold">类型</th>
                <th className="px-4 py-3 font-semibold">启用</th>
                <th className="px-4 py-3 font-semibold">最近抓取时间</th>
                <th className="px-4 py-3 font-semibold">最近状态</th>
                <th className="px-4 py-3 font-semibold">抓取数量</th>
                <th className="px-4 py-3 font-semibold">入选数量</th>
                <th className="px-4 py-3 font-semibold">最近错误</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((source) => {
                const meta = statusMeta[source.lastStatus] ?? statusMeta.skipped;

                return (
                  <tr key={source.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-950">{source.name}</div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block max-w-[260px] truncate text-xs text-slate-500 hover:text-emerald-700"
                      >
                        {source.url}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{source.type}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          source.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {source.enabled ? "是" : "否"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(source.lastFetchedAt)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${meta.className}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900">{source.fetchedCount}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">{source.acceptedCount}</td>
                    <td className="px-4 py-4">
                      <div className="max-w-[320px] whitespace-normal break-words text-xs leading-5 text-slate-500">
                        {source.lastError || "-"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
