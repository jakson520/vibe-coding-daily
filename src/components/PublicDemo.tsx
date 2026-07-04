import { ArrowUpRight, Bookmark, Code2, Radar, Sparkles, Wrench } from "lucide-react";

const dailyItems = [
  {
    category: "代码工具",
    title: "AI 编程工作流正在从单次问答走向持续协作",
    summary: "关注编辑器、智能体与代码审查工具如何进入真实开发流程，减少重复操作并提高交付稳定性。",
    signal: "高相关",
  },
  {
    category: "产品动态",
    title: "开发者工具开始强调可验证的任务执行过程",
    summary: "从只展示结果，转向同时呈现计划、变更记录与验证状态，产品可信度成为新的竞争点。",
    signal: "值得跟进",
  },
  {
    category: "实践方法",
    title: "小型产品更适合用清晰边界验证 AI 能力",
    summary: "先固定输入、输出与验收条件，再逐步增加自动化范围，可以更快判断功能是否真正有效。",
    signal: "方法沉淀",
  },
];

const topics = ["Vibe Coding", "AI Agent", "开发者工具", "MCP", "产品方法"];

export function PublicDemo() {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <header className="border-b border-white/10 bg-[#07111f]/90">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
              <Radar size={20} />
            </span>
            <div>
              <strong className="block text-sm tracking-wide">Vibe Coding Daily</strong>
              <span className="text-xs text-slate-400">AI 编程信息雷达</span>
            </div>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
            href="https://github.com/jakson520/vibe-coding-daily"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ArrowUpRight size={15} />
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_82%_8%,rgba(34,211,238,.15),transparent_32%),linear-gradient(135deg,rgba(19,39,68,.94),rgba(8,18,34,.96))] p-6 shadow-2xl shadow-black/25 sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
            <Sparkles size={13} /> 今日信息已整理
          </span>
          <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            把分散的 AI 编程动态，整理成每天可快速阅读的中文日报。
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            聚合开发者工具、产品发布与实践方法，按主题筛选、排序并生成摘要，帮助使用者减少信息噪音。
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["08", "持续追踪的信息方向"],
              ["24", "今日收集的信息条目"],
              ["06", "进入日报的重点内容"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <strong className="text-2xl text-cyan-100">{value}</strong>
                <p className="mt-1 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[24px] border border-white/10 bg-white/[.035] p-5 sm:p-7">
            <div className="flex items-end justify-between gap-5 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs text-cyan-200">今日精选</span>
                <h2 className="mt-2 text-2xl font-semibold">值得关注的 3 个信号</h2>
              </div>
              <span className="hidden text-xs text-slate-500 sm:block">每日更新</span>
            </div>
            <div className="divide-y divide-white/10">
              {dailyItems.map((item, index) => (
                <article key={item.title} className="grid gap-4 py-6 sm:grid-cols-[48px_minmax(0,1fr)]">
                  <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-sm text-cyan-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-cyan-200">{item.category}</span>
                      <span className="rounded-full bg-white/7 px-2.5 py-1 text-slate-400">{item.signal}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-medium leading-7 text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[24px] border border-white/10 bg-white/[.035] p-6">
              <div className="flex items-center gap-3">
                <Code2 className="text-cyan-200" size={20} />
                <h2 className="font-medium">关注方向</h2>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span key={topic} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                    {topic}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-white/10 bg-white/[.035] p-6">
              <div className="flex items-center gap-3">
                <Wrench className="text-cyan-200" size={20} />
                <h2 className="font-medium">产品能力</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
                <li>多信息源采集与状态管理</li>
                <li>主题标签、筛选与优先级排序</li>
                <li>日报生成、历史记录与收藏</li>
              </ul>
            </section>

            <section className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/[.055] p-6">
              <Bookmark className="text-cyan-200" size={20} />
              <p className="mt-4 text-sm leading-6 text-slate-300">
                公开页面展示产品结构与日报阅读体验；数据采集任务与管理能力保留在本地完整版中。
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
