import { NextRequest, NextResponse } from "next/server";
import { listInvoices, updateInvoice, getClientPost, wpRestFetch } from "@/lib/wp-api";
import { sendInvoiceReminder } from "@/lib/resend";
import type { WPUser } from "@/lib/wp-api";

export const maxDuration = 60;

function daysOverdue(dueDateStr: string): number {
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now.getTime() - due.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const REMINDER_DAYS = new Set([0, 1, 4, 7]);

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("Authorization");
  if (!secret || authHeader !== "Bearer " + secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let processed = 0;
  let skipped = 0;

  try {
    const [sentResult, overdueResult] = await Promise.all([
      listInvoices({ status: "sent", per_page: 100 }),
      listInvoices({ status: "overdue", per_page: 100 }),
    ]);
    const invoices = [...sentResult.items, ...overdueResult.items];
    const today = todayStr();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    const results = await Promise.allSettled(
      invoices.map(async (invoice) => {
        const days = daysOverdue(invoice.acf.inv_due_date);
        if (days <= 0 && invoice.acf.inv_status === "sent") return "skipped";

        if (invoice.acf.inv_status === "sent" && days > 0) {
          await updateInvoice(invoice.id, { acf: { inv_status: "overdue" } });
        }

        if (!REMINDER_DAYS.has(days)) return "skipped";

        const lastReminder = invoice.acf.inv_last_reminder_sent ?? "";
        if (lastReminder === today) return "skipped";

        const clientPost = await getClientPost(invoice.acf.inv_client);
        const email = clientPost.acf.portal_email;
        if (!email) return "skipped";

        const wpUsers = await wpRestFetch<WPUser[]>("/wp/v2/users?search=" + encodeURIComponent(email)).catch(() => [] as WPUser[]);
        const wpUser = wpUsers?.[0];
        const prefs: string[] = Array.isArray(wpUser?.meta?.notification_preferences) ? wpUser!.meta.notification_preferences as string[] : [];
        if (prefs.length > 0 && !prefs.includes("invoice_reminders")) return "skipped";

        await sendInvoiceReminder(email, {
          clientName: clientPost.acf.contact_name,
          invoiceNumber: invoice.acf.inv_number,
          amount: invoice.acf.inv_total.toLocaleString(),
          currency: invoice.acf.inv_currency,
          dueDate: invoice.acf.inv_due_date,
          daysOverdue: days,
          payUrl: appUrl + "/portal/invoices/" + invoice.id,
        });

        await updateInvoice(invoice.id, { acf: { inv_last_reminder_sent: today } });
        return "processed";
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        if (r.value === "processed") processed++;
        else skipped++;
      } else {
        console.error("[cron/check-overdue] invoice failed:", r.reason);
        skipped++;
      }
    }
  } catch (err) {
    console.error("[cron/check-overdue] fatal:", err);
    return NextResponse.json({ error: "Cron job failed", details: String(err) }, { status: 500 });
  }

  return NextResponse.json({ processed, skipped });
}
