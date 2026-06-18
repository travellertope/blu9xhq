import { Resend } from "resend";
import { buildScanNarrative } from "../scan/narrative";
import type { AiCheckResult, CompDetails, SiteDetails } from "../scan/types";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "");
}

interface ScanData {
  id: string;
  input: { domain?: string; brand?: string; niche?: string; noSite: boolean };
  scores: { ai: number; site: number; comp: number; overall: number };
  verdict: { weakest: string; message: string; recommendation: string; serviceUrl: string } | null;
  aiDetails: AiCheckResult[] | null;
  compDetails: CompDetails | null;
  siteDetails: SiteDetails | null;
  strategicAnalysis: string | null;
  summary: { pagesChecked: number; competitorsSurveyed: number; aiPromptsRun: number };
}

export async function sendScanReport(
  email: string,
  scan: ScanData
): Promise<void> {
  const subject = scan.input.domain
    ? `AI Visibility Report: ${scan.input.domain}`
    : `AI Visibility Report: ${scan.input.brand || "your brand"}`;

  const brandLabel = scan.input.domain || scan.input.brand || "your brand";

  const narrative = scan.aiDetails
    ? buildScanNarrative(
        scan.aiDetails,
        scan.compDetails,
        scan.siteDetails,
        brandLabel
      )
    : null;

  const competitors = scan.compDetails?.competitors || [];
  const gaps = scan.compDetails?.gaps || [];
  const siteIssues = narrative?.siteBullets || [];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px">
    <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">

      <h1 style="font-size:22px;font-weight:800;color:#0f1729;margin:0 0 4px">
        AI Visibility Report
      </h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 6px">for ${escapeHtml(brandLabel)}</p>
      <p style="color:#9ca3af;font-size:12px;margin:0 0 24px">
        ${scan.summary.aiPromptsRun} AI queries tested &middot; ${scan.summary.pagesChecked} pages crawled &middot; ${scan.summary.competitorsSurveyed} competitors analyzed
      </p>

      <!-- Scores -->
      <div style="display:flex;gap:12px;margin-bottom:28px">
        ${scoreBox("Overall", scan.scores.overall)}
        ${scoreBox("AI Visibility", scan.scores.ai)}
        ${scoreBox("Site Health", scan.scores.site)}
        ${scoreBox("Competitive", scan.scores.comp)}
      </div>

      <!-- Verdict -->
      ${scan.verdict ? `
      <div style="background:#f0f4ff;border-radius:8px;padding:16px;margin-bottom:28px">
        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0f1729">${escapeHtml(scan.verdict.message)}</p>
        <p style="margin:0;font-size:13px;color:#6b7280">${escapeHtml(scan.verdict.recommendation)}</p>
      </div>
      ` : ""}

      <!-- Strategic Analysis -->
      ${scan.strategicAnalysis ? `
      <div style="margin-bottom:28px">
        <h2 style="font-size:16px;font-weight:700;color:#0f1729;margin:0 0 12px;border-left:3px solid #2F5FE0;padding-left:10px">Strategic Assessment</h2>
        <div style="font-size:13px;color:#374151;line-height:1.7;white-space:pre-line">${escapeHtml(scan.strategicAnalysis)}</div>
      </div>
      ` : ""}

      <!-- AI Visibility Analysis -->
      ${narrative ? `
      <div style="margin-bottom:28px">
        <h2 style="font-size:16px;font-weight:700;color:#0f1729;margin:0 0 12px;border-left:3px solid #2F5FE0;padding-left:10px">AI Visibility Analysis</h2>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#0f1729;line-height:1.5">${escapeHtml(narrative.aiHeadline)}</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.7">
            ${narrative.aiBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
          </ul>
        </div>
      </div>
      ` : ""}

      <!-- Site Health -->
      ${narrative ? `
      <div style="margin-bottom:28px">
        <h2 style="font-size:16px;font-weight:700;color:#0f1729;margin:0 0 12px;border-left:3px solid #2F5FE0;padding-left:10px">Site Health</h2>
        <div style="background:#f9fafb;border-radius:8px;padding:16px">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#0f1729;line-height:1.5">${escapeHtml(narrative.siteHeadline)}</p>
          ${siteIssues.length > 0 ? `
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.7">
            ${siteIssues.map((b) => `<li style="color:#dc2626">${escapeHtml(b)}</li>`).join("")}
          </ul>
          ` : ""}
        </div>
      </div>
      ` : ""}

      <!-- Competitors -->
      ${competitors.length > 0 ? `
      <div style="margin-bottom:28px">
        <h2 style="font-size:16px;font-weight:700;color:#0f1729;margin:0 0 12px;border-left:3px solid #2F5FE0;padding-left:10px">Competitive Position</h2>
        ${narrative ? `
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:12px">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#0f1729;line-height:1.5">${escapeHtml(narrative.compHeadline)}</p>
        </div>
        ` : ""}
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600">Competitor</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600">Blog</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600">Schema</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600">Content Depth</th>
            </tr>
          </thead>
          <tbody>
            ${competitors.map((c) => `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">
                <strong>${escapeHtml(c.name)}</strong>
                ${c.domain ? `<br><span style="color:#6b7280;font-size:11px">${escapeHtml(c.domain)}</span>` : ""}
              </td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${c.hasBlog ? "&#10003;" : "&#10007;"}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center">${c.hasStructuredData ? "&#10003;" : "&#10007;"}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;text-align:center;color:${c.estimatedContentDepth === "deep" ? "#16a34a" : c.estimatedContentDepth === "moderate" ? "#d97706" : "#dc2626"}">${c.estimatedContentDepth}</td>
            </tr>`).join("")}
          </tbody>
        </table>

        ${gaps.length > 0 ? `
        <h3 style="font-size:14px;font-weight:700;color:#0f1729;margin:16px 0 8px">Competitive Gaps</h3>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#dc2626;line-height:1.7">
          ${gaps.map((g) => `<li>${escapeHtml(g)}</li>`).join("")}
        </ul>
        ` : ""}
      </div>
      ` : ""}

      <!-- CTA -->
      ${scan.verdict?.serviceUrl ? `
      <div style="text-align:center;margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb">
        <p style="font-size:14px;color:#0f1729;font-weight:600;margin:0 0 12px">Ready to close these gaps?</p>
        <a href="${scan.verdict.serviceUrl}" style="display:inline-block;background:#2F5FE0;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700">
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
  return `<div style="flex:1;text-align:center;background:#f9fafb;border-radius:8px;padding:14px 8px">
    <div style="font-size:28px;font-weight:800;color:${color}">${value}</div>
    <div style="font-size:11px;color:#6b7280;margin-top:4px">${label}</div>
  </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
