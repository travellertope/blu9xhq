"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/whatsapp";
import type { OrderIntent, OrderIntentStatus } from "@/types";

const STATUS_STYLES: Record<OrderIntentStatus, string> = {
  new: "bg-blue-soft text-blue",
  contacted: "bg-amber/10 text-amber",
  confirmed: "bg-green/10 text-green",
  fulfilled: "bg-ink-soft/10 text-ink-soft",
  cancelled: "bg-coral-soft text-coral",
};

export default function OrderRow({
  order,
  currency,
  onStatusChange,
}: {
  order: OrderIntent;
  currency: string;
  onStatusChange?: (id: string, status: OrderIntentStatus) => void;
}) {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  // Defensive against a missing/undefined delivery_fee (e.g. the column
  // migration hasn't been run against this database yet) — subtotal + a
  // non-finite value is NaN, which formatMoney would otherwise render as
  // literally "NaN" in the total shown to the owner.
  const deliveryFee = Number.isFinite(order.delivery_fee) ? order.delivery_fee : 0;
  const subtotal = Number.isFinite(order.subtotal) ? order.subtotal : 0;

  async function handleStatusChange(next: OrderIntentStatus) {
    setStatus(next);
    onStatusChange?.(order.id, next);
    setUpdating(true);
    await fetch(`/api/order-intents/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setUpdating(false);
  }

  return (
    <div className="bg-white border border-line rounded-site p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-soft">
          {new Date(order.created_at).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
        <select
          value={status}
          disabled={updating}
          onChange={(e) => handleStatusChange(e.target.value as OrderIntentStatus)}
          className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 ${STATUS_STYLES[status]}`}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <ul className="text-sm text-ink space-y-0.5">
        {order.items.map((item, i) => (
          <li key={i}>
            {item.qty}x {item.name}
            {item.variant && ` (${Object.values(item.variant).join(", ")})`}
          </li>
        ))}
      </ul>

      {order.delivery_zone_name && (
        <p className="text-xs text-ink-soft">
          Delivery: {order.delivery_zone_name} — {formatMoney(deliveryFee, currency)}
        </p>
      )}
      <p className="text-sm font-semibold text-ink">Total: {formatMoney(subtotal + deliveryFee, currency)}</p>
    </div>
  );
}
