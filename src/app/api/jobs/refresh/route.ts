import { runDailyPipeline } from "@/lib/daily/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeInterests(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().toLowerCase())
        .filter((item) => /^[a-z0-9-]{1,64}$/.test(item)),
    ),
  ).slice(0, 12);
}

export async function POST(request: Request) {
  // TODO: 生产环境需要接入登录态或后台鉴权；本地作品集演示先允许页面按钮直接触发。
  const body = (await request.json().catch(() => null)) as { interests?: unknown } | null;
  const result = await runDailyPipeline({
    sendEmail: true,
    interestSlugs: normalizeInterests(body?.interests),
  });

  return Response.json(result);
}
