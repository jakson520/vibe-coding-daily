import { Star } from "lucide-react";
import { ArticleList } from "@/components/ArticleList";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const favorites = await prisma.favorite.findMany({
    orderBy: {
      createdAt: "desc",
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
  });

  const articles = favorites.map((favorite) => favorite.article);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Star size={16} aria-hidden="true" />
              已收藏
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">收藏</h1>
            <p className="mt-2 text-sm text-slate-600">集中查看你点星标保存的信息。</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            {articles.length} 条收藏
          </div>
        </div>

        {articles.length > 0 ? (
          <ArticleList articles={articles} />
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-600">
            暂无收藏。回到今日日报，点击文章右上角的星星即可收藏。
          </section>
        )}
      </main>
    </div>
  );
}
