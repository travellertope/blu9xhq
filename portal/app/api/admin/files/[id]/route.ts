import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { deleteFile } from "@/lib/r2";
import { deleteFilePost, wpRestFetch, type WPFilePost } from "@/lib/wp-api";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(req, "delete_files");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const user = session.user as any;

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    // Fetch post to get r2 key and client id
    const filePost = await wpRestFetch<WPFilePost>(`/wp/v2/bluu_file/${postId}`);
    const r2Key = filePost.acf.file_r2_key;
    const clientId = filePost.acf.file_client;
    const fileName = filePost.title.rendered;

    // Delete from R2
    if (r2Key) {
      await deleteFile(r2Key);
    }

    // Delete WP post
    await deleteFilePost(postId);

    await logAuditEvent({
      action: AUDIT_ACTIONS.FILE_DELETED,
      actorName: user.name ?? "Unknown",
      actorWpUserId: user.wpUserId ?? 0,
      detail: `Deleted file: ${fileName}`,
      clientId,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/files/[id]]", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
