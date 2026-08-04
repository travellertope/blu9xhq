import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

function fromAddress(): string {
  const name = process.env.RESEND_FROM_NAME ?? "BluuShop";
  const email = process.env.RESEND_FROM_EMAIL ?? "hello@bluuhq.com";
  return `${name} <${email}>`;
}

async function sendEmailHtml(params: { to: string; subject: string; html: string }): Promise<void> {
  const { error } = await getResend().emails.send({
    from: fromAddress(),
    to: [params.to],
    subject: params.subject,
    html: params.html,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message ?? JSON.stringify(error)}`);
  }
}

function billingEmailHtml(params: { heading: string; bodyHtml: string; ctaLabel: string; ctaUrl: string }): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#fff">
    <div style="background:#2F5FE0;padding:24px 32px">
      <p style="color:#fff;font-size:20px;font-weight:700;margin:0">BluuShop</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:18px;font-weight:600;color:#13181F;margin:0 0 20px">${params.heading}</p>
      ${params.bodyHtml}
      <a href="${params.ctaUrl}" style="display:inline-block;background:#2F5FE0;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px">${params.ctaLabel}</a>
    </div>
    <hr style="border-color:#E4E7EC;margin:0">
    <div style="padding:16px 32px;background:#F5F7FA">
      <p style="color:#5B6573;font-size:12px;margin:0;line-height:1.5">BluuShop &middot; hello@bluuhq.com<br>You're receiving this because you have an active BluuShop subscription.</p>
    </div>
  </div>`;
}

interface PaymentReminderParams {
  to: string;
  shopName: string;
  plan: string;
  billingUrl: string;
}

function planLabel(plan: string): string {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

/** First failed renewal charge. */
export async function sendPaymentFailedEmail(params: PaymentReminderParams): Promise<void> {
  await sendEmailHtml({
    to: params.to,
    subject: "Your BluuShop payment didn't go through",
    html: billingEmailHtml({
      heading: "We couldn't charge your card",
      bodyHtml: `<p style="color:#13181F;font-size:15px;line-height:1.6;margin:0 0 16px">We tried to renew <b>${params.shopName}</b>'s ${planLabel(params.plan)} subscription but the charge failed. We'll try again automatically, but it's worth updating your card now so you don't lose access.</p>`,
      ctaLabel: "Update payment method",
      ctaUrl: params.billingUrl,
    }),
  });
}

/** Second consecutive failed renewal charge. */
export async function sendPaymentStillFailingEmail(params: PaymentReminderParams): Promise<void> {
  await sendEmailHtml({
    to: params.to,
    subject: "Still trying — your BluuShop payment failed again",
    html: billingEmailHtml({
      heading: "Your payment has failed twice now",
      bodyHtml: `<p style="color:#13181F;font-size:15px;line-height:1.6;margin:0 0 16px">We've tried to charge your card for <b>${params.shopName}</b>'s ${planLabel(params.plan)} subscription twice now, and it still hasn't gone through. Please update your payment method soon — if it keeps failing, your subscription will be cancelled and ${params.shopName} will move to the Free plan.</p>`,
      ctaLabel: "Update payment method",
      ctaUrl: params.billingUrl,
    }),
  });
}

/** Third+ consecutive failed renewal charge — last warning before cancellation. */
export async function sendFinalPaymentWarningEmail(params: PaymentReminderParams): Promise<void> {
  await sendEmailHtml({
    to: params.to,
    subject: "Final notice: your BluuShop subscription is about to be cancelled",
    html: billingEmailHtml({
      heading: "This is your final reminder",
      bodyHtml: `<p style="color:#13181F;font-size:15px;line-height:1.6;margin:0 0 16px">We still haven't been able to charge your card for <b>${params.shopName}</b>'s ${planLabel(params.plan)} subscription. If the next attempt fails too, your subscription will be cancelled and ${params.shopName} will move to the Free plan — you'll lose your custom domain (if set) and won't be able to add products past the free 20-product limit. Your existing products and storefront design stay as they are.</p>`,
      ctaLabel: "Update payment method now",
      ctaUrl: params.billingUrl,
    }),
  });
}
