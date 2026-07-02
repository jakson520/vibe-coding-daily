import * as cheerio from "cheerio";
import type { CollectedArticle, SourceForCollection } from "../types";
import { contentHash, parseSourceConfig, safeUrl, stripHtml } from "../text";
import { fetchText } from "./http";

type WebpageConfig = {
  vendor?: string;
  topic?: string;
};

export async function collectWebpage(source: SourceForCollection): Promise<CollectedArticle[]> {
  const config = parseSourceConfig<WebpageConfig>(source.config, {});
  const html = await fetchText(source.url);
  const $ = cheerio.load(html);
  const candidates = new Map<string, CollectedArticle>();

  $("article, main li, main h2, main h3, main a").each((_, element) => {
    const current = $(element);
    const title =
      stripHtml(current.find("h1,h2,h3,h4,a").first().text()) ||
      stripHtml(current.text()).split(". ")[0] ||
      "";

    if (title.length < 8 || title.length > 180) {
      return;
    }

    const href = current.is("a") ? current.attr("href") : current.find("a").first().attr("href");
    const articleUrl = safeUrl(href || source.url, source.url);
    const datetime =
      current.find("time").first().attr("datetime") ||
      current.closest("article,li,section,div").find("time").first().attr("datetime");
    const summary = stripHtml(current.closest("article,li,section,div").text()).slice(0, 500);
    const externalId = contentHash(`${source.name}:${title}:${articleUrl}`);

    candidates.set(externalId, {
      sourceId: source.id,
      externalId,
      title,
      url: articleUrl,
      author: config.vendor,
      publishedAt: datetime ? new Date(datetime) : new Date(),
      rawSummary: summary || `${config.topic ?? source.name} update`,
      heat: source.trustScore * 100,
    });
  });

  return Array.from(candidates.values()).slice(0, 20);
}
