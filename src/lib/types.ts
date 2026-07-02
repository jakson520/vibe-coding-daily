export type SourceForCollection = {
  id: string;
  name: string;
  type: string;
  url: string;
  config: string;
  trustScore: number;
};

export type CollectedArticle = {
  sourceId: string;
  externalId: string;
  title: string;
  url: string;
  author?: string | null;
  publishedAt?: Date | null;
  rawSummary?: string | null;
  heat?: number;
};

export type ArticleAnalysisResult = {
  summaryZh: string;
  contentType: string;
  whyItMatters: string;
  relevanceScore: number;
  freshnessScore: number;
  credibilityScore: number;
  heatScore: number;
  finalScore: number;
  aiModel?: string | null;
};

export type DailyPipelineResult = {
  collected: number;
  fetched: number;
  accepted: number;
  analyzed: number;
  reportItemCount: number;
  failedSourceCount: number;
  aiSummaryCount: number;
  fallbackSummaryCount: number;
  reportId: string;
  emailSent: boolean;
};

export type CollectionRunResult = {
  fetchedCount: number;
  acceptedCount: number;
  failedSourceCount: number;
  skippedSourceCount: number;
  sourceResults: Array<{
    sourceId: string;
    sourceName: string;
    status: "success" | "failed" | "skipped";
    fetchedCount: number;
    acceptedCount: number;
    error?: string | null;
  }>;
};
