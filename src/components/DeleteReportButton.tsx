"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type DeleteReportButtonProps = {
  reportId: string;
  reportDate: string;
};

export function DeleteReportButton({ reportId, reportDate }: DeleteReportButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(`确定删除 ${reportDate} 的日报吗？`);
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        window.alert("删除失败，请稍后重试");
        return;
      }

      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title="删除这一天的日报"
      aria-label={`删除 ${reportDate} 的日报`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-100 bg-rose-50 text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={16} aria-hidden="true" />
    </button>
  );
}
