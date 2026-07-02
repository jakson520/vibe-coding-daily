import "dotenv/config";

async function main() {
  const [{ prisma }, { buildPersonalizedWhyItMatters }] = await Promise.all([
    import("../src/lib/prisma"),
    import("../src/lib/summary/analyze"),
  ]);
  const articles = await prisma.article.findMany({
    where: {
      analysis: {
        isNot: null,
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
  });

  let updated = 0;
  for (const article of articles) {
    if (!article.analysis || article.analysis.aiModel) {
      continue;
    }

    await prisma.articleAnalysis.update({
      where: { articleId: article.id },
      data: {
        whyItMatters: buildPersonalizedWhyItMatters(
          article,
          article.analysis.contentType,
        ),
      },
    });
    updated += 1;
  }

  console.log(`Updated ${updated} fallback rationales.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
