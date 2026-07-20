import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "");
}

export async function sendScoreAlert(
  email: string,
  domain: string,
  previousScore: number,
  newScore: number,
  scanId: string
): Promise<void> {
  const delta = newScore - previousScore;
  const direction = delta > 0 ? "improved" : "dropped";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://scan.bluuhq.com";

  await getResend().emails.send({
    from: process.env.EMAIL_FROM || "BluuAudit <scan@bluuhq.com>",
    to: email,
    subject: `Your AI visibility score ${direction} ${Math.abs(delta)} points`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#0f1729">Score change detected for ${domain}</h2>
        <p style="color:#374151;font-size:14px">
          Your overall score went from <strong>${previousScore}</strong> to <strong>${newScore}</strong>
          (${delta > 0 ? "+" : ""}${delta} points) on your latest scheduled re-scan.
        </p>
        <a href="${appUrl}/dashboard/scans/${scanId}" style="display:inline-block;background:#2F5FE0;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:12px">View full report</a>
      </div>
    `,
  });
}
