import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";

// ─── POST /api/admin/sequences/[id]/sync ─────────────────────────────────────
// Kept for backward-compat; sequences are now native (no external sync needed).

export async function POST(
  req: NextRequest,
  { params: _ }: { params: { id: string } }
) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;

  return NextResponse.json({ ok: true });
}
