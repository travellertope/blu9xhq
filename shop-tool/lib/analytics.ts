"use client";

const SESSION_KEY = "bluushop_session_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Fire-and-forget — a failed analytics beacon should never break the shopper's flow. */
export function trackEvent(
  shopId: string,
  eventType: "view" | "add_to_cart" | "checkout_click",
  productId?: string
): void {
  const body = JSON.stringify({
    shop_id: shopId,
    event_type: eventType,
    product_id: productId ?? null,
    session_id: getOrCreateSessionId(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    return;
  }
  fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
    () => {}
  );
}
