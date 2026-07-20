"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/** Invisible — fires a single "view" event on mount. */
export default function AnalyticsTracker({ shopId, productId }: { shopId: string; productId?: string }) {
  useEffect(() => {
    trackEvent(shopId, "view", productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, productId]);

  return null;
}
