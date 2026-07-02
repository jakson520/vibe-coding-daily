import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  await import("./init-db");

  const { runDailyPipeline } = await import("../src/lib/daily/pipeline");
  const { prisma } = await import("../src/lib/prisma");

  try {
    const result = await runDailyPipeline({ sendEmail: true });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
