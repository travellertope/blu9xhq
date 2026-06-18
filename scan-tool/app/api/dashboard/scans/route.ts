import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserScanIds, getScan } from "@/lib/redis";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ids = await getUserScanIds(email);
  const scans = await Promise.all(ids.map((id) => getScan(id)));

  const summaries = scans
    .filter(Boolean)
    .map((scan) => ({
      id: scan.id,
      domain: scan.input?.domain,
      brand: scan.input?.brand,
      status: scan.status,
      scores: scan.scores,
      createdAt: scan.createdAt,
      completedAt: scan.completedAt,
    }));

  return NextResponse.json({ scans: summaries });
}
