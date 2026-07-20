import type { CartItem } from "@/types";

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    // Unknown/unsupported currency code — fall back to a plain number so
    // checkout never breaks over a formatting edge case.
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * Builds the itemized order message a shopper sends to the merchant on
 * WhatsApp. This is the entire "checkout" — there is no payment step here,
 * just a clear summary so the merchant knows exactly what was ordered.
 */
export function buildOrderMessage(
  shopName: string,
  items: CartItem[],
  currency: string,
  deliveryZone?: { name: string; fee: number } | null
): string {
  const lines = items.map((item) => {
    const variantStr = item.variant
      ? ` (${Object.values(item.variant).join(", ")})`
      : "";
    return `${item.qty}x ${item.name}${variantStr} — ${formatMoney(item.price * item.qty, currency)}`;
  });

  const subtotal = cartSubtotal(items);
  const total = subtotal + (deliveryZone?.fee ?? 0);

  return [
    `New order from ${shopName} 🛍️`,
    "",
    ...lines,
    "",
    ...(deliveryZone
      ? [`Delivery: ${deliveryZone.name} — ${formatMoney(deliveryZone.fee, currency)}`, ""]
      : []),
    `Total: ${formatMoney(total, currency)}`,
  ].join("\n");
}

/**
 * Builds a wa.me deep link with the order message pre-filled. wa.me expects
 * digits only (no "+", spaces, or punctuation) in the phone segment.
 */
export function buildWhatsAppUrl(whatsappNumberE164: string, message: string): string {
  const digitsOnly = whatsappNumberE164.replace(/[^\d]/g, "");
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${digitsOnly}?${params.toString()}`;
}
