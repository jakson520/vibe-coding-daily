# Vibe Coding Daily MVP 架构

## 项目目录结构

```txt
vibe-coding-daily/
  docs/
    ARCHITECTURE.md              # 目录结构、数据库设计、开发步骤
  prisma/
    schema.prisma                # 数据库表结构
    seed.ts                      # 初始信息源
  scripts/
    daily-job.ts                 # 单次日报任务
    scheduler.ts                 # 每天 8 点定时任务
  src/
    app/
      api/
        favorites/route.ts       # 收藏/取消收藏
        jobs/daily/route.ts      # 手动触发采集与日报
      history/page.tsx           # 历史日报
      layout.tsx
      page.tsx                   # 今日日报首页
    components/
      ArticleList.tsx
      DailyReportView.tsx
      FavoriteButton.tsx
      Filters.tsx
      Header.tsx
    lib/
      collectors/                # Hacker News、GitHub、RSS/网页采集
      daily/                     # 日报生成与分区
      email/                     # 邮件渲染与发送
      scoring/                   # 相关度、新鲜度、可信度、热度评分
      summary/                   # AI 摘要与降级摘要
      prisma.ts                  # Prisma 客户端
      sources.ts                 # 初始源定义
      types.ts                   # 共享类型
```

## 数据库表设计

### Source 信息源

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 主键 |
| name | String | 信息源名称 |
| type | SourceType | HACKER_NEWS / GITHUB / RSS / WEBPAGE |
| url | String | 信息源入口 |
| config | String | JSON 字符串配置，如关键词、API 参数 |
| trustScore | Float | 来源可信度，0-1 |
| enabled | Boolean | 是否启用 |
| createdAt / updatedAt | DateTime | 创建和更新时间 |

### Article 原始内容

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 主键 |
| sourceId | String | 来源 ID |
| externalId | String | 来源内唯一 ID |
| title | String | 标题 |
| url | String | 原文链接 |
| author | String? | 作者 |
| publishedAt | DateTime? | 发布时间 |
| rawSummary | String? | 原始摘要或正文片段 |
| heat | Float | 热度，如 votes、stars、comments |
| qualityScore | Float | 基础质量分 |
| contentHash | String | 标题+链接哈希，用于去重 |
| createdAt / updatedAt | DateTime | 创建和更新时间 |

### ArticleAnalysis AI 分析

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 主键 |
| articleId | String | 文章 ID，唯一 |
| summaryZh | String | 100 字以内中文摘要 |
| contentType | ContentType | 工具更新 / 教程 / 项目案例 / 风险提醒 / 趋势观点 |
| whyItMatters | String | 为什么值得看 |
| relevanceScore | Float | 关键词相关度 |
| freshnessScore | Float | 新鲜度 |
| credibilityScore | Float | 来源可信度 |
| heatScore | Float | 热度 |
| finalScore | Float | 综合推荐分 |
| aiModel | String? | 使用的 AI 模型 |

### Tag 与 ArticleTag 标签

| 表 | 说明 |
| --- | --- |
| Tag | 标签名唯一，如 Cursor、Codex、AI Agent |
| ArticleTag | 文章与标签多对多关系 |

### DailyReport 与 DailyReportItem 日报

| 表 | 说明 |
| --- | --- |
| DailyReport | 每日一份，按 reportDate 唯一 |
| DailyReportItem | 日报条目，记录分区、排名和文章 |

### Favorite 收藏

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | String | 主键 |
| articleId | String | 收藏文章 |
| note | String? | 个人备注 |
| createdAt | DateTime | 收藏时间 |

## 核心开发步骤

1. 初始化 Next.js、Tailwind、Prisma、SQLite、邮件和定时任务依赖。
2. 建立数据库模型，写入初始信息源。
3. 实现采集器：Hacker News、GitHub、RSS 和网页更新源。
4. 对采集结果做去重、关键词匹配、基础质量过滤和标签提取。
5. 调用 OpenAI API 生成中文摘要；没有 API Key 时使用本地降级摘要，保证 MVP 可运行。
6. 按相关度、新鲜度、来源可信度、热度计算综合推荐分。
7. 生成每日最多 10 条日报，按“今日最重要、工具更新、热门项目、实用教程、风险提醒、今日行动建议”组织。
8. 实现邮件推送；SMTP 未配置时只保存日报，不发送。
9. 实现前端：首页展示今日日报，历史页查看旧日报，支持标签筛选和收藏。
10. 提供脚本和 API：手动触发任务、每天早上 8 点自动运行。

## 环境变量

所有密钥只从环境变量读取，不能写死在代码里。

```txt
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-mini"
GITHUB_TOKEN=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM=""
EMAIL_TO=""
DAILY_JOB_TOKEN=""
```
