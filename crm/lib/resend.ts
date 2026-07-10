import { Resend } from "resend";
import React from "react";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

function fromAddress() {
  const name = process.env.RESEND_FROM_NAME ?? "BluuHQ";
  const email = process.env.RESEND_FROM_EMAIL ?? "hello@bluuhq.com";
  return name + " <" + email + ">";
}

const DEFAULT_REPLY_TO = () => process.env.RESEND_REPLY_TO ?? "hello@bluuhq.com";

// ─── Core send (React Email template) ────────────────────────────────────────

export async function sendEmail({
  to,
  subject,
  template,
  replyTo,
}: {
  to: string;
  subject: string;
  template: React.ReactElement;
  replyTo?: string;
}): Promise<{ messageId: string | null }> {
  const { data, error } = await getResend().emails.send({
    from: fromAddress(),
    to: [to],
    subject,
    react: template,
    replyTo: replyTo ?? DEFAULT_REPLY_TO(),
  });
  if (error) {
    throw new Error(`Resend error: ${error.message ?? JSON.stringify(error)}`);
  }
  return { messageId: data?.id ?? null };
}

// Backward-compatible HTML path for existing routes
export async function sendEmailHtml(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}): Promise<string | null> {
  const { data, error } = await getResend().emails.send({
    from: fromAddress(),
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo ?? DEFAULT_REPLY_TO(),
    tags: params.tags,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message ?? JSON.stringify(error)}`);
  }
  return data?.id ?? null;
}

// ─── Convenience functions ────────────────────────────────────────────────────

export async function sendPortalInvite(
  to: string,
  props: { clientName: string; loginUrl: string }
) {
  const { clientName, loginUrl } = props;
  return sendEmailHtml({
    to,
    subject: "You've been invited to your BluuHQ client portal",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#fff">
      <div style="background:#1875F2;padding:24px 32px">
        <p style="color:#fff;font-size:20px;font-weight:700;margin:0">BluuHQ</p>
      </div>
      <div style="padding:32px">
        <p style="font-size:18px;font-weight:600;color:#1E293B;margin:0 0 20px">Welcome, ${clientName}!</p>
        <p style="color:#1E293B;font-size:15px;line-height:1.6;margin:0 0 16px">You've been invited to your BluuHQ client portal — a secure space where you can view your invoices, shared files, and service updates.</p>
        <p style="color:#1E293B;font-size:15px;line-height:1.6;margin:0 0 24px">Click the button below to access your portal:</p>
        <a href="${loginUrl}" style="display:inline-block;background:#1875F2;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">Access Your Portal</a>
        <p style="color:#64748B;font-size:13px;margin:24px 0 0">If you didn't expect this email, you can safely ignore it.</p>
      </div>
      <hr style="border-color:#E2E8F0;margin:0">
      <div style="padding:16px 32px;background:#F8FAFC">
        <p style="color:#94A3B8;font-size:12px;margin:0;line-height:1.5">BluuHQ &middot; hello@bluuhq.com<br>You received this email because you are a BluuHQ client.</p>
      </div>
    </div>`,
  });
}

export async function sendTeamInvite(
  to: string,
  props: import("./emails/TeamInvite").TeamInviteProps
) {
  const { default: T, subject } = await import("./emails/TeamInvite");
  return sendEmail({ to, subject, template: React.createElement(T, props) });
}

export async function sendPasswordReset(
  to: string,
  props: import("./emails/PasswordReset").PasswordResetProps
) {
  const { default: T, subject } = await import("./emails/PasswordReset");
  return sendEmail({ to, subject, template: React.createElement(T, props) });
}

export async function sendInvoiceReady(
  to: string,
  props: import("./emails/InvoiceReady").InvoiceReadyProps
) {
  const { default: T, getSubject } = await import("./emails/InvoiceReady");
  return sendEmail({ to, subject: getSubject(props.invoiceNumber, props.amount, props.dueDate), template: React.createElement(T, props) });
}

export async function sendInvoiceReminder(
  to: string,
  props: import("./emails/InvoiceReminder").InvoiceReminderProps
) {
  const { default: T, getSubject } = await import("./emails/InvoiceReminder");
  return sendEmail({ to, subject: getSubject(props.daysOverdue, props.invoiceNumber), template: React.createElement(T, props) });
}

export async function sendPaymentReceipt(
  to: string,
  props: import("./emails/PaymentReceipt").PaymentReceiptProps
) {
  const { default: T, getSubject } = await import("./emails/PaymentReceipt");
  return sendEmail({ to, subject: getSubject(props.clientName), template: React.createElement(T, props) });
}

export async function sendNewService(
  to: string,
  props: import("./emails/NewService").NewServiceProps
) {
  const { default: T, getSubject } = await import("./emails/NewService");
  return sendEmail({ to, subject: getSubject(), template: React.createElement(T, props) });
}

export async function sendFileShared(
  to: string,
  props: import("./emails/FileShared").FileSharedProps
) {
  const { default: T, getSubject } = await import("./emails/FileShared");
  return sendEmail({ to, subject: getSubject(props.fileName), template: React.createElement(T, props) });
}

export async function sendClientFileUploaded(
  adminEmail: string,
  props: import("./emails/ClientFileUploaded").ClientFileUploadedProps
) {
  const { default: T, getSubject } = await import("./emails/ClientFileUploaded");
  return sendEmail({ to: adminEmail, subject: getSubject(props.clientName), template: React.createElement(T, props) });
}

export async function sendCancellationRequested(
  adminEmail: string,
  props: import("./emails/CancellationRequested").CancellationRequestedProps
) {
  const { default: T, getSubject } = await import("./emails/CancellationRequested");
  return sendEmail({ to: adminEmail, subject: getSubject(props.clientName, props.serviceName), template: React.createElement(T, props) });
}

export async function sendCancellationConfirmed(
  to: string,
  props: import("./emails/CancellationConfirmed").CancellationConfirmedProps
) {
  const { default: T, getSubject } = await import("./emails/CancellationConfirmed");
  return sendEmail({ to, subject: getSubject(), template: React.createElement(T, props) });
}

export async function sendNewTicketAdmin(
  adminEmail: string,
  props: import("./emails/NewTicket").NewTicketProps
) {
  const { default: T, getSubject } = await import("./emails/NewTicket");
  return sendEmail({ to: adminEmail, subject: getSubject(props.ticketNumber, props.clientName), template: React.createElement(T, props) });
}

export async function sendCredentialRevealed(
  adminEmail: string,
  props: import("./emails/CredentialRevealed").CredentialRevealedProps
) {
  const { default: T, getSubject } = await import("./emails/CredentialRevealed");
  return sendEmail({ to: adminEmail, subject: getSubject(props.clientName, props.action), template: React.createElement(T, props) });
}

export async function sendTicketCreated(
  to: string,
  props: import("./emails/TicketCreated").TicketCreatedProps
) {
  const { default: T, getSubject } = await import("./emails/TicketCreated");
  return sendEmail({ to, subject: getSubject(props.ticketNumber), template: React.createElement(T, props) });
}

export async function sendTicketReply(
  to: string,
  props: import("./emails/TicketReply").TicketReplyProps
) {
  const { default: T, getSubject } = await import("./emails/TicketReply");
  return sendEmail({ to, subject: getSubject(props.ticketNumber), template: React.createElement(T, props) });
}

export async function sendTicketStatusChanged(
  to: string,
  props: import("./emails/TicketStatusChanged").TicketStatusChangedProps
) {
  const { default: T, getSubject } = await import("./emails/TicketStatusChanged");
  return sendEmail({ to, subject: getSubject(props.ticketNumber, props.toStatus), template: React.createElement(T, props) });
}

export async function sendTicketSlaBreached(
  adminEmail: string,
  props: import("./emails/TicketSlaBreached").TicketSlaBreachedProps
) {
  const { default: T, getSubject } = await import("./emails/TicketSlaBreached");
  return sendEmail({ to: adminEmail, subject: getSubject(props.ticketNumber, props.breachType), template: React.createElement(T, props) });
}

export function sendSequenceEmail(params: {
  to: string;
  subject: string;
  html: string;
  pauseUrl?: string;
  tags?: { name: string; value: string }[];
}): Promise<string | null> {
  const pauseFooter = params.pauseUrl
    ? `<div style="margin-top:40px;padding-top:16px;border-top:1px solid #E2E8F0;font-family:sans-serif;font-size:12px;color:#94A3B8;text-align:center">
        Not interested in these emails?&nbsp;
        <a href="${params.pauseUrl}" style="color:#94A3B8;text-decoration:underline">Click here to pause this sequence</a>
       </div>`
    : "";
  // Use SEQUENCE_REPLY_TO (Cloudflare-routed address) when set so replies are
  // detected via the inbound-email webhook. Falls back to the default reply-to.
  const replyTo = process.env.SEQUENCE_REPLY_TO ?? undefined;
  return sendEmailHtml({ ...params, html: params.html + pauseFooter, replyTo });
}
