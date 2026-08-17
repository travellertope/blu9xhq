import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { deleteFile } from "@/lib/r2";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(req, "delete_files");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const user = session.user as any;
  const tenantId = user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();

    const { data: fileRow, error: fetchErr } = await supabase
      .from("files")
      .select("r2_key, client_id, title")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!fileRow) return NextResponse.json({ error: "File not found" }, { status: 404 });

    if (fileRow.r2_key) {
      await deleteFile(fileRow.r2_key);
    }

    const { error: deleteErr } = await supabase
      .from("files")
      .delete()
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (deleteErr) throw deleteErr;

    await logAuditEvent({
      action:    AUDIT_ACTIONS.FILE_DELETED,
      actorName: user.name ?? "Unknown",
      detail:    `Deleted file: ${fileRow.title}`,
      clientId:  fileRow.client_id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/files/[id]]", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
