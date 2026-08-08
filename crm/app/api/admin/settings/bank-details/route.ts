import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/encryption";

function tryDecrypt(value: string): string {
  try { return decrypt(value); } catch { return value; }
}

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "access_settings");
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("bank_name,bank_account_name,bank_account_number,bank_sort_code,address,from_email_name")
      .eq("id", tenantId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      bankName:      data.bank_name ?? "",
      accountName:   data.bank_account_name ?? "",
      accountNumber: data.bank_account_number ? tryDecrypt(data.bank_account_number) : "",
      sortCode:      data.bank_sort_code ? tryDecrypt(data.bank_sort_code) : "",
      address:       data.address ?? "",
      fromEmailName: data.from_email_name ?? "",
    });
  } catch (err) {
    console.error("[GET /api/admin/settings/bank-details]", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission(req, "access_settings");
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allowed: Record<string, string> = {
    bankName: "bank_name",
    accountName: "bank_account_name",
    accountNumber: "bank_account_number",
    sortCode: "bank_sort_code",
    address: "address",
    fromEmailName: "from_email_name",
  };

  const update: Record<string, string> = {};
  for (const [key, column] of Object.entries(allowed)) {
    if (key in body) {
      const value = String(body[key]);
      update[column] = (key === "accountNumber" || key === "sortCode") && value ? encrypt(value) : value;
    }
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("tenants")
      .update(update)
      .eq("id", tenantId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/settings/bank-details]", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
