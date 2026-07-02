import { prisma } from "../prisma";
import { REPORT_SECTIONS, CONTENT_TYPES } from "../sources";
import { getHongKongDateKey, daysAgoDate } from "../text";
import { analyzeArticle } from "../summary/analyze";

const CONTENT_TYPE_SECTION: Record<string, string> = {
  [CONTENT_TYPES.toolUpdate]: REPORT_SECTIONS.toolUpdates,
  [CONTENT_TYPES.projectCase]: REPORT_SECTIONS.hotProjects,
  [CONTENT_TYPES.tutorial]: REPORT_SECTIONS.tutorials,
  [CONTENT_TYPES.risk]: REPORT_SECTIONS.risks,
  [CONTENT_TYPES.trend]: REPORT_SECTIONS.mostImportant,
};

export async function analyzeRecentArticles() {
  const articles = await prisma.article.findMany({
    where: {
      OR: [{ analysis: { is: null } }, { updatedAt: { gte: daysAgoDate(1) } }],
      publishedAt: {
        gte: daysAgoDate(14),
      },
    },
    include: {
      source: true,
      analysis: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
    take: 80,
    orderBy: [{ publishedAt: "desc" }, { heat: "desc" }],
  });

  let analyzed = 0;
  let aiSummaryCount = 0;
  let fallbackSummaryCount = 0;

  for (const article of articles) {
    const result = await analyzeArticle(article);
    await prisma.articleAnalysis.upsert({
      where: { articleId: article.id },
      update: result,
      create: {
        articleId: article.id,
        ...result,
      },
    });
    analyzed += 1;
    if (result.aiModel) {
      aiSummaryCount += 1;
    } else {
      fallbackSummaryCount += 1;
    }
  }

  return {
    analyzed,
    aiSummaryCount,
    fallbackSummaryCount,
  };
}

export async function generateDailyReport(
  reportDate = getHongKongDateKey(),
  interestSlugs: string[] = [],
) {
  const normalizedInterests = Array.from(new Set(interestSlugs.filter(Boolean))).slice(0, 12);
  const interestTags = normalizedInterests.length
    ? await prisma.tag.findMany({
        where: { slug: { in: normalizedInterests } },
        orderBy: { name: "asc" },
      })
    : [];
  const interestNames = interestTags.map((tag) => tag.name);

  const topAnalyses = await prisma.articleAnalysis.findMany({
    where: {
      article: {
        publishedAt: {
          gte: daysAgoDate(14),
        },
        ...(normalizedInterests.length
          ? {
              tags: {
                some: {
                  tag: {
                    slug: { in: normalizedInterests },
                  },
                },
              },
            }
          : {}),
      },
    },
    include: {
      article: {
        include: {
          source: true,
          tags: {
            include: {
              tag: true,
            },
          },
          favorites: true,
        },
      },
    },
    orderBy: {
      finalScore: "desc",
    },
    take: 10,
  });
  const topArticles = topAnalyses.map((analysis) => ({
    ...analysis.article,
    analysis,
  }));

  const topTagNames = Array.from(
    new Set(topArticles.flatMap((article) => article.tags.map((tag) => tag.tag.name))),
  ).slice(0, 4);
  const focusNames = interestNames.length ? interestNames : topTagNames;
  const focusLabel = focusNames.slice(0, 4).join("、") || "AI 编程工具";
  const isPersonalized = interestNames.length > 0;
  const brief =
    topArticles.length === 0
      ? `暂未发现与「${focusLabel}」相关的新内容。`
      : isPersonalized
        ? `按你关注的「${focusLabel}」筛选出 ${topArticles.length} 条今日内容。`
        : `今天筛选出 ${topArticles.length} 条 AI 编程相关内容，重点关注 ${focusLabel}。`;
  const actionAdvice =
    topArticles.length === 0
      ? `建议放宽「${focusLabel}」的信息源范围，或稍后再次更新。`
      : `先查看排名前 3 的内容，再选一条与「${focusNames[0] ?? "AI 编程"}」相关的工具或项目实际验证。`;

  const report = await prisma.dailyReport.upsert({
    where: { reportDate },
    update: {
      title: isPersonalized
        ? `Vibe Coding Daily · ${reportDate} · 专属版`
        : `Vibe Coding Daily · ${reportDate}`,
      brief,
      actionAdvice,
      items: {
        deleteMany: {},
      },
    },
    create: {
      reportDate,
      title: isPersonalized
        ? `Vibe Coding Daily · ${reportDate} · 专属版`
        : `Vibe Coding Daily · ${reportDate}`,
      brief,
      actionAdvice,
    },
  });

  for (const [index, article] of topArticles.entries()) {
    const section =
      index === 0
        ? REPORT_SECTIONS.mostImportant
        : CONTENT_TYPE_SECTION[article.analysis?.contentType ?? CONTENT_TYPES.trend] ??
          REPORT_SECTIONS.mostImportant;

    await prisma.dailyReportItem.create({
      data: {
        reportId: report.id,
        articleId: article.id,
        section,
        rank: index + 1,
      },
    });
  }

  return prisma.dailyReport.findUniqueOrThrow({
    where: { id: report.id },
    include: {
      items: {
        orderBy: [{ section: "asc" }, { rank: "asc" }],
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
