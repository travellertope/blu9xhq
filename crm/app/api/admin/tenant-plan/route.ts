import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";

export const maxDuration = 30;

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ plan: session.user.tenantPlan ?? "free" });
}
