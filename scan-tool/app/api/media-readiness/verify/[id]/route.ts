import { NextResponse } from "next/server";
import { getVerification } from "@/lib/mediaReadiness/engine";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || !id.startsWith("mrq_")) {
    return NextResponse.json(
      { error: "invalid_id", message: "Invalid verification ID format." },
      { status: 400 }
    );
  }

  const record = await getVerification(id);

  if (!record) {
    return NextResponse.json(
      { error: "not_found", message: "Verification not found or expired." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: record.id,
    status: record.status,
    progress: record.progress,
    currentStep: record.currentStep,
    findings: record.status === "processing" ? null : record.findings,
    error: record.error,
  });
}
