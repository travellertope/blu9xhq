"use client";

import { useState } from "react";
import OrderRow from "@/components/dashboard/order-row";
import type { OrderIntent, OrderIntentStatus } from "@/types";

const COLUMNS: { status: OrderIntentStatus; label: string }[] = [
  { status: "new", label: "New" },
  { status: "contacted", label: "Contacted" },
  { status: "confirmed", label: "Confirmed" },
  { status: "fulfilled", label: "Fulfilled" },
  { status: "cancelled", label: "Cancelled" },
];

export default function OrderKanban({
  initialOrders,
  currency,
}: {
  initialOrders: OrderIntent[];
  currency: string;
}) {
  const [orders, setOrders] = useState(initialOrders);

  function handleStatusChange(id: string, status: OrderIntentStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  return (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2">
      {COLUMNS.map((col) => {
        const columnOrders = orders.filter((o) => o.status === col.status);
        return (
          <div key={col.status} className="shrink-0 w-64 snap-start space-y-2.5">
            <div className="flex items-center gap-2 px-0.5">
              <h2 className="text-sm font-bold text-ink">{col.label}</h2>
              <span className="text-xs font-semibold text-ink-soft bg-bg-soft rounded-full px-2 py-0.5">
                {columnOrders.length}
              </span>
            </div>
            {columnOrders.length === 0 ? (
              <p className="text-xs text-ink-soft py-6 text-center border border-dashed border-line rounded-lg">
                None
              </p>
            ) : (
              <div className="space-y-2">
                {columnOrders.map((order) => (
                  <OrderRow key={order.id} order={order} currency={currency} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
