"use client";

import { Check, RefreshCw, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PushTag = {
  name: string;
  slug: string;
};

type PersonalizedUpdatePanelProps = {
  tags: PushTag[];
};

type DailyJobResponse = {
  emailSent?: boolean;
  reportItemCount?: number;
  error?: string;
};

export function PersonalizedUpdatePanel({ tags }: PersonalizedUpdatePanelProps) {
  const router = useRouter();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function toggleTag(slug: string) {
    setSelectedSlugs((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
    setStatus(null);
  }

  async function runPersonalizedJob() {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setStatus(null);

    try {
      const response = await fetch("/api/jobs/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interests: selectedSlugs }),
      });
      const result = (await response.json().catch(() => null)) as DailyJobResponse | null;

      if (!response.ok) {
        setStatus(result?.error ?? "更新失败，请稍后重试");
        return;
      }

      const count = result?.reportItemCount ?? 0;
      setStatus(
        result?.emailSent
          ? `已生成 ${count} 条并发送邮件`
          : `已生成 ${count} 条，邮件尚未配置`,
      );
      router.refresh();
    } catch {
      setStatus("更新失败，请检查本地服务");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Send size={17} className="text-emerald-700" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-950">专属更新</h2>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {selectedSlugs.length > 0
              ? `已选 ${selectedSlugs.length} 项`
              : "未选主题，将更新全部内容"}
          </p>
        </div>
        <button
          type="button"
          title={selectedSlugs.length > 0 ? "按已选主题更新并推送" : "更新全部内容并推送"}
          onClick={runPersonalizedJob}
          disabled={isRunning}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          <RefreshCw
            size={15}
            className={isRunning ? "animate-spin" : ""}
            aria-hidden="true"
          />
          {isRunning ? "更新中" : "立即更新"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {tags.map((tag) => {
          const checked = selectedSlugs.includes(tag.slug);

          return (
            <button
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggleTag(tag.slug)}
              key={tag.slug}
              className={`flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md border px-2.5 text-left text-sm transition-colors ${
                checked
                  ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                  checked
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : "border-slate-400 bg-white"
                }`}
                aria-hidden="true"
              >
                {checked ? <Check size={12} strokeWidth={3} /> : null}
              </span>
              <span className="min-w-0 truncate" title={tag.name}>{tag.name}</span>
            </button>
          );
        })}
      </div>

      {status ? (
        <p className="mt-3 text-xs leading-5 text-slate-600" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
    </section>
  );
}
