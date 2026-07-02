export const SOURCE_TYPES = {
  hackerNews: "HACKER_NEWS",
  github: "GITHUB",
  productHunt: "PRODUCT_HUNT",
  rss: "RSS",
  webpage: "WEBPAGE",
} as const;

export const KEYWORDS = [
  "vibe coding",
  "AI coding",
  "Cursor",
  "Claude Code",
  "Codex",
  "GitHub Copilot",
  "AI agent",
  "no-code app",
  "AI app builder",
  "agentic coding",
  "code agent",
  "coding assistant",
  "OpenAI",
  "GPT",
  "Claude",
  "Anthropic",
  "MCP",
  "developer tools",
  "AI assistant",
  "Sourcegraph",
  "Cody",
  "JetBrains AI",
  "JetBrains",
  "VS Code",
  "Visual Studio Code",
  "LangChain",
  "LangGraph",
  "Hugging Face",
  "Replit",
  "Cloudflare AI",
  "AI SDK",
];

export type SourceSeed = {
  name: string;
  type: string;
  url: string;
  trustScore: number;
  config?: Record<string, unknown>;
};

export const DEFAULT_SOURCES: SourceSeed[] = [
  {
    name: "Hacker News",
    type: SOURCE_TYPES.hackerNews,
    url: "https://hn.algolia.com/api/v1/search_by_date",
    trustScore: 0.78,
    config: {
      tags: ["story"],
      daysBack: 2,
    },
  },
  {
    name: "GitHub Trending/Search",
    type: SOURCE_TYPES.github,
    url: "https://api.github.com/search/repositories",
    trustScore: 0.82,
    config: {
      language: "",
      minStars: 20,
      daysBack: 7,
    },
  },
  {
    name: "Claude Code Releases",
    type: SOURCE_TYPES.rss,
    url: "https://github.com/anthropics/claude-code/releases.atom",
    trustScore: 0.9,
    config: {
      vendor: "Anthropic",
      topic: "Claude Code",
    },
  },
  {
    name: "Cursor Changelog",
    type: SOURCE_TYPES.webpage,
    url: "https://cursor.com/changelog",
    trustScore: 0.92,
    config: {
      vendor: "Cursor",
      topic: "Cursor",
      daysBack: 14,
    },
  },
  {
    name: "GitHub Changelog",
    type: SOURCE_TYPES.rss,
    url: "https://github.blog/changelog/feed/",
    trustScore: 0.9,
    config: {
      vendor: "GitHub",
      topic: "developer tools",
    },
  },
  {
    name: "GitHub Copilot Blog",
    type: SOURCE_TYPES.rss,
    url: "https://github.blog/tag/github-copilot/feed/",
    trustScore: 0.9,
    config: {
      vendor: "GitHub",
      topic: "GitHub Copilot",
    },
  },
  {
    name: "OpenAI News",
    type: SOURCE_TYPES.rss,
    url: "https://openai.com/news/rss.xml",
    trustScore: 0.92,
    config: {
      vendor: "OpenAI",
      topic: "OpenAI",
    },
  },
  {
    name: "Sourcegraph Blog",
    type: SOURCE_TYPES.rss,
    url: "https://sourcegraph.com/blog/rss.xml",
    trustScore: 0.82,
    config: {
      vendor: "Sourcegraph",
      topic: "AI coding",
    },
  },
  {
    name: "Visual Studio Code Updates",
    type: SOURCE_TYPES.rss,
    url: "https://code.visualstudio.com/feed.xml",
    trustScore: 0.84,
    config: {
      vendor: "Microsoft",
      topic: "VS Code",
    },
  },
  {
    name: "JetBrains AI Blog",
    type: SOURCE_TYPES.rss,
    url: "https://blog.jetbrains.com/ai/feed/",
    trustScore: 0.82,
    config: {
      vendor: "JetBrains",
      topic: "AI assistant",
    },
  },
  {
    name: "Vercel AI SDK Releases",
    type: SOURCE_TYPES.rss,
    url: "https://github.com/vercel/ai/releases.atom",
    trustScore: 0.88,
    config: {
      vendor: "Vercel",
      topic: "AI app builder",
    },
  },
  {
    name: "Continue Releases",
    type: SOURCE_TYPES.rss,
    url: "https://github.com/continuedev/continue/releases.atom",
    trustScore: 0.86,
    config: {
      vendor: "Continue",
      topic: "AI coding",
    },
  },
  {
    name: "Replit Blog",
    type: SOURCE_TYPES.rss,
    url: "https://blog.replit.com/feed.xml",
    trustScore: 0.82,
    config: {
      vendor: "Replit",
      topic: "AI app builder",
    },
  },
  {
    name: "Microsoft Visual Studio Copilot Blog",
    type: SOURCE_TYPES.rss,
    url: "https://devblogs.microsoft.com/visualstudio/tag/github-copilot/feed/",
    trustScore: 0.84,
    config: {
      vendor: "Microsoft",
      topic: "GitHub Copilot",
    },
  },
  {
    name: "Cloudflare AI Blog",
    type: SOURCE_TYPES.rss,
    url: "https://blog.cloudflare.com/tag/ai/rss/",
    trustScore: 0.82,
    config: {
      vendor: "Cloudflare",
      topic: "AI agent",
    },
  },
];

export const CONTENT_TYPES = {
  toolUpdate: "工具更新",
  tutorial: "教程",
  projectCase: "项目案例",
  risk: "风险提醒",
  trend: "趋势观点",
} as const;

export const REPORT_SECTIONS = {
  mostImportant: "今日最重要",
  toolUpdates: "工具更新",
  hotProjects: "热门项目",
  tutorials: "实用教程",
  risks: "风险提醒",
} as const;
