import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { r2SignedUrl } from "@/lib/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: fileRow, error } = await supabase
      .from("files")
      .select("r2_key")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!fileRow?.r2_key) {
      return NextResponse.json({ error: "File has no R2 key" }, { status: 404 });
    }

    const signedUrl = await r2SignedUrl(fileRow.r2_key, 60);
    return NextResponse.json({ signedUrl });
  } catch (err) {
    console.error("[GET /api/admin/files/[id]/download]", err);
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
  }
}
