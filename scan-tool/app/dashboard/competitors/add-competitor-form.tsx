"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddCompetitorForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/dashboard/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Could not add competitor.");
      return;
    }

    setDomain("");
    router.refresh();
  }

  if (disabled) {
    return <p className="text-sm text-gray-500">Tracking limit reached.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="competitor.com"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
