import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { getUserScanIds, getScan } from "@/lib/redis";

export async function GET(request: Request) {
  const user = await authenticateApiKey(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (user.tier !== "monitor_pro") {
    return NextResponse.json(
      { error: "forbidden", message: "API access requires the Monitor Pro plan." },
      { status: 403 }
    );
  }

  const ids = await getUserScanIds(user.email, 50);
  const scans = await Promise.all(ids.map((id) => getScan(id)));

  return NextResponse.json({ scans: scans.filter(Boolean) });
}
