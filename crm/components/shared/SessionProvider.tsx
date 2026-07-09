"use client";

import type { ReactNode } from "react";

/**
 * Session is now managed by Supabase cookies — no client-side provider needed.
 * This wrapper is kept so app/layout.tsx doesn't need to change.
 */
export default function SessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
