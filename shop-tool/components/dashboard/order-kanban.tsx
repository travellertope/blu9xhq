"use client";

import { useState } from "react";
import OrderRow from "@/components/dashboard/order-row";
import type { OrderIntent, OrderIntentStatus } from "@/types";

const TABS: { status: OrderIntentStatus; label: string }[] = [
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
  const [active, setActive] = useState<OrderIntentStatus>("new");

  function handleStatusChange(id: string, status: OrderIntentStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  const activeTab = TABS.find((t) => t.status === active)!;
  const activeOrders = orders.filter((o) => o.status === active);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
        {TABS.map((tab) => {
          const count = orders.filter((o) => o.status === tab.status).length;
          const isActive = tab.status === active;
          return (
            <button
              key={tab.status}
              type="button"
              onClick={() => setActive(tab.status)}
              className={`shrink-0 flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border ${
                isActive ? "bg-blue text-white border-blue" : "border-line text-ink-soft"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs font-semibold rounded-full px-1.5 ${
                  isActive ? "bg-white/20" : "bg-bg-soft"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {activeOrders.length === 0 ? (
        <p className="text-sm text-ink-soft py-12 text-center border border-dashed border-line rounded-lg">
          No {activeTab.label.toLowerCase()} orders.
        </p>
      ) : (
        <div className="space-y-2">
          {activeOrders.map((order) => (
            <OrderRow key={order.id} order={order} currency={currency} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
