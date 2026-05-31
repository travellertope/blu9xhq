import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "BluuHQ <hello@bluuhq.com>";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

/** Send a transactional email via Resend. */
export async function sendEmail(params: SendEmailParams): Promise<string> {
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo,
    tags: params.tags,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return data!.id;
}

/** Send a portal invite magic link email. */
export async function sendPortalInvite(params: {
  to: string;
  clientName: string;
  magicLink: string;
  agencyName?: string;
}): Promise<string> {
  const agency = params.agencyName ?? "BluuHQ";
  return sendEmail({
    to: params.to,
    subject: `You're invited to the ${agency} client portal`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2>Welcome, ${params.clientName}!</h2>
        <p>You've been invited to access the ${agency} client portal where you can view your invoices, files, and project updates.</p>
        <p>
          <a href="${params.magicLink}" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
            Access Your Portal
          </a>
        </p>
        <p style="color:#64748b;font-size:14px">This link expires in 24 hours. If you didn't expect this email, you can safely ignore it.</p>
      </div>
    `,
    text: `Welcome, ${params.clientName}!\n\nAccess your portal: ${params.magicLink}\n\nThis link expires in 24 hours.`,
    tags: [{ name: "type", value: "portal_invite" }],
  });
}

/** Send an invoice notification email. */
export async function sendInvoiceEmail(params: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  paymentLink: string;
}): Promise<string> {
  return sendEmail({
    to: params.to,
    subject: `Invoice ${params.invoiceNumber} from BluuHQ`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2>Invoice ${params.invoiceNumber}</h2>
        <p>Hi ${params.clientName},</p>
        <p>Please find your invoice details below:</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#64748b">Amount Due</td><td style="padding:8px 0;font-weight:bold">${params.amount}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Due Date</td><td style="padding:8px 0">${params.dueDate}</td></tr>
        </table>
        <p>
          <a href="${params.paymentLink}" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
            Pay Now
          </a>
        </p>
      </div>
    `,
    tags: [{ name: "type", value: "invoice" }],
  });
}
