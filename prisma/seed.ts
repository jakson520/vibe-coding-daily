import { DEFAULT_SOURCES } from "../src/lib/sources";
import { prisma } from "../src/lib/prisma";

async function main() {
  for (const source of DEFAULT_SOURCES) {
    await prisma.source.upsert({
      where: { name: source.name },
      update: {
        type: source.type,
        url: source.url,
        trustScore: source.trustScore,
        config: JSON.stringify(source.config ?? {}),
        enabled: true,
      },
      create: {
        name: source.name,
        type: source.type,
        url: source.url,
        trustScore: source.trustScore,
        config: JSON.stringify(source.config ?? {}),
        enabled: true,
      },
    });
  }

  await prisma.source.deleteMany({
    where: {
      name: {
        in: [
          "OpenAI Codex Changelog",
          "Product Hunt",
          "LangChain Blog",
          "Hugging Face Blog",
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
