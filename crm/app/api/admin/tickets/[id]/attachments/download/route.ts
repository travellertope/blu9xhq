import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { getPresignedDownloadUrl } from "@/lib/r2";

// GET /api/admin/tickets/[id]/attachments/download?key=<r2key>
// Generates a short-lived presigned R2 URL and redirects to it.
export async function GET(
  req: NextRequest,
  { params: _params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const key = req.nextUrl.searchParams.get("key");
  if (!key || !key.startsWith("tickets/")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  try {
    const url = await getPresignedDownloadUrl(key, 300); // 5-minute link
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }
}
