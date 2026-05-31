import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { findClientByWpUserId, wpRestFetch } from "@/lib/wp-api";
import { r2SignedUrl } from "@/lib/r2";
import type { WPFilePost } from "@/lib/wp-api";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const fileId = parseInt(params.id, 10);
  if (!fileId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const file = await wpRestFetch<WPFilePost>("/wp/v2/bluu_file/" + fileId);
    if (file.acf.file_client !== clientPost.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (file.acf.file_visibility !== "shared") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const signedUrl = await r2SignedUrl(file.acf.file_r2_key, 60);
    return NextResponse.json({ signedUrl });
  } catch (err) {
    console.error("[GET /api/portal/files/[id]/download]", err);
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
  }
}
