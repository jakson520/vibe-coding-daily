import nodemailer from "nodemailer";
import { prisma } from "../prisma";
import { renderReportEmail } from "./render";

function hasEmailConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM &&
      process.env.EMAIL_TO,
  );
}

export async function sendDailyReportEmail(reportId: string) {
  if (!hasEmailConfig()) {
    return false;
  }

  const report = await prisma.dailyReport.findUniqueOrThrow({
    where: { id: reportId },
    include: {
      items: {
        orderBy: { rank: "asc" },
        include: {
          article: {
            include: {
              source: true,
              analysis: true,
              tags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: report.title,
    html: renderReportEmail(report),
  });

  await prisma.dailyReport.update({
    where: { id: report.id },
    data: {
      emailSentAt: new Date(),
    },
  });

  return true;
}
