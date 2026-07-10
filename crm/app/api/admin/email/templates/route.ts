import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireSession } from "@/lib/apiPermissions";
import { listEmailTemplates, createEmailTemplate } from "@/lib/wp-api";
import { z } from "zod";

const postSchema = z.object({
  title:     z.string().min(1),
  subject:   z.string().min(1),
  bodyHtml:  z.string().min(1),
  bodyText:  z.string().optional(),
  type:      z.string().min(1),
  mergeTags: z.array(z.string()).optional(),
});

// ─── GET /api/admin/email/templates ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;

  try {
    const { items } = await listEmailTemplates();
    const templates = items.map((t) => ({
      id:       t.id,
      title:    t.title.rendered,
      subject:  t.acf.subject   ?? "",
      bodyHtml: t.acf.body_html ?? "",
      bodyText: t.acf.body_text ?? "",
      type:     t.acf.type      ?? "general",
    }));
    return NextResponse.json({ templates });
  } catch (err: unknown) {
    console.error("[GET /api/admin/email/templates]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

// ─── POST /api/admin/email/templates ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;

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
    const template = await createEmailTemplate({
      title: d.title,
      acf: {
        subject:    d.subject,
        body_html:  d.bodyHtml,
        body_text:  d.bodyText,
        type:       d.type,
        merge_tags: d.mergeTags ? JSON.stringify(d.mergeTags) : undefined,
      },
    });
    return NextResponse.json({ template }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/admin/email/templates]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
