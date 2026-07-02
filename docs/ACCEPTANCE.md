# Vibe Coding Daily MVP 验收文档

## MVP 功能验收清单

- 信息源管理：已内置 Hacker News、GitHub、Claude Code releases、Cursor changelog、VS Code updates、OpenAI News 等公开来源。
- 自动采集：可通过脚本、API 或定时任务触发采集。
- 内容清洗：支持去重、关键词过滤、低质量内容过滤、标签提取。
- AI 摘要：配置 `OPENAI_API_KEY` 后使用 OpenAI；未配置时使用本地降级摘要。
- 推荐排序：按相关度、新鲜度、来源可信度、热度计算综合分。
- 每日推送：生成每日最多 10 条日报；SMTP 配置完成后发送邮件。
- 前端页面：首页展示日报，历史页查看旧日报，支持收藏和标签筛选。
- 后台状态：`/admin/sources` 展示各信息源最近抓取状态、错误和数量统计。
- 手动触发保护：`/api/jobs/daily` 需要 `Authorization: Bearer <DAILY_JOB_TOKEN>`。
- 运行日志：每次日报任务追加写入 `logs/daily-job.log`。

## 本地启动步骤

1. 安装依赖：

```bash
npm install
```

2. 准备数据库和初始信息源：

```bash
npm run db:setup
```

3. 启动本地服务：

```bash
npm run dev -- --port 3000
```

4. 打开：

```txt
http://localhost:3000
```

## 手动触发日报步骤

1. 在 `.env` 中配置：

```txt
DAILY_JOB_TOKEN="dev-daily-token"
```

2. 使用接口触发：

```bash
curl -H "Authorization: Bearer dev-daily-token" http://localhost:3000/api/jobs/daily
```

3. 也可以在首页点击“立即更新”，按提示输入 `DAILY_JOB_TOKEN`。

## 定时任务验证方式

启动调度器：

```bash
npm run scheduler
```

调度器会按 `Asia/Hong_Kong` 时区每天 08:00 运行。开发时可临时修改 `scripts/scheduler.ts` 里的 cron 表达式，观察终端输出和 `logs/daily-job.log` 是否新增记录。

## 邮件推送验证方式

在 `.env` 中配置 SMTP：

```txt
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM=""
EMAIL_TO=""
```

运行：

```bash
npm run daily
```

如果 SMTP 配置正确，任务会在生成日报后发送邮件，并更新日报的 `emailSentAt`。

## 常见问题

### 部分官网页面无法直接抓取

部分官网页面会限制 Node 环境直接抓取。当前默认源已优先选择公开 RSS、Atom feed 或稳定 API；如果后续新增来源出现 `403` 或需要私有 token，应在后台记录失败原因，并替换为更稳定的公开来源。

### 没有 OpenAI API Key 会怎样

未配置 `OPENAI_API_KEY` 时，系统使用本地降级摘要，日报仍可生成。配置 API Key 后，`logs/daily-job.log` 中的 `aiSummaryCount` 会增加。

### 手动触发返回 401

检查 `.env` 中的 `DAILY_JOB_TOKEN`，并确保请求头为：

```txt
Authorization: Bearer <token>
```
