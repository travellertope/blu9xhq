import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {resolveClientPost, deleteFilePost, wpRestFetch} from "@/lib/wp-api";
import { deleteFile } from "@/lib/r2";
import type { WPFilePost } from "@/lib/wp-api";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; clientId?: number | string };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const fileId = parseInt(params.id, 10);
  if (!fileId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const clientPost = await resolveClientPost(sessionClientId, wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const file = await wpRestFetch<WPFilePost>("/wp/v2/bluu_file/" + fileId);
    if (file.acf.file_client !== clientPost.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (file.acf.file_uploaded_by !== wpUserId) {
      return NextResponse.json({ error: "You can only delete files you uploaded" }, { status: 403 });
    }

    await Promise.all([
      deleteFile(file.acf.file_r2_key),
      deleteFilePost(fileId),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/portal/files/[id]]", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
