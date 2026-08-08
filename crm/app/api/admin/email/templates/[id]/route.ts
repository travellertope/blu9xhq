import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

function mapRow(row: any) {
  return {
    id:        row.id,
    title:     row.title,
    subject:   row.subject ?? "",
    bodyHtml:  row.body_html ?? "",
    bodyText:  row.body_text ?? "",
    type:      row.tmpl_type ?? "general",
  };
}

const patchSchema = z.object({
  title:     z.string().min(1).optional(),
  subject:   z.string().min(1).optional(),
  bodyHtml:  z.string().min(1).optional(),
  bodyText:  z.string().optional(),
  type:      z.string().min(1).optional(),
  mergeTags: z.array(z.string()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Template not found" }, { status: 404 });
    return NextResponse.json({ template: mapRow(data) });
  } catch (err: unknown) {
    console.error("[GET /api/admin/email/templates/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  const rawBody = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const d = parsed.data;

  try {
    const update: Record<string, unknown> = {};
    if (d.title !== undefined)    update.title = d.title;
    if (d.subject !== undefined)  update.subject = d.subject;
    if (d.bodyHtml !== undefined) update.body_html = d.bodyHtml;
    if (d.bodyText !== undefined) update.body_text = d.bodyText;
    if (d.type !== undefined)     update.tmpl_type = d.type;
    if (d.mergeTags !== undefined) update.merge_tags = d.mergeTags;

    const supabase = createSupabaseAdminClient();
    const { data: updated, error } = await supabase
      .from("email_templates")
      .update(update)
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ template: mapRow(updated) });
  } catch (err: unknown) {
    console.error("[PATCH /api/admin/email/templates/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("email_templates")
      .delete()
      .eq("id", params.id)
      .eq("tenant_id", tenantId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/admin/email/templates/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
