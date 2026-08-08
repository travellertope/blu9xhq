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

const postSchema = z.object({
  title:     z.string().min(1),
  subject:   z.string().min(1),
  bodyHtml:  z.string().min(1),
  bodyText:  z.string().optional(),
  type:      z.string().min(1),
  mergeTags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("title", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ templates: (data ?? []).map(mapRow) });
  } catch (err: unknown) {
    console.error("[GET /api/admin/email/templates]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

export async function POST(req: NextRequest) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  const rawBody = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const d = parsed.data;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: inserted, error } = await supabase
      .from("email_templates")
      .insert({
        tenant_id:  tenantId,
        title:      d.title,
        subject:    d.subject,
        body_html:  d.bodyHtml,
        body_text:  d.bodyText || null,
        tmpl_type:  d.type,
        merge_tags: d.mergeTags ?? [],
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ template: mapRow(inserted) }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/admin/email/templates]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
