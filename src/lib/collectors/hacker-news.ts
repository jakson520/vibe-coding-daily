import type { CollectedArticle, SourceForCollection } from "../types";
import { KEYWORDS } from "../sources";
import { daysAgoDate, parseSourceConfig, safeUrl, stripHtml } from "../text";
import { fetchJson } from "./http";

type HNConfig = {
  daysBack: number;
  tags: string[];
};

type HNHit = {
  objectID: string;
  title?: string;
  story_title?: string;
  url?: string;
  story_url?: string;
  author?: string;
  created_at?: string;
  story_text?: string;
  comment_text?: string;
  num_comments?: number;
  points?: number;
};

type HNResponse = {
  hits: HNHit[];
};

export async function collectHackerNews(source: SourceForCollection): Promise<CollectedArticle[]> {
  const config = parseSourceConfig<HNConfig>(source.config, { daysBack: 2, tags: ["story"] });
  const sinceUnix = Math.floor(daysAgoDate(config.daysBack).getTime() / 1000);
  const seen = new Map<string, CollectedArticle>();

  await Promise.all(
    KEYWORDS.map(async (keyword) => {
      const url = new URL(source.url);
      url.searchParams.set("query", keyword);
      url.searchParams.set("tags", config.tags.join(","));
      url.searchParams.set("numericFilters", `created_at_i>${sinceUnix}`);
      url.searchParams.set("hitsPerPage", "12");

      const data = await fetchJson<HNResponse>(url.toString());
      for (const hit of data.hits ?? []) {
        const title = hit.title || hit.story_title;
        if (!title) {
          continue;
        }

        const articleUrl =
          hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
        const heat = (hit.points ?? 0) + (hit.num_comments ?? 0) * 2;

        seen.set(hit.objectID, {
          sourceId: source.id,
          externalId: hit.objectID,
          title: stripHtml(title),
          url: safeUrl(articleUrl),
          author: hit.author,
          publishedAt: hit.created_at ? new Date(hit.created_at) : null,
          rawSummary: stripHtml(hit.story_text || hit.comment_text || ""),
          heat,
        });
      }
    }),
  );

  return Array.from(seen.values());
}
