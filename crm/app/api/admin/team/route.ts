import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { sendEmailHtml } from "@/lib/resend";
import { z } from "zod";

// ─── GET /api/admin/team ───────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  try {
    const supabase = createSupabaseServerClient();
    const admin = createSupabaseAdminClient();

    const { data: rows, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });
    if (error) throw error;

    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const members = (rows ?? []).map((m: any) => {
      const u = userMap.get(m.user_id);
      return {
        id:                       m.id,
        name:                     (u?.user_metadata as any)?.full_name ?? u?.email ?? "Unknown",
        email:                    u?.email ?? "",
        bluuhq_role:              m.crm_role,
        bluuhq_status:            m.status,
        bluuhq_assigned_clients:  m.assigned_clients ?? [],
        bluuhq_last_active:       u?.last_sign_in_at ?? null,
      };
    });

    return NextResponse.json({ members });
  } catch (err: any) {
    console.error("[GET /api/admin/team]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

// ─── POST /api/admin/team (invite) ────────────────────────────────────────────

const inviteSchema = z.object({
  firstName:       z.string().min(1),
  lastName:        z.string().min(1),
  email:           z.string().email(),
  role:            z.enum(["super_admin", "account_manager", "billing_manager", "support_staff", "viewer"]),
  assignedClients: z.array(z.string().uuid()).optional().default([]),
});

export async function POST(req: NextRequest) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as any;
  const tenantId = actor.tenantId!;

  const parsed = inviteSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;
  const fullName = `${d.firstName} ${d.lastName}`;

  try {
    const supabase = createSupabaseServerClient();
    const admin = createSupabaseAdminClient();

    // Find or invite the Supabase auth user (same pattern as the client-invite route)
    const { data: existing } = await admin.auth.admin.listUsers();
    const existingUser = existing?.users?.find((u) => u.email?.toLowerCase() === d.email.toLowerCase());

    let userId: string;
    let inviteLink: string;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (existingUser) {
      // Already has a password — /reset-password just consumes the link's
      // hash fragment and forwards them straight into /admin.
      userId = existingUser.id;
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type:    "magiclink",
        email:   d.email,
        options: { redirectTo: `${siteUrl}/reset-password` },
      });
      if (linkErr || !linkData?.properties?.action_link) {
        throw new Error(linkErr?.message ?? "Failed to generate sign-in link");
      }
      inviteLink = linkData.properties.action_link;
    } else {
      // Brand new account — force the "set a new password" UI, since
      // admin-login is email+password (no magic-link sign-in there).
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type:    "invite",
        email:   d.email,
        options: {
          redirectTo: `${siteUrl}/reset-password?recovery=1`,
          data:       { full_name: fullName },
        },
      });
      if (linkErr || !linkData?.properties?.action_link || !linkData.user) {
        throw new Error(linkErr?.message ?? "Failed to generate invite link");
      }
      userId = linkData.user.id;
      inviteLink = linkData.properties.action_link;
    }

    const { data: member, error: tmErr } = await supabase
      .from("team_members")
      .upsert(
        {
          tenant_id:        tenantId,
          user_id:          userId,
          crm_role:         d.role,
          status:           "active",
          assigned_clients: d.assignedClients,
        },
        { onConflict: "tenant_id,user_id" }
      )
      .select("*")
      .single();
    if (tmErr) throw tmErr;

    await sendEmailHtml({
      to: d.email,
      subject: "You've been invited to the BluuHQ team workspace",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#fff">
          <div style="padding:20px 32px;border-bottom:4px solid #1875F2">
            <img src="https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png" alt="BluuHQ" height="32" style="display:block">
          </div>
          <div style="padding:32px">
            <h2 style="color:#1e293b;margin:0 0 20px">Welcome to BluuHQ, ${d.firstName}!</h2>
            <p>You've been added to the BluuHQ CRM as <strong>${d.role.replace("_", " ")}</strong>.</p>
            <p>Click the button below to set your password and sign in for the first time.</p>
            <a href="${inviteLink}" style="background:#1875F2;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">
              Accept invite &amp; sign in
            </a>
          </div>
        </div>
      `,
      tags: [{ name: "type", value: "team_invite" }],
    });

    await logAuditEvent({
      action:    AUDIT_ACTIONS.TEAM_MEMBER_INVITED,
      actorName: actor.name ?? actor.email,
      detail:    `Invited ${fullName} (${d.email}) as ${d.role}`,
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/team]", err);
    const msg = err instanceof Error ? err.message : "Failed to invite team member";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
