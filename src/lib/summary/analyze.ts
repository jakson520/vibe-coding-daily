import { z } from "zod";
import type { ArticleAnalysisResult } from "../types";
import { CONTENT_TYPES, KEYWORDS } from "../sources";
import { classifyContent, scoreArticle } from "../scoring/recommendation";
import { truncateText } from "../text";

type ArticleForAnalysis = {
  title: string;
  url: string;
  rawSummary?: string | null;
  publishedAt?: Date | null;
  heat?: number | null;
  source: {
    name: string;
    type: string;
    trustScore: number;
  };
  tags?: Array<{
    tag: {
      name: string;
      slug: string;
    };
  }>;
};

type BasicAnalysis = Pick<
  ArticleAnalysisResult,
  "summaryZh" | "contentType" | "whyItMatters" | "aiModel"
>;

const aiAnalysisSchema = z.object({
  summaryZh: z.string().min(1).max(140),
  contentType: z.enum([
    CONTENT_TYPES.toolUpdate,
    CONTENT_TYPES.tutorial,
    CONTENT_TYPES.projectCase,
    CONTENT_TYPES.risk,
    CONTENT_TYPES.trend,
  ]),
  whyItMatters: z.string().min(1).max(120),
});

function extractResponseText(payload: unknown) {
  const data = payload as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (data.output_text) {
    return data.output_text;
  }

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function parseJsonObject(text: string) {
  const direct = text.trim();
  const jsonMatch = direct.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : direct);
}

function getArticleTopics(article: ArticleForAnalysis) {
  const searchable = `${article.title} ${article.rawSummary ?? ""}`.toLowerCase();
  const tagNames = (article.tags ?? [])
    .map(({ tag }) => tag.name)
    .filter((name) => !["开源项目", "教程", "风险"].includes(name));
  const keywordNames = KEYWORDS.filter((keyword) =>
    searchable.includes(keyword.toLowerCase()),
  );
  const seen = new Set<string>();

  return [...tagNames, ...keywordNames].filter((name) => {
    const key = name.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  }).slice(0, 2);
}

export function buildPersonalizedWhyItMatters(
  article: ArticleForAnalysis,
  contentType: string,
) {
  const topics = getArticleTopics(article);
  const focus = topics.join("、") || article.source.name;
  const shortTitle = truncateText(article.title, 30);
  let message: string;

  switch (contentType) {
    case CONTENT_TYPES.toolUpdate:
      message = `如果你在使用 ${focus}，「${shortTitle}」可能影响功能选择、配置方式或现有工作流。`;
      break;
    case CONTENT_TYPES.projectCase:
      message = `「${shortTitle}」展示了 ${focus} 的落地方式，适合拆解其技术组合、交互思路和工程实现。`;
      break;
    case CONTENT_TYPES.tutorial:
      message = `「${shortTitle}」聚焦 ${focus} 实操，可直接提炼可复现步骤、配置和避坑点。`;
      break;
    case CONTENT_TYPES.risk:
      message = `「${shortTitle}」涉及 ${focus} 的使用边界，建议在团队采用、数据接入或上线前核对。`;
      break;
    default:
      message = `「${shortTitle}」来自 ${article.source.name}，反映 ${focus} 的近期变化，可用于判断学习和投入优先级。`;
  }

  return truncateText(message, 90);
}

function fallbackAnalysis(article: ArticleForAnalysis): BasicAnalysis {
  const contentType = classifyContent({
    title: article.title,
    rawSummary: article.rawSummary,
    sourceName: article.source.name,
  });
  const summaryZh = truncateText(article.rawSummary || article.title, 100);

  return {
    summaryZh,
    contentType,
    whyItMatters: buildPersonalizedWhyItMatters(article, contentType),
    aiModel: null,
  };
}

async function aiAnalysis(article: ArticleForAnalysis): Promise<BasicAnalysis | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 500,
      input: [
        {
          role: "system",
          content:
            "你是中文 AI 编程日报编辑。只返回 JSON，不要 Markdown。summaryZh 不超过 100 字；whyItMatters 要结合具体工具、来源和目标读者，不要泛泛而谈。",
        },
        {
          role: "user",
          content: JSON.stringify({
            title: article.title,
            source: article.source.name,
            url: article.url,
            rawSummary: article.rawSummary,
            tags: article.tags?.map(({ tag }) => tag.name) ?? [],
            allowedContentTypes: Object.values(CONTENT_TYPES),
            requiredJsonShape: {
              summaryZh: "100 字以内中文摘要",
              contentType: "工具更新 / 教程 / 项目案例 / 风险提醒 / 趋势观点",
              whyItMatters: "为什么值得看，60 字以内，指出对具体用户或工作流的价值",
            },
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API failed with ${response.status}`);
  }

  const payload = await response.json();
  const parsed = aiAnalysisSchema.parse(parseJsonObject(extractResponseText(payload)));

  return {
    ...parsed,
    summaryZh: truncateText(parsed.summaryZh, 100),
    whyItMatters: truncateText(parsed.whyItMatters, 90),
    aiModel: model,
  };
}

export async function analyzeArticle(article: ArticleForAnalysis): Promise<ArticleAnalysisResult> {
  const score = scoreArticle({
    title: article.title,
    rawSummary: article.rawSummary,
    publishedAt: article.publishedAt,
    heat: article.heat,
    trustScore: article.source.trustScore,
    sourceName: article.source.name,
    sourceType: article.source.type,
  });

  let analysis: BasicAnalysis = fallbackAnalysis(article);

  try {
    analysis = (await aiAnalysis(article)) ?? analysis;
  } catch (error) {
    console.warn(error);
  }

  return {
    ...analysis,
    ...score,
  };
}
