import { NextRequest, NextResponse } from "next/server";
import { listInvoices, updateInvoice, getClientPost } from "@/lib/wp-api";
import { sendEmail } from "@/lib/resend";

function isBeforeToday(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return d < now;
  } catch {
    return false;
  }
}

function isTodayStr(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("Authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let processed = 0;
  const errors: string[] = [];

  try {
    // Fetch all sent invoices (up to 100 per batch)
    const result = await listInvoices({ status: "sent", per_page: 100 });
    const sentInvoices = result.items;

    for (const invoice of sentInvoices) {
      const dueDate = invoice.acf.inv_due_date;
      if (!isBeforeToday(dueDate)) continue;

      try {
        // Mark as overdue
        await updateInvoice(invoice.id, { acf: { inv_status: "overdue" } });

        // Send reminder if not already sent today
        const lastReminder = invoice.acf.inv_last_reminder_sent;
        if (!lastReminder || !isTodayStr(lastReminder)) {
          try {
            const clientPost = await getClientPost(invoice.acf.inv_client);
            const clientEmail = clientPost.acf.portal_email ?? clientPost.acf.contact_email;
            const clientName = clientPost.acf.contact_name || clientPost.title.rendered;

            if (clientEmail) {
              const invNumber = invoice.acf.inv_number;
              const total = invoice.acf.inv_total;
              const currency = invoice.acf.inv_currency;
              const portalUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

              await sendEmail({
                to: clientEmail,
                subject: `Overdue: Invoice ${invNumber} — Payment Required`,
                html: `
                  <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
                    <h2 style="color:#ef4444">Invoice Overdue</h2>
                    <p>Hi ${clientName},</p>
                    <p>Your invoice <strong>${invNumber}</strong> is now overdue. Please arrange payment as soon as possible.</p>
                    <table style="width:100%;border-collapse:collapse;margin:16px 0">
                      <tr><td style="padding:8px 0;color:#64748b">Invoice</td><td style="padding:8px 0;font-weight:600">${invNumber}</td></tr>
                      <tr><td style="padding:8px 0;color:#64748b">Amount Due</td><td style="padding:8px 0;font-weight:600;color:#ef4444">${currency} ${total?.toLocaleString()}</td></tr>
                      <tr><td style="padding:8px 0;color:#64748b">Was Due</td><td style="padding:8px 0">${dueDate}</td></tr>
                    </table>
                    <p>
                      <a href="${portalUrl}/portal" style="background:#ef4444;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
                        Pay Now
                      </a>
                    </p>
                    <p style="color:#64748b;font-size:13px">Please contact us if you have any questions about this invoice.</p>
                  </div>
                `,
                text: `Invoice ${invNumber} is overdue.\n\nAmount: ${currency} ${total}\nWas due: ${dueDate}\n\nPay now: ${portalUrl}/portal`,
                tags: [{ name: "type", value: "invoice_overdue" }],
              });

              // Update last reminder date
              const todayStr = new Date().toISOString().split("T")[0];
              await updateInvoice(invoice.id, {
                acf: { inv_last_reminder_sent: todayStr },
              });
            }
          } catch (emailErr) {
            console.error(`[cron/check-overdue] Failed to send reminder for invoice ${invoice.id}:`, emailErr);
          }
        }

        processed++;
      } catch (invErr) {
        const msg = `Failed to process invoice ${invoice.id}: ${invErr}`;
        errors.push(msg);
        console.error("[cron/check-overdue]", msg);
      }
    }
  } catch (err) {
    console.error("[cron/check-overdue] Fatal error:", err);
    return NextResponse.json({ error: "Cron job failed", details: String(err) }, { status: 500 });
  }

  return NextResponse.json({ processed, errors });
}
