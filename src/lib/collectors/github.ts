import type { CollectedArticle, SourceForCollection } from "../types";
import { KEYWORDS } from "../sources";
import { daysAgoDate, parseSourceConfig, safeUrl } from "../text";
import { fetchJson } from "./http";

type GitHubConfig = {
  daysBack: number;
  minStars: number;
  language: string;
};

type GitHubRepo = {
  id: number;
  full_name: string;
  html_url: string;
  description?: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language?: string | null;
  pushed_at?: string;
  created_at?: string;
  owner?: {
    login: string;
  };
};

type GitHubSearchResponse = {
  items: GitHubRepo[];
};

export async function collectGitHub(source: SourceForCollection): Promise<CollectedArticle[]> {
  const config = parseSourceConfig<GitHubConfig>(source.config, {
    daysBack: 7,
    minStars: 20,
    language: "",
  });
  const since = daysAgoDate(config.daysBack).toISOString().slice(0, 10);
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const seen = new Map<string, CollectedArticle>();
  const selectedKeywords = KEYWORDS.slice(0, 8);
  const errors: string[] = [];

  for (const keyword of selectedKeywords) {
    const url = new URL(source.url);
    const language = config.language ? ` language:${config.language}` : "";
    url.searchParams.set("q", `${keyword}${language} pushed:>=${since} stars:>=${config.minStars}`);
    url.searchParams.set("sort", "stars");
    url.searchParams.set("order", "desc");
    url.searchParams.set("per_page", "8");

    let data: GitHubSearchResponse;
    try {
      data = await fetchJson<GitHubSearchResponse>(url.toString(), { headers });
    } catch (error) {
      errors.push(`${keyword}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    for (const repo of data.items ?? []) {
      seen.set(String(repo.id), {
        sourceId: source.id,
        externalId: String(repo.id),
        title: repo.full_name,
        url: safeUrl(repo.html_url),
        author: repo.owner?.login,
        publishedAt: repo.pushed_at ? new Date(repo.pushed_at) : new Date(repo.created_at ?? Date.now()),
        rawSummary: [repo.description, repo.language ? `Language: ${repo.language}` : null]
          .filter(Boolean)
          .join(" · "),
        heat: repo.stargazers_count + repo.forks_count * 2 + repo.open_issues_count,
      });
    }
  }

  if (seen.size === 0 && errors.length === selectedKeywords.length) {
    throw new Error(`GitHub search failed for all keywords: ${errors.slice(0, 3).join("; ")}`);
  }

  return Array.from(seen.values());
}
