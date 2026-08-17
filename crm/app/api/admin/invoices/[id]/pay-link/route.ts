import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createInvoiceToken } from "@/lib/invoiceToken";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Returns a shareable /invoice/view link for this invoice — the same
 * passwordless-view page and HMAC token scheme "Send to Client" already
 * uses (see app/api/admin/invoices/[id]/send/route.tsx, lib/invoiceToken.ts)
 * — so an admin can copy it without re-sending the invoice email.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission(req, "view_invoices");
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  const supabase = createSupabaseAdminClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id")
    .eq("id", params.id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const token = createInvoiceToken(invoice.id);
  const url = `${appUrl}/invoice/view?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ url });
}
