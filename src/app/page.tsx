import { Activity, Database, Rss, Star } from "lucide-react";
import type { ReactNode } from "react";
import { DailyReportView } from "@/components/DailyReportView";
import { Filters } from "@/components/Filters";
import { Header } from "@/components/Header";
import { PersonalizedUpdatePanel } from "@/components/PersonalizedUpdatePanel";
import { RunJobButton } from "@/components/RunJobButton";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{
    tag?: string;
    date?: string;
  }>;
};

const PUSH_TAG_SLUGS = [
  "ai-coding",
  "vibe-coding",
  "cursor",
  "claude-code",
  "codex",
  "github-copilot",
  "ai-agent",
  "mcp",
];

async function getReport(date?: string) {
  return prisma.dailyReport.findFirst({
    where: date ? { reportDate: date } : undefined,
    orderBy: {
      reportDate: "desc",
    },
    include: {
      items: {
        orderBy: {
          rank: "asc",
        },
        include: {
          article: {
            include: {
              source: true,
              analysis: true,
              tags: {
                include: {
                  tag: true,
                },
              },
              favorites: true,
            },
          },
        },
      },
    },
  });
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const [report, tags, sourceCount, articleCount, favoriteCount] = await Promise.all([
    getReport(params.date),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      take: 40,
    }),
    prisma.source.count({ where: { enabled: true } }),
    prisma.article.count(),
    prisma.favorite.count(),
  ]);
  const pushTags = PUSH_TAG_SLUGS.flatMap((slug) => {
    const tag = tags.find((item) => item.slug === slug);
    return tag ? [tag] : [];
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={<Rss size={17} />} label="启用信息源" value={sourceCount} />
              <Metric icon={<Database size={17} />} label="已收集文章" value={articleCount} />
              <Metric icon={<Activity size={17} />} label="当前推荐" value={report?.items.length ?? 0} />
              <Metric icon={<Star size={17} />} label="收藏" value={favoriteCount} />
            </section>

            {report ? (
              <DailyReportView report={report} selectedTag={params.tag} />
            ) : (
              <section className="rounded-lg border border-slate-200 bg-white p-8">
                <h1 className="text-2xl font-semibold text-slate-950">还没有日报</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  初始信息源已经准备好，运行一次更新后会在这里生成今日中文日报。
                </p>
                <div className="mt-5">
                  <RunJobButton />
                </div>
              </section>
            )}
          </div>

          <aside className="order-first lg:order-none">
            <div className="space-y-4 lg:sticky lg:top-4">
              <PersonalizedUpdatePanel tags={pushTags} />
              <section className="rounded-lg border border-slate-200 bg-white p-4">
                <Filters tags={tags} selectedTag={params.tag} />
              </section>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-slate-400">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}
