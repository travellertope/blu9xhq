import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decrypt, encrypt } from "@/lib/encryption";
import { calculateHealthScore } from "@/lib/healthScore";
import { z } from "zod";
import type { BluuCommunication, CommMoodSentiment, CommMoodSource } from "@/types";

function tryDecrypt(value: string): string {
  try {
    return decrypt(value);
  } catch {
    return value;
  }
}

function toWpClientShape(row: any) {
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

function toWpSubscriptionShape(row: any) {
  return {
    id:   row.id,
    title: { rendered: row.services?.title ?? "Subscription" },
    date: row.created_at,
    acf: {
      client_id:                row.client_id,
      service_id:                row.service_id,
      status:                    row.status,
      amount:                    row.amount,
      currency:                  row.currency,
      billing_cycle:              row.billing_cycle,
      next_billing_date:          row.next_billing_date ?? undefined,
      start_date:                 row.start_date ?? undefined,
      end_date:                   row.end_date ?? undefined,
      payment_gateway:            row.payment_gateway ?? undefined,
      gateway_subscription_id:    row.gateway_subscription_id ?? undefined,
      notes:                      row.notes ?? undefined,
      sub_cancellation_requested_at: row.sub_cancellation_requested_at ?? undefined,
      sub_cancellation_reason:       row.sub_cancellation_reason ?? undefined,
      sub_cancellation_note:         row.sub_cancellation_note ?? undefined,
    },
  };
}

// ─── GET /api/admin/clients/[id] ──────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission(req, "view_all_clients");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const tenantId = session.user.tenantId!;

  try {
    const supabase = createSupabaseServerClient();

    const { data: row, error: clientErr } = await supabase
      .from("clients")
      .select("*")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (clientErr) throw clientErr;
    if (!row) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const [{ data: subRows, error: subErr }, { data: commRows, error: commErr }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*, services(title)")
        .eq("tenant_id", tenantId)
        .eq("client_id", row.id)
        .not("status", "in", "(cancelled,expired)"),
      supabase
        .from("communications")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("client_id", row.id)
        .order("occurred_at", { ascending: false })
        .limit(90),
    ]);
    if (subErr) throw subErr;
    if (commErr) throw commErr;

    const activeSubscriptions = (subRows ?? []).map(toWpSubscriptionShape);

    const communications: BluuCommunication[] = (commRows ?? []).map((c: any) => ({
      id:                c.id,
      date:              c.created_at,
      clientId:          c.client_id,
      type:              c.comm_type,
      direction:         c.direction,
      channel:           c.channel,
      subject:           c.subject ?? "",
      content:           c.body ?? "",
      occurredAt:        c.occurred_at || c.created_at,
      loggedBy:          c.logged_by ?? 0,
      mood:              c.mood as CommMoodSentiment | undefined,
      moodSource:        c.mood_source as CommMoodSource | undefined,
      redFlags:          c.red_flags ?? [],
      followUpNeeded:    !!c.follow_up_needed,
      followUpDue:       c.follow_up_due,
      followUpCompleted: !!c.follow_up_completed,
    }));

    // Auto health score — background update, never blocks response
    const autoScore = calculateHealthScore(communications);
    const hasManualOverride = !!row.health_note;
    const decorated = { ...row };

    if (!hasManualOverride && row.health_status !== autoScore) {
      supabase
        .from("clients")
        .update({ health_status: autoScore, health_auto_score: autoScore })
        .eq("id", row.id)
        .then(({ error }) => { if (error) console.error("[health auto-update]", error); });
      decorated.health_status = autoScore;
    } else if (hasManualOverride && row.health_auto_score !== autoScore) {
      supabase
        .from("clients")
        .update({ health_auto_score: autoScore })
        .eq("id", row.id)
        .then(({ error }) => { if (error) console.error("[health auto-score store]", error); });
    }

    const decrypted = {
      ...decorated,
      contact_email: decorated.contact_email ? tryDecrypt(decorated.contact_email) : "",
      contact_phone: decorated.contact_phone ? tryDecrypt(decorated.contact_phone) : "",
    };

    return NextResponse.json({
      post:              toWpClientShape(decrypted),
      subscriptions:     activeSubscriptions,
      subscriptionCount: activeSubscriptions.length,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/clients/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

// ─── PATCH /api/admin/clients/[id] ────────────────────────────────────────────

const patchSchema = z.object({
  firstName:    z.string().min(1).optional(),
  lastName:     z.string().min(1).optional(),
  email:        z.string().email().optional(),
  portalEmail:  z.string().email().optional().or(z.literal("")),
  phone:        z.string().optional(),
  company:      z.string().optional(),
  website:      z.string().optional(),
  industry:     z.string().optional(),
  status:       z.enum(["active", "inactive", "churned", "onboarding"]).optional(),
  healthStatus: z.enum(["healthy", "needs_attention", "at_risk"]).optional(),
  healthNote:   z.string().optional(),
  tags:         z.array(z.string()).optional(),
  notes:        z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission(req, "create_edit_clients");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const tenantId = session.user.tenantId!;

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });

  const d = parsed.data;
  const update: Record<string, unknown> = {};

  if (d.email) {
    update.contact_email = encrypt(d.email);
    update.portal_email  = d.email;
  }
  if (d.portalEmail)            update.portal_email    = d.portalEmail;
  if (d.phone !== undefined)    update.contact_phone   = d.phone ? encrypt(d.phone) : null;
  if (d.company)                update.company_name    = d.company;
  if (d.website  !== undefined) update.company_website = d.website;
  if (d.industry !== undefined) update.industry        = d.industry;
  if (d.status)                 update.status          = d.status;
  if (d.healthStatus) {
    update.health_status        = d.healthStatus;
    update.health_overridden_at = new Date().toISOString();
  }
  if (d.healthNote !== undefined) update.health_note = d.healthNote;
  if (d.tags)                update.tags  = d.tags;
  if (d.notes !== undefined) update.notes = d.notes;

  if (d.firstName || d.lastName) {
    const current = d.firstName && d.lastName
      ? `${d.firstName} ${d.lastName}`
      : d.firstName ?? d.lastName ?? undefined;
    if (current) update.contact_name = current;
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data: updated, error } = await supabase
      .from("clients")
      .update(update)
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ post: toWpClientShape(updated) });
  } catch (err: any) {
    console.error("[PATCH /api/admin/clients/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

// ─── DELETE /api/admin/clients/[id] ───────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission(req, "delete_clients");
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("clients")
      .update({ status: "churned" })
      .eq("id", params.id)
      .eq("tenant_id", tenantId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/admin/clients/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
