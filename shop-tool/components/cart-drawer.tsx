"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { cartSubtotal, formatMoney } from "@/lib/whatsapp";
import CheckoutButton from "@/components/checkout-button";
import type { DeliveryZone } from "@/types";

export default function CartDrawer({
  shopId,
  shopSlug,
  shopName,
  whatsappNumber,
  currency,
  deliveryZones,
}: {
  shopId: string;
  shopSlug: string;
  shopName: string;
  whatsappNumber: string;
  currency: string;
  deliveryZones: DeliveryZone[];
}) {
  const { cart, updateQty } = useCart(shopSlug);
  const [open, setOpen] = useState(false);
  const [zoneId, setZoneId] = useState<string>(deliveryZones[0]?.id ?? "");

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const selectedZone = deliveryZones.find((z) => z.id === zoneId) ?? null;
  const total = cartSubtotal(cart) + (selectedZone?.fee ?? 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-blue text-white rounded-full h-14 w-14 shadow-lg flex items-center justify-center"
        aria-label="Open cart"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-coral text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-line">
              <h2 className="font-bold text-ink">Your cart</h2>
              <button onClick={() => setOpen(false)} className="text-ink-soft" aria-label="Close cart">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 && <p className="text-sm text-ink-soft text-center mt-8">Your cart is empty.</p>}
              {cart.map((item) => (
                <div key={`${item.product_id}-${JSON.stringify(item.variant)}`} className="flex gap-3">
                  <div className="w-14 h-14 rounded-md bg-bg-soft flex-shrink-0 overflow-hidden relative">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-ink-soft">{Object.values(item.variant).join(", ")}</p>
                    )}
                    <p className="text-sm text-ink-soft">{formatMoney(item.price, currency)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        className="w-6 h-6 rounded border border-line text-sm"
                        onClick={() => updateQty(item, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-sm w-5 text-center">{item.qty}</span>
                      <button
                        className="w-6 h-6 rounded border border-line text-sm"
                        onClick={() => updateQty(item, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-line space-y-3">
                {deliveryZones.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ink-soft">Delivery / pickup</label>
                    <select
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {deliveryZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} — {formatMoney(zone.fee, currency)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(total, currency)}</span>
                </div>
                <CheckoutButton
                  shopId={shopId}
                  shopSlug={shopSlug}
                  shopName={shopName}
                  whatsappNumber={whatsappNumber}
                  currency={currency}
                  deliveryZone={selectedZone}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
