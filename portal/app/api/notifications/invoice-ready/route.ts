import { NextRequest, NextResponse } from "next/server";
import { getInvoice, getClientPost, wpRestFetch } from "@/lib/wp-api";
import { sendInvoiceReady } from "@/lib/resend";
import { updateInvoice } from "@/lib/wp-api";
import type { WPUser } from "@/lib/wp-api";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("Authorization");
  if (secret && auth !== "Bearer " + secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { invoiceId?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { invoiceId } = body;
  if (!invoiceId) return NextResponse.json({ error: "invoiceId required" }, { status: 400 });

  try {
    const invoice = await getInvoice(invoiceId);
    const clientPost = await getClientPost(invoice.acf.inv_client);
    const email = clientPost.acf.portal_email;
    if (!email) return NextResponse.json({ error: "No client email" }, { status: 400 });

    const wpUsers = await wpRestFetch<WPUser[]>("/wp/v2/users?search=" + encodeURIComponent(email)).catch(() => [] as WPUser[]);
    const prefs: string[] = Array.isArray(wpUsers?.[0]?.meta?.notification_preferences)
      ? wpUsers[0].meta.notification_preferences as string[]
      : [];
    if (prefs.length > 0 && !prefs.includes("invoice_reminders")) {
      return NextResponse.json({ skipped: true, reason: "notifications disabled" });
    }

    const amount = invoice.acf.inv_total.toLocaleString();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const { messageId } = await sendInvoiceReady(email, {
      clientName: clientPost.acf.contact_name,
      invoiceNumber: invoice.acf.inv_number,
      amount,
      currency: invoice.acf.inv_currency,
      dueDate: invoice.acf.inv_due_date,
      payUrl: appUrl + "/portal/invoices/" + invoiceId,
    });

    if (messageId) {
      await updateInvoice(invoiceId, { acf: { inv_last_reminder_sent: new Date().toISOString().split("T")[0] } });
    }

    return NextResponse.json({ messageId });
  } catch (err) {
    console.error("[notifications/invoice-ready]", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
