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
  try {
    const { data, error } = await getResend().emails.send({
      from: fromAddress(),
      to: [to],
      subject,
      react: template,
      replyTo: replyTo ?? DEFAULT_REPLY_TO(),
    });
    if (error) {
      console.error("[resend] send error:", error);
      return { messageId: null };
    }
    return { messageId: data?.id ?? null };
  } catch (err) {
    console.error("[resend] unexpected error:", err);
    return { messageId: null };
  }
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
  try {
    const { data, error } = await getResend().emails.send({
      from: fromAddress(),
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo ?? DEFAULT_REPLY_TO(),
      tags: params.tags,
    });
    if (error) { console.error("[resend] sendEmailHtml error:", error); return null; }
    return data?.id ?? null;
  } catch (err) {
    console.error("[resend] sendEmailHtml unexpected error:", err);
    return null;
  }
}

// ─── Convenience functions ────────────────────────────────────────────────────

export async function sendPortalInvite(
  to: string,
  props: import("./emails/PortalInvite").PortalInviteProps
) {
  const { default: T, subject } = await import("./emails/PortalInvite");
  return sendEmail({ to, subject, template: React.createElement(T, props) });
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
  tags?: { name: string; value: string }[];
}): Promise<string | null> {
  return sendEmailHtml(params);
}
