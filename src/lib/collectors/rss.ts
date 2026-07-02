import Parser from "rss-parser";
import type { CollectedArticle, SourceForCollection } from "../types";
import { safeUrl, stripHtml } from "../text";
import { fetchText } from "./http";

const parser = new Parser();

function normalizeXml(xml: string) {
  return xml.replace(
    /&(?!#\d+;|#x[\da-f]+;|[a-z][\w.-]*;)/gi,
    "&amp;",
  );
}

export async function collectRss(source: SourceForCollection): Promise<CollectedArticle[]> {
  const xml = await fetchText(source.url, undefined, 25000);
  const feed = await parser.parseString(normalizeXml(xml));

  return feed.items.slice(0, 30).map((item) => {
    const link = item.link || source.url;
    return {
      sourceId: source.id,
      externalId: item.guid || link,
      title: stripHtml(item.title || "Untitled"),
      url: safeUrl(link, source.url),
      author: item.creator || item.author,
      publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
      rawSummary: stripHtml(item.contentSnippet || item.content || ""),
      heat: 0,
    };
  });
}
