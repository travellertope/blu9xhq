import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { sendEmailHtml } from "@/lib/resend";

// POST /api/admin/team/[id]/reset-password — emails the team member a
// Supabase-generated recovery link so they can set a new password. Admins
// never see or set the password themselves.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as any;
  const tenantId = actor.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: member, error: fetchErr } = await supabase
      .from("team_members")
      .select("user_id, status")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!member) return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    if (member.status !== "active") {
      return NextResponse.json({ error: "Cannot reset the password of a deactivated member" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(member.user_id);
    if (userErr || !userData?.user?.email) {
      throw new Error(userErr?.message ?? "Could not find this member's account");
    }
    const email = userData.user.email;
    const fullName = (userData.user.user_metadata as any)?.full_name ?? email;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${siteUrl}/reset-password?recovery=1` },
    });
    if (linkErr || !linkData?.properties?.action_link) {
      throw new Error(linkErr?.message ?? "Failed to generate password reset link");
    }

    await sendEmailHtml({
      to: email,
      subject: "Reset your BluuHQ password",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#fff">
          <div style="padding:20px 32px;border-bottom:4px solid #1875F2">
            <img src="https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png" alt="BluuHQ" height="32" style="display:block">
          </div>
          <div style="padding:32px">
            <h2 style="color:#1e293b;margin:0 0 20px">Reset your password</h2>
            <p>Hi ${fullName},</p>
            <p>An admin requested a password reset for your BluuHQ account. Click the button below to set a new password.</p>
            <a href="${linkData.properties.action_link}" style="background:#1875F2;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">
              Set new password
            </a>
            <p style="color:#64748b;font-size:13px;margin-top:24px">If you didn't expect this, you can ignore this email — your password won't change unless you click the link above.</p>
          </div>
        </div>
      `,
      tags: [{ name: "type", value: "team_password_reset" }],
    });

    await logAuditEvent({
      action:    AUDIT_ACTIONS.TEAM_MEMBER_PASSWORD_RESET_SENT,
      actorName: actor.name ?? actor.email,
      detail:    `Sent password reset link to ${email}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST /api/admin/team/[id]/reset-password]", err);
    return NextResponse.json({ error: err.message ?? "Failed to send password reset" }, { status: 502 });
  }
}
