import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeleteReportRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, { params }: DeleteReportRouteProps) {
  // TODO: 生产环境需要接入登录态或后台鉴权。
  const { id } = await params;
  const result = await prisma.dailyReport.deleteMany({
    where: {
      id,
    },
  });

  if (result.count === 0) {
    return Response.json({ error: "日报不存在或已删除" }, { status: 404 });
  }

  return Response.json({ deleted: true });
}
