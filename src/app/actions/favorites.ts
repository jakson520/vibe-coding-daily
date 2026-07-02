"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setFavoriteAction(articleId: string, shouldFavorite: boolean) {
  if (shouldFavorite) {
    await prisma.favorite.upsert({
      where: { articleId },
      update: {},
      create: { articleId },
    });
  } else {
    await prisma.favorite.deleteMany({
      where: { articleId },
    });
  }

  revalidatePath("/");
  revalidatePath("/favorites");
  revalidatePath("/history");
}
