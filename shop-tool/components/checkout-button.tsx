"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { buildOrderMessage, buildWhatsAppUrl, cartSubtotal } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export default function CheckoutButton({
  shopId,
  shopSlug,
  shopName,
  whatsappNumber,
  currency,
}: {
  shopId: string;
  shopSlug: string;
  shopName: string;
  whatsappNumber: string;
  currency: string;
}) {
  const { cart, clear } = useCart(shopSlug);
  const [loading, setLoading] = useState(false);

  const disabled = cart.length === 0 || loading;

  async function handleCheckout() {
    if (cart.length === 0) return;
    setLoading(true);

    const message = buildOrderMessage(shopName, cart, currency);
    const refCode = new URLSearchParams(window.location.search).get("ref");

    trackEvent(shopId, "checkout_click");

    try {
      await fetch("/api/order-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          items: cart.map((item) => ({
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            variant: item.variant,
          })),
          subtotal: cartSubtotal(cart),
          whatsapp_message: message,
          ref_code: refCode,
        }),
      });
    } catch {
      // Logging the intent is best-effort — the handoff to WhatsApp is what
      // actually matters to the shopper, so a logging failure shouldn't
      // block checkout.
    }

    window.open(buildWhatsAppUrl(whatsappNumber, message), "_blank");
    clear();
    setLoading(false);
  }

  return (
    <Button className="w-full" size="lg" disabled={disabled} onClick={handleCheckout}>
      {loading ? "Opening WhatsApp…" : "Checkout on WhatsApp"}
    </Button>
  );
}
