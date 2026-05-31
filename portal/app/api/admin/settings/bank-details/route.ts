import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";

interface WPSettings {
  bluuhq_bank_name?: string;
  bluuhq_bank_account_name?: string;
  bluuhq_bank_account_number?: string;
  bluuhq_bank_sort_code?: string;
  bluuhq_address?: string;
  bluuhq_from_email_name?: string;
}

export async function GET(req: NextRequest) {
  const auth = await requirePermission(req, "access_settings");
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await wpRestFetch<WPSettings>("/wp/v2/settings");
    return NextResponse.json({
      bankName: settings.bluuhq_bank_name ?? "",
      accountName: settings.bluuhq_bank_account_name ?? "",
      accountNumber: settings.bluuhq_bank_account_number ?? "",
      sortCode: settings.bluuhq_bank_sort_code ?? "",
      address: settings.bluuhq_address ?? "",
      fromEmailName: settings.bluuhq_from_email_name ?? "",
    });
  } catch (err) {
    console.error("[GET /api/admin/settings/bank-details]", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePermission(req, "access_settings");
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allowed: Record<string, string> = {
    bankName: "bluuhq_bank_name",
    accountName: "bluuhq_bank_account_name",
    accountNumber: "bluuhq_bank_account_number",
    sortCode: "bluuhq_bank_sort_code",
    address: "bluuhq_address",
    fromEmailName: "bluuhq_from_email_name",
  };

  const update: Record<string, string> = {};
  for (const [key, wpKey] of Object.entries(allowed)) {
    if (key in body) update[wpKey] = String(body[key]);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    await wpRestFetch("/wp/v2/settings", {
      method: "POST",
      body: JSON.stringify(update),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/settings/bank-details]", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
