import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { getScan } from "@/lib/redis";

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

  const scan = await getScan(params.id);
  if (!scan) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(scan);
}
