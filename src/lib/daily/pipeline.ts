import { collectLatestArticles } from "../collectors";
import { sendDailyReportEmail } from "../email/send";
import { analyzeRecentArticles, generateDailyReport } from "./report";
import type { DailyPipelineResult } from "../types";
import { writeDailyJobLog } from "./logging";

export async function runDailyPipeline(
  options: { sendEmail?: boolean; interestSlugs?: string[] } = {},
): Promise<DailyPipelineResult> {
  const collection = await collectLatestArticles();
  const analysis = await analyzeRecentArticles();
  const report = await generateDailyReport(undefined, options.interestSlugs);
  const emailSent = options.sendEmail ? await sendDailyReportEmail(report.id) : false;
  const reportItemCount = report.items.length;

  await writeDailyJobLog({
    runAt: new Date().toISOString(),
    totalFetchedCount: collection.fetchedCount,
    acceptedCount: collection.acceptedCount,
    reportItemCount,
    failedSourceCount: collection.failedSourceCount,
    aiSummaryCount: analysis.aiSummaryCount,
    fallbackSummaryCount: analysis.fallbackSummaryCount,
    reportId: report.id,
    emailSent,
  });

  return {
    collected: collection.acceptedCount,
    fetched: collection.fetchedCount,
    accepted: collection.acceptedCount,
    analyzed: analysis.analyzed,
    reportItemCount,
    failedSourceCount: collection.failedSourceCount,
    aiSummaryCount: analysis.aiSummaryCount,
    fallbackSummaryCount: analysis.fallbackSummaryCount,
    reportId: report.id,
    emailSent,
  };
}
