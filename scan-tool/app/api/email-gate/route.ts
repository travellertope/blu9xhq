import { NextResponse } from "next/server";
import { z } from "zod";
import { getScan, updateScan, upsertUser, addScanToUserIndex } from "@/lib/redis";
import { sendScanReport } from "@/lib/email/send-report";

const EmailGateSchema = z.object({
  scanId: z.string().min(1),
  email: z.string().email("Please enter a valid email address."),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = EmailGateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", message: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const { scanId, email } = parsed.data;

  const scan = await getScan(scanId);
  if (!scan) {
    return NextResponse.json(
      { error: "not_found", message: "Scan not found or expired." },
      { status: 404 }
    );
  }

  if (scan.status !== "complete") {
    return NextResponse.json(
      { error: "scan_incomplete", message: "Scan is still processing." },
      { status: 400 }
    );
  }

  await updateScan(scanId, { email }, { persist: true });
  await upsertUser(email);
  await addScanToUserIndex(email, scanId);

  try {
    await sendScanReport(email, scan);
  } catch {
    // Email failure shouldn't block unlocking
  }

  return NextResponse.json({
    id: scan.id,
    status: scan.status,
    scores: scan.scores,
    verdict: scan.verdict,
    summary: scan.summary,
    aiDetails: scan.aiDetails,
    compDetails: scan.compDetails,
    siteDetails: scan.siteDetails,
    strategicAnalysis: scan.strategicAnalysis,
    gated: false,
  });
}
