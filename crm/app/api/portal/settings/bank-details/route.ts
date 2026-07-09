import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";

interface WPSettings {
  bluuhq_bank_name?: string;
  bluuhq_bank_account_name?: string;
  bluuhq_bank_account_number?: string;
  bluuhq_bank_sort_code?: string;
}

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await wpRestFetch<WPSettings>("/wp/v2/settings");
    const details = {
      bankName: settings.bluuhq_bank_name ?? "",
      accountName: settings.bluuhq_bank_account_name ?? "",
      accountNumber: settings.bluuhq_bank_account_number ?? "",
      sortCode: settings.bluuhq_bank_sort_code ?? "",
    };

    const hasDetails = Object.values(details).some((v) => v !== "");
    if (!hasDetails) {
      return NextResponse.json({ error: "Bank details not configured" }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (err) {
    console.error("[GET /api/portal/settings/bank-details]", err);
    return NextResponse.json({ error: "Failed to load bank details" }, { status: 500 });
  }
}
