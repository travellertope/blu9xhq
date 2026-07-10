import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireSession } from "@/lib/apiPermissions";
import { getEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from "@/lib/wp-api";
import { z } from "zod";

const patchSchema = z.object({
  title:     z.string().min(1).optional(),
  subject:   z.string().min(1).optional(),
  bodyHtml:  z.string().min(1).optional(),
  bodyText:  z.string().optional(),
  type:      z.string().min(1).optional(),
  mergeTags: z.array(z.string()).optional(),
});

// ─── GET /api/admin/email/templates/[id] ──────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const template = await getEmailTemplate(id);
    return NextResponse.json({ template });
  } catch (err: unknown) {
    console.error("[GET /api/admin/email/templates/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

// ─── PATCH /api/admin/email/templates/[id] ────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

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
    const template = await updateEmailTemplate(id, {
      ...(d.title ? { title: d.title } : {}),
      acf: {
        ...(d.subject   ? { subject:    d.subject }          : {}),
        ...(d.bodyHtml  ? { body_html:  d.bodyHtml }         : {}),
        ...(d.bodyText  !== undefined ? { body_text: d.bodyText } : {}),
        ...(d.type      ? { type:       d.type }              : {}),
        ...(d.mergeTags ? { merge_tags: JSON.stringify(d.mergeTags) } : {}),
      },
    });
    return NextResponse.json({ template });
  } catch (err: unknown) {
    console.error("[PATCH /api/admin/email/templates/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

// ─── DELETE /api/admin/email/templates/[id] ───────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await deleteEmailTemplate(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/admin/email/templates/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
