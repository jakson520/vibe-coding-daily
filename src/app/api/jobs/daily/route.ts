import { runDailyPipeline } from "@/lib/daily/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const token = process.env.DAILY_JOB_TOKEN;
  if (!token) {
    return false;
  }

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return bearer === token;
}

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

async function handleDailyJob(
  request: Request,
  sendEmail: boolean,
  interests: string[],
) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDailyPipeline({ sendEmail, interestSlugs: interests });
  return Response.json(result);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { interests?: unknown } | null;
  return handleDailyJob(request, true, normalizeInterests(body?.interests));
}

export async function GET(request: Request) {
  const interests = new URL(request.url).searchParams
    .get("interests")
    ?.split(",") ?? [];
  return handleDailyJob(request, false, normalizeInterests(interests));
}
