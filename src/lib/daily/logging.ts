import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type DailyJobLogEntry = {
  runAt: string;
  totalFetchedCount: number;
  acceptedCount: number;
  reportItemCount: number;
  failedSourceCount: number;
  aiSummaryCount: number;
  fallbackSummaryCount: number;
  reportId: string;
  emailSent: boolean;
};

export async function writeDailyJobLog(entry: DailyJobLogEntry) {
  const logsDir = path.join(process.cwd(), "logs");
  await mkdir(logsDir, { recursive: true });
  await appendFile(path.join(logsDir, "daily-job.log"), `${JSON.stringify(entry)}\n`, "utf8");
}
