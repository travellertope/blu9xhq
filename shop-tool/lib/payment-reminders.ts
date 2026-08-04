import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendPaymentFailedEmail, sendPaymentStillFailingEmail, sendFinalPaymentWarningEmail } from "@/lib/resend";

/**
 * Resets a shop's failure streak — called on any successful charge (fresh
 * subscribe or renewal) and on any explicit plan write, so a recovered
 * payer, or a shop that's already moved to free for some other reason,
 * never carries a stale count into a future failure cycle.
 */
export async function resetPaymentFailureCount(shopId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("shops").update({ payment_failure_count: 0 }).eq("id", shopId);
}

/**
 * Called on each failed renewal charge, for either billing provider. Both
 * Stripe and Paystack retry a failed charge a few times before finally
 * cancelling the subscription — rather than reading each provider's own
 * retry-schedule/remaining-attempts metadata (Stripe exposes one via
 * invoice.next_payment_attempt, Paystack's shape isn't confirmed), this
 * just counts failures per shop and maps position in that count to which
 * email in the 3-part sequence goes out. The actual downgrade still
 * happens independently, via the existing
 * subscription.deleted/subscription.disable handlers.
 */
export async function handlePaymentFailure(shopId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, plan, owner_email, payment_failure_count")
    .eq("id", shopId)
    .maybeSingle();
  if (!shop || !shop.owner_email || shop.plan === "free") return;

  const failureCount = (shop.payment_failure_count ?? 0) + 1;
  await supabase.from("shops").update({ payment_failure_count: failureCount }).eq("id", shopId);

  const billingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/billing`;
  const params = { to: shop.owner_email, shopName: shop.name, plan: shop.plan, billingUrl };

  try {
    if (failureCount === 1) {
      await sendPaymentFailedEmail(params);
    } else if (failureCount === 2) {
      await sendPaymentStillFailingEmail(params);
    } else {
      await sendFinalPaymentWarningEmail(params);
    }
  } catch (err) {
    console.error("[payment-reminders] failed to send reminder email:", err);
  }
}
