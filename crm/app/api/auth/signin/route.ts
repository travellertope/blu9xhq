import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { decodeJwtClaims } from "@/lib/jwt";

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.session) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Custom claims (tenant_id, user_type, crm_role, ...) live at the top
  // level of the JWT payload, not on data.user.app_metadata.
  const claims = decodeJwtClaims(data.session.access_token);
  const userType = claims.user_type ?? "";

  // Return the same fields consuming code expects from the old NextAuth session.
  return NextResponse.json({
    user: {
      id:               data.user.id,
      email:            data.user.email,
      name:             data.user.user_metadata?.full_name ?? data.user.email,
      role:             userType === "team" ? "bluu_admin"
                        : userType === "client" ? "bluu_client"
                        : userType === "affiliate" ? "bluu_affiliate"
                        : null,
      tenantId:         claims.tenant_id,
      bluuhqRole:       claims.crm_role,
      assignedClients:  claims.assigned_clients ?? [],
      affiliateCode:    claims.affiliate_code,
      affiliateStatus:  claims.aff_status,
      wpUserId:         claims.wp_user_id ? Number(claims.wp_user_id) : undefined,
      clientId:         claims.client_id,
      status:           claims.status ?? "active",
    },
  });
}
