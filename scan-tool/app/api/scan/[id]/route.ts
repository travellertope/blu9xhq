import { NextResponse } from "next/server";
import { getScan } from "@/lib/redis";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || !id.startsWith("scan_")) {
    return NextResponse.json(
      { error: "invalid_id", message: "Invalid scan ID format." },
      { status: 400 }
    );
  }

  const scan = await getScan(id);

  if (!scan) {
    return NextResponse.json(
      { error: "not_found", message: "Scan not found or expired." },
      { status: 404 }
    );
  }

  const hasEmail = Boolean(scan.email);

  const response: Record<string, unknown> = {
    id: scan.id,
    status: scan.status,
    progress: scan.progress,
    currentStep: scan.currentStep,
    scores: scan.scores,
    summary: scan.summary,
    createdAt: scan.createdAt,
    completedAt: scan.completedAt,
    error: scan.error,
    gated: !hasEmail,
  };

  if (scan.status === "complete") {
    response.verdict = scan.verdict;
  }

  if (hasEmail && scan.status === "complete") {
    response.aiDetails = scan.aiDetails;
  }

  return NextResponse.json(response);
}
