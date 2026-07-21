"use client";

import { useState } from "react";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.766.46 3.49 1.334 5.006L2 22l5.129-1.322A9.958 9.958 0 0012.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.153a8.13 8.13 0 01-4.141-1.132l-.297-.176-3.048.784.813-2.968-.194-.306a8.13 8.13 0 01-1.242-4.355c0-4.489 3.653-8.14 8.144-8.14 4.49 0 8.14 3.651 8.14 8.14 0 4.489-3.65 8.153-8.14 8.153z" />
    </svg>
  );
}

export default function BuyNowButton({
  shopId,
  shopName,
  whatsappNumber,
  currency,
  product,
  variant = null,
  disabled,
  compact,
}: {
  shopId: string;
  shopName: string;
  whatsappNumber: string;
  currency: string;
  product: { id: string; name: string; price: number; image: string | null };
  variant?: Record<string, string> | null;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleBuyNow() {
    setLoading(true);

    const item = {
      product_id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      variant,
    };
    const message = buildOrderMessage(shopName, [{ ...item, image: product.image }], currency);
    const refCode = new URLSearchParams(window.location.search).get("ref");

    trackEvent(shopId, "checkout_click", product.id);

    try {
      await fetch("/api/order-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          items: [item],
          subtotal: product.price,
          whatsapp_message: message,
          ref_code: refCode,
        }),
      });
    } catch {
      // Best-effort — the WhatsApp handoff is what actually matters here.
    }

    window.open(buildWhatsAppUrl(whatsappNumber, message), "_blank");
    setLoading(false);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={disabled || loading}
        aria-label="Buy now on WhatsApp"
        className="shrink-0 w-9 h-9 rounded-md bg-[#25D366] text-white flex items-center justify-center disabled:opacity-50"
      >
        <WhatsAppIcon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      disabled={disabled || loading}
      onClick={handleBuyNow}
    >
      <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
      {loading ? "Opening…" : "Buy Now"}
    </Button>
  );
}
