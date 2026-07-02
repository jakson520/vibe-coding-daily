import { loadEnvConfig } from "@next/env";
import cron from "node-cron";

loadEnvConfig(process.cwd());

console.log("Vibe Coding Daily scheduler started. Daily run: 08:00 Asia/Hong_Kong.");

cron.schedule(
  "0 8 * * *",
  async () => {
    try {
      await import("./init-db");
      const { runDailyPipeline } = await import("../src/lib/daily/pipeline");
      const result = await runDailyPipeline({ sendEmail: true });
      console.log(`[daily] ${new Date().toISOString()} ${JSON.stringify(result)}`);
    } catch (error) {
      console.error(error);
    }
  },
  {
    timezone: "Asia/Hong_Kong",
  },
);
