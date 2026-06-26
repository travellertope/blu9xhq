"use client";

import { useState } from "react";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.url) {
      setError(data.message || "Could not open billing portal.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
