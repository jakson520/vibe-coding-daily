import { loadEnvConfig } from "@next/env";
import Database from "better-sqlite3";
import path from "node:path";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const sqlitePath = databaseUrl.replace(/^file:/, "");
const resolvedPath = path.isAbsolute(sqlitePath)
  ? sqlitePath
  : path.resolve(process.cwd(), sqlitePath);

const db = new Database(resolvedPath);

db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS "Source" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "config" TEXT NOT NULL DEFAULT '{}',
  "trustScore" REAL NOT NULL DEFAULT 0.7,
  "enabled" BOOLEAN NOT NULL DEFAULT 1,
  "lastFetchedAt" DATETIME,
  "lastStatus" TEXT NOT NULL DEFAULT 'skipped',
  "lastError" TEXT,
  "fetchedCount" INTEGER NOT NULL DEFAULT 0,
  "acceptedCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Article" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sourceId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "author" TEXT,
  "publishedAt" DATETIME,
  "rawSummary" TEXT,
  "heat" REAL NOT NULL DEFAULT 0,
  "qualityScore" REAL NOT NULL DEFAULT 0,
  "contentHash" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Article_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ArticleAnalysis" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "articleId" TEXT NOT NULL,
  "summaryZh" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "whyItMatters" TEXT NOT NULL,
  "relevanceScore" REAL NOT NULL DEFAULT 0,
  "freshnessScore" REAL NOT NULL DEFAULT 0,
  "credibilityScore" REAL NOT NULL DEFAULT 0,
  "heatScore" REAL NOT NULL DEFAULT 0,
  "finalScore" REAL NOT NULL DEFAULT 0,
  "aiModel" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArticleAnalysis_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Tag" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ArticleTag" (
  "articleId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("articleId", "tagId"),
  CONSTRAINT "ArticleTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ArticleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "DailyReport" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reportDate" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "brief" TEXT NOT NULL,
  "actionAdvice" TEXT NOT NULL,
  "emailSentAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "DailyReportItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reportId" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  "section" TEXT NOT NULL,
  "rank" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyReportItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailyReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DailyReportItem_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Favorite" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "articleId" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Source_name_key" ON "Source"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Article_sourceId_externalId_key" ON "Article"("sourceId", "externalId");
CREATE UNIQUE INDEX IF NOT EXISTS "Article_contentHash_key" ON "Article"("contentHash");
CREATE INDEX IF NOT EXISTS "Article_publishedAt_idx" ON "Article"("publishedAt");
CREATE INDEX IF NOT EXISTS "Article_heat_idx" ON "Article"("heat");
CREATE UNIQUE INDEX IF NOT EXISTS "ArticleAnalysis_articleId_key" ON "ArticleAnalysis"("articleId");
CREATE INDEX IF NOT EXISTS "ArticleAnalysis_contentType_idx" ON "ArticleAnalysis"("contentType");
CREATE INDEX IF NOT EXISTS "ArticleAnalysis_finalScore_idx" ON "ArticleAnalysis"("finalScore");
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "DailyReport_reportDate_key" ON "DailyReport"("reportDate");
CREATE UNIQUE INDEX IF NOT EXISTS "DailyReportItem_reportId_articleId_key" ON "DailyReportItem"("reportId", "articleId");
CREATE INDEX IF NOT EXISTS "DailyReportItem_section_rank_idx" ON "DailyReportItem"("section", "rank");
CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_articleId_key" ON "Favorite"("articleId");
`);

const sourceColumns = db
  .prepare('PRAGMA table_info("Source")')
  .all() as Array<{ name: string }>;
const sourceColumnNames = new Set(sourceColumns.map((column) => column.name));

function ensureSourceColumn(name: string, sql: string) {
  if (!sourceColumnNames.has(name)) {
    db.exec(`ALTER TABLE "Source" ADD COLUMN ${sql}`);
  }
}

ensureSourceColumn("lastFetchedAt", '"lastFetchedAt" DATETIME');
ensureSourceColumn("lastStatus", '"lastStatus" TEXT NOT NULL DEFAULT \'skipped\'');
ensureSourceColumn("lastError", '"lastError" TEXT');
ensureSourceColumn("fetchedCount", '"fetchedCount" INTEGER NOT NULL DEFAULT 0');
ensureSourceColumn("acceptedCount", '"acceptedCount" INTEGER NOT NULL DEFAULT 0');

db.close();

console.log(`SQLite database is ready at ${resolvedPath}`);
