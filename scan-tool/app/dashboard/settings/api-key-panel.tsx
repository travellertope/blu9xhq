"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiKey } from "@/lib/redis";

export function ApiKeyPanel({ apiKey, isPro }: { apiKey: ApiKey | null; isPro: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/dashboard/api-key", { method: "POST" });
    const data = await res.json().catch(() => ({}));

    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Could not generate API key.");
      return;
    }

    setRevealedKey(data.apiKey.key);
    router.refresh();
  }

  async function handleRevoke() {
    setLoading(true);
    await fetch("/api/dashboard/api-key", { method: "DELETE" });
    setLoading(false);
    setRevealedKey(null);
    router.refresh();
  }

  if (!isPro) {
    return (
      <p className="text-sm text-gray-500">
        Upgrade to Monitor Pro from the{" "}
        <a href="/dashboard/billing" className="text-blue-600 font-medium">
          Billing page
        </a>{" "}
        to generate an API key.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {revealedKey && (
        <p className="text-xs text-amber-600">
          Save this key now — it won&apos;t be shown again after you leave this page.
        </p>
      )}

      {apiKey ? (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-mono text-ink">
              {revealedKey || `${apiKey.key.slice(0, 7)}${"•".repeat(20)}`}
            </p>
            <p className="text-xs text-gray-500">
              Created {new Date(apiKey.createdAt).toLocaleDateString()}
              {apiKey.lastUsedAt && ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="text-sm font-medium text-blue-600 disabled:opacity-50"
            >
              Regenerate
            </button>
            <button
              onClick={handleRevoke}
              disabled={loading}
              className="text-sm font-medium text-red-600 disabled:opacity-50"
            >
              Revoke
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate API key"}
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
