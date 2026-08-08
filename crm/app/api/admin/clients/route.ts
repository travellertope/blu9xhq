import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";
import { sendPortalInvite } from "@/lib/resend";
import { z } from "zod";

// Shapes a Supabase `clients` row as a WP-post-like object so existing page
// components (typed against WPClientPost) need no changes.
function toWpShape(row: any) {
  return {
    id:       row.id,
    title:    { rendered: row.contact_name },
    date:     row.created_at,
    modified: row.updated_at,
    status:   "publish",
    acf: {
      contact_name:               row.contact_name,
      contact_email:              row.contact_email,
      contact_phone:              row.contact_phone,
      company_name:               row.company_name,
      company_website:            row.company_website ?? undefined,
      industry:                   row.industry ?? undefined,
      portal_email:                row.portal_email ?? "",
      status:                     row.status,
      health_status:               row.health_status ?? undefined,
      health_note:                 row.health_note ?? undefined,
      health_overridden_at:        row.health_overridden_at ?? undefined,
      tags:                       (row.tags ?? []).join(","),
      notes:                      row.notes ?? undefined,
      last_contacted_at:           row.last_contacted_at ?? undefined,
      portal_invited_at:           row.portal_invited_at ?? undefined,
      active_subscription_count:   row.active_subscription_count ?? 0,
      health_auto_score:           row.health_auto_score ?? undefined,
    },
  };
}

// ─── GET /api/admin/clients ───────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "view_all_clients");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const { searchParams } = new URL(req.url);
  const page    = parseInt(searchParams.get("page")     ?? "1",  10);
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "20", 10), 100);
  const search  = searchParams.get("search") ?? undefined;
  const orderby = searchParams.get("orderby") ?? "date";
  const order   = (searchParams.get("order") ?? "desc") as "asc" | "desc";
  const status  = searchParams.get("status") ?? undefined;

  const ORDER_COL: Record<string, string> = { title: "contact_name", date: "created_at", modified: "updated_at" };
  const orderCol = ORDER_COL[orderby] ?? "created_at";

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("clients")
      .select("*", { count: "exact" })
      .eq("tenant_id", session.user.tenantId!);

    if (status) query = query.eq("status", status);
    if (search) query = query.or(`contact_name.ilike.%${search}%,company_name.ilike.%${search}%`);

    const from = (page - 1) * perPage;
    const { data, error, count } = await query
      .order(orderCol, { ascending: order === "asc" })
      .range(from, from + perPage - 1);

    if (error) throw error;

    const total = count ?? 0;
    return NextResponse.json({
      clients:    (data ?? []).map(toWpShape),
      total,
      totalPages: Math.max(Math.ceil(total / perPage), 1),
      page,
    });
  } catch (err) {
    console.error("[GET /api/admin/clients]", err);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 502 });
  }
}

// ─── POST /api/admin/clients ──────────────────────────────────────────────────

const createClientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().min(1),
  status: z.enum(["active", "inactive", "churned", "onboarding"]).default("onboarding"),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  sendInvite: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "create_edit_clients");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;
  const fullName = `${d.firstName} ${d.lastName}`;
  const tenantId = session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();

    const { data: inserted, error } = await supabase
      .from("clients")
      .insert({
        tenant_id:                  tenantId,
        contact_name:               fullName,
        contact_email:              encrypt(d.email),
        contact_phone:              d.phone ? encrypt(d.phone) : null,
        company_name:               d.company,
        portal_email:               d.email,
        status:                     d.status,
        tags:                       d.tags ?? [],
        notes:                      d.notes ?? null,
        active_subscription_count: 0,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A client with this email already exists." }, { status: 409 });
      }
      throw error;
    }

    if (d.sendInvite) {
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/portal-login`;
      await sendPortalInvite(d.email, {
        clientName: d.firstName,
        loginUrl: inviteLink,
      }).catch(console.error);

      await supabase
        .from("clients")
        .update({ portal_invited_at: new Date().toISOString() })
        .eq("id", inserted.id);
    }

    return NextResponse.json({ client: toWpShape(inserted) }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/clients]", err);
    return NextResponse.json({ error: err.message ?? "Failed to create client" }, { status: 502 });
  }
}
