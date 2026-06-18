import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "");
}

interface ScanData {
  id: string;
  input: { domain?: string; brand?: string; niche?: string; noSite: boolean };
  scores: { ai: number; site: number; comp: number; overall: number };
  verdict: { weakest: string; message: string; recommendation: string; serviceUrl: string } | null;
  aiDetails: Array<{ prompt: string; mentioned: boolean; position: string; sentiment: string; snippet: string }> | null;
  compDetails: { competitors: string[]; brandMentionedMoreThanCompetitors: boolean } | null;
  siteDetails: {
    https: boolean;
    hasTitle: boolean;
    hasDescription: boolean;
    hasOgTags: boolean;
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    hasStructuredData: boolean;
  } | null;
}

function buildFixList(site: ScanData["siteDetails"]): string[] {
  if (!site) return [];
  const fixes: string[] = [];
  if (!site.https) fixes.push("Move to HTTPS — browsers and AI crawlers both penalize unsecured sites.");
  if (!site.hasTitle) fixes.push("Add a descriptive <title> tag to your homepage.");
  if (!site.hasDescription) fixes.push("Add a meta description summarizing what you do.");
  if (!site.hasOgTags) fixes.push("Add Open Graph tags so AI tools and social previews can read your page.");
  if (!site.hasStructuredData) fixes.push("Add structured data (schema.org) so AI engines can parse who you are.");
  if (!site.hasRobotsTxt) fixes.push("Add a robots.txt file so crawlers know what they can index.");
  if (!site.hasSitemap) fixes.push("Add an XML sitemap so search and AI crawlers can find all your pages.");
  return fixes;
}

export async function sendScanReport(
  email: string,
  scan: ScanData
): Promise<void> {
  const subject = scan.input.domain
    ? `Your AI visibility report for ${scan.input.domain}`
    : `Your AI visibility report for ${scan.input.brand || "your brand"}`;

  const brandLabel = scan.input.domain || scan.input.brand || "your brand";

  const aiRows = (scan.aiDetails || [])
    .map(
      (d) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">${escapeHtml(d.prompt)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${d.mentioned ? "Yes" : "No"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${d.position}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${d.sentiment}</td>
        </tr>`
    )
    .join("");

  const fixList = buildFixList(scan.siteDetails);
  const competitors = scan.compDetails?.competitors || [];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
      <h1 style="font-size:22px;font-weight:800;color:#0f1729;margin:0 0 4px">
        AI Visibility Report
      </h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">for ${escapeHtml(brandLabel)}</p>

      <div style="display:flex;gap:12px;margin-bottom:24px">
        ${scoreBox("Overall", scan.scores.overall)}
        ${scoreBox("AI", scan.scores.ai)}
        ${scoreBox("Site", scan.scores.site)}
        ${scoreBox("Competitors", scan.scores.comp)}
      </div>

      ${scan.verdict ? `
      <div style="background:#f0f4ff;border-radius:8px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0f1729">${escapeHtml(scan.verdict.message)}</p>
        <p style="margin:0;font-size:13px;color:#6b7280">${escapeHtml(scan.verdict.recommendation)}</p>
      </div>
      ` : ""}

      ${scan.aiDetails && scan.aiDetails.length > 0 ? `
      <h2 style="font-size:16px;font-weight:700;color:#0f1729;margin:24px 0 12px">AI Discoverability Breakdown</h2>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600">Prompt</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600">Found</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600">Position</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600">Sentiment</th>
          </tr>
        </thead>
        <tbody>${aiRows}</tbody>
      </table>
      ` : ""}

      ${competitors.length > 0 ? `
      <h2 style="font-size:16px;font-weight:700;color:#0f1729;margin:24px 0 12px">Who AI Recommends Instead</h2>
      <ul style="margin:0 0 24px;padding-left:20px;font-size:13px;color:#374151;line-height:1.7">
        ${competitors.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}
      </ul>
      ` : ""}

      ${fixList.length > 0 ? `
      <h2 style="font-size:16px;font-weight:700;color:#0f1729;margin:24px 0 12px">Prioritized Fixes</h2>
      <ul style="margin:0 0 24px;padding-left:20px;font-size:13px;color:#374151;line-height:1.7">
        ${fixList.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}
      </ul>
      ` : ""}

      ${scan.verdict?.serviceUrl ? `
      <div style="text-align:center;margin-top:28px">
        <a href="${scan.verdict.serviceUrl}" style="display:inline-block;background:#2F5FE0;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700">
          See how we can help &rarr;
        </a>
      </div>
      ` : ""}
    </div>

    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">
      Sent by <a href="https://bluuhq.com" style="color:#2F5FE0;text-decoration:none">BluuHQ</a> &middot; No spam, ever.
    </p>
  </div>
</body>
</html>`;

  await getResend().emails.send({
    from: process.env.EMAIL_FROM || "BluuHQ Scan <scan@bluuhq.com>",
    to: email,
    subject,
    html,
  });
}

function scoreBox(label: string, value: number): string {
  const color = value < 45 ? "#E2543D" : value < 70 ? "#D9A22A" : "#2F9E63";
  return `<div style="flex:1;text-align:center;background:#f9fafb;border-radius:8px;padding:12px 8px">
    <div style="font-size:24px;font-weight:800;color:${color}">${value}</div>
    <div style="font-size:11px;color:#6b7280;margin-top:2px">${label}</div>
  </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
