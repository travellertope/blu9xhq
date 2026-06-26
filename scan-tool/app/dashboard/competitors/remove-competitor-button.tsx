"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveCompetitorButton({ domain }: { domain: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    setLoading(true);
    await fetch("/api/dashboard/competitors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="text-xs font-medium text-gray-400 hover:text-red-600 disabled:opacity-50"
    >
      Remove
    </button>
  );
}
