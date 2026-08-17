"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export default function PayNowButton({ token, accentColor }: { token: string; accentColor: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/pay/${token}/checkout`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) throw new Error(body.error ?? "Couldn't start checkout");
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
      )}
      <Button className="w-full" style={{ backgroundColor: accentColor }} onClick={handlePay} disabled={loading}>
        <CreditCard className="h-4 w-4 mr-1.5" />
        {loading ? "Redirecting…" : "Pay Now"}
      </Button>
    </div>
  );
}
