import type { Prisma } from "../../generated/prisma/client";

type ReportWithItems = Prisma.DailyReportGetPayload<{
  include: {
    items: {
      include: {
        article: {
          include: {
            source: true;
            analysis: true;
            tags: {
              include: {
                tag: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export function renderReportEmail(report: ReportWithItems) {
  const rows = report.items
    .map((item) => {
      const article = item.article;
      const analysis = article.analysis;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
            <div style="font-size:12px;color:#64748b;">${item.section} · ${article.source.name}</div>
            <a href="${article.url}" style="font-size:16px;font-weight:700;color:#0f172a;text-decoration:none;">${article.title}</a>
            <p style="margin:6px 0;color:#334155;line-height:1.6;">${analysis?.summaryZh ?? article.rawSummary ?? ""}</p>
            <p style="margin:0;color:#475569;">${analysis?.whyItMatters ?? ""}</p>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;padding:24px;">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <tr>
          <td>
            <h1 style="margin:0 0 8px;font-size:24px;color:#0f172a;">${report.title}</h1>
            <p style="margin:0 0 20px;color:#475569;line-height:1.6;">${report.brief}</p>
            <table width="100%" cellspacing="0" cellpadding="0">${rows}</table>
            <h2 style="font-size:16px;margin:24px 0 8px;color:#0f172a;">今日行动建议</h2>
            <p style="margin:0;color:#334155;line-height:1.6;">${report.actionAdvice}</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}
