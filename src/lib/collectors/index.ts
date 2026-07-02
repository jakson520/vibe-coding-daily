import { prisma } from "../prisma";
import { SOURCE_TYPES } from "../sources";
import { contentHash, truncateText } from "../text";
import { extractTags, isRelevantToKeywords, slugifyTag } from "../tags";
import type { CollectedArticle, CollectionRunResult, SourceForCollection } from "../types";
import { passesQualityFilter } from "../scoring/recommendation";
import { collectGitHub } from "./github";
import { collectHackerNews } from "./hacker-news";
import { collectProductHunt } from "./product-hunt";
import { collectRss } from "./rss";
import { collectWebpage } from "./webpage";

async function collectFromSource(source: SourceForCollection) {
  switch (source.type) {
    case SOURCE_TYPES.hackerNews:
      return collectHackerNews(source);
    case SOURCE_TYPES.github:
      return collectGitHub(source);
    case SOURCE_TYPES.productHunt:
      return collectProductHunt(source);
    case SOURCE_TYPES.rss:
      return collectRss(source);
    case SOURCE_TYPES.webpage:
      return collectWebpage(source);
    default:
      return [];
  }
}

function getSkipReason(source: SourceForCollection & { enabled: boolean }) {
  if (!source.enabled) {
    return "Source disabled";
  }

  if (source.type === SOURCE_TYPES.productHunt && !process.env.PRODUCT_HUNT_TOKEN) {
    return "PRODUCT_HUNT_TOKEN is not configured";
  }

  return null;
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`.slice(0, 1000);
  }

  return String(error).slice(0, 1000);
}

async function attachTags(articleId: string, title: string, rawSummary?: string | null) {
  const tags = extractTags(title, rawSummary);

  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: { slug: slugifyTag(tag) },
      update: { name: tag },
      create: {
        name: tag,
        slug: slugifyTag(tag),
      },
    });

    await prisma.articleTag.upsert({
      where: {
        articleId_tagId: {
          articleId,
          tagId: created.id,
        },
      },
      update: {},
      create: {
        articleId,
        tagId: created.id,
      },
    });
  }
}

async function saveCollectedArticle(item: CollectedArticle) {
  const title = truncateText(item.title, 220);
  const rawSummary = truncateText(item.rawSummary, 1000) || null;
  const canonicalUrl = item.url.trim();
  const hash = contentHash(canonicalUrl || `${title}:${item.externalId}`);

  if (!passesQualityFilter(title, canonicalUrl, rawSummary)) {
    return null;
  }

  if (!isRelevantToKeywords(title, rawSummary)) {
    return null;
  }

  const article = await prisma.article.upsert({
    where: { contentHash: hash },
    update: {
      title,
      url: canonicalUrl,
      author: item.author,
      publishedAt: item.publishedAt,
      rawSummary,
      heat: item.heat ?? 0,
      qualityScore: 1,
    },
    create: {
      sourceId: item.sourceId,
      externalId: item.externalId,
      title,
      url: canonicalUrl,
      author: item.author,
      publishedAt: item.publishedAt,
      rawSummary,
      heat: item.heat ?? 0,
      qualityScore: 1,
      contentHash: hash,
    },
  });

  await attachTags(article.id, title, rawSummary);
  return article;
}

export async function collectLatestArticles(): Promise<CollectionRunResult> {
  const sources = await prisma.source.findMany({
    orderBy: { name: "asc" },
  });

  const sourceResults = await Promise.all(
    sources.map(async (source) => {
      const skippedReason = getSkipReason(source);

      if (skippedReason) {
        await prisma.source.update({
          where: { id: source.id },
          data: {
            lastFetchedAt: new Date(),
            lastStatus: "skipped",
            lastError: skippedReason,
            fetchedCount: 0,
            acceptedCount: 0,
          },
        });

        return {
          sourceId: source.id,
          sourceName: source.name,
          status: "skipped" as const,
          fetchedCount: 0,
          acceptedCount: 0,
          error: skippedReason,
        };
      }

      try {
        const items = await collectFromSource(source);
        let savedForSource = 0;
        for (const item of items) {
          const article = await saveCollectedArticle(item);
          if (article) {
            savedForSource += 1;
          }
        }

        await prisma.source.update({
          where: { id: source.id },
          data: {
            lastFetchedAt: new Date(),
            lastStatus: "success",
            lastError: null,
            fetchedCount: items.length,
            acceptedCount: savedForSource,
          },
        });

        return {
          sourceId: source.id,
          sourceName: source.name,
          status: "success" as const,
          fetchedCount: items.length,
          acceptedCount: savedForSource,
          error: null,
        };
      } catch (error) {
        const message = formatError(error);
        await prisma.source.update({
          where: { id: source.id },
          data: {
            lastFetchedAt: new Date(),
            lastStatus: "failed",
            lastError: message,
            fetchedCount: 0,
            acceptedCount: 0,
          },
        });

        return {
          sourceId: source.id,
          sourceName: source.name,
          status: "failed" as const,
          fetchedCount: 0,
          acceptedCount: 0,
          error: message,
        };
      }
    }),
  );

  const failures = sourceResults.filter((result) => result.status === "failed");
  if (failures.length > 0) {
    console.warn(
      `Source collectors failed: ${failures.map((failure) => `${failure.sourceName} (${failure.error})`).join("; ")}`,
    );
  }

  return {
    fetchedCount: sourceResults.reduce((total, result) => total + result.fetchedCount, 0),
    acceptedCount: sourceResults.reduce((total, result) => total + result.acceptedCount, 0),
    failedSourceCount: failures.length,
    skippedSourceCount: sourceResults.filter((result) => result.status === "skipped").length,
    sourceResults,
  };
}
