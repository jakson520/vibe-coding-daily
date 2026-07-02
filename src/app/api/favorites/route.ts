import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { articleId?: string; note?: string };

  if (!body.articleId) {
    return Response.json({ error: "articleId is required" }, { status: 400 });
  }

  const favorite = await prisma.favorite.upsert({
    where: { articleId: body.articleId },
    update: {
      note: body.note,
    },
    create: {
      articleId: body.articleId,
      note: body.note,
    },
  });

  return Response.json({ favorite });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { articleId?: string };

  if (!body.articleId) {
    return Response.json({ error: "articleId is required" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { articleId: body.articleId },
  });

  return Response.json({ ok: true });
}
