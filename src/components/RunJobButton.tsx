"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function RunJobButton() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);

  async function runJob() {
    let token = window.localStorage.getItem("dailyJobToken");
    if (!token) {
      token = window.prompt("请输入 DAILY_JOB_TOKEN")?.trim() ?? "";
    }

    if (!token) {
      return;
    }

    window.localStorage.setItem("dailyJobToken", token);
    setIsRunning(true);
    const response = await fetch("/api/jobs/daily", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setIsRunning(false);

    if (response.status === 401) {
      window.localStorage.removeItem("dailyJobToken");
      window.alert("DAILY_JOB_TOKEN 不正确，请重新输入。");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      title="立即更新"
      onClick={runJob}
      disabled={isRunning}
      className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
    >
      <RefreshCw size={15} className={isRunning ? "animate-spin" : ""} aria-hidden="true" />
      {isRunning ? "更新中" : "立即更新"}
    </button>
  );
}
