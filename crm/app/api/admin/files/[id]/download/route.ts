import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { r2SignedUrl } from "@/lib/r2";
import { wpRestFetch, type WPFilePost } from "@/lib/wp-api";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const filePost = await wpRestFetch<WPFilePost>(`/wp/v2/bluu_file/${postId}`);
    const r2Key = filePost.acf.file_r2_key;

    if (!r2Key) {
      return NextResponse.json({ error: "File has no R2 key" }, { status: 404 });
    }

    const signedUrl = await r2SignedUrl(r2Key, 60);
    return NextResponse.json({ signedUrl });
  } catch (err) {
    console.error("[GET /api/admin/files/[id]/download]", err);
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
  }
}
