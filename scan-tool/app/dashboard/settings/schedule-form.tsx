"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ScanSchedule } from "@/lib/redis";

export function ScheduleForm({
  schedule,
  defaultDomain,
}: {
  schedule: ScanSchedule | null;
  defaultDomain: string;
}) {
  const router = useRouter();
  const [domain, setDomain] = useState(schedule?.domain || defaultDomain);
  const [frequency, setFrequency] = useState<"weekly" | "daily">(schedule?.frequency || "weekly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/dashboard/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, frequency }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Could not save schedule.");
      return;
    }

    router.refresh();
  }

  async function handleDisable() {
    setLoading(true);
    await fetch("/api/dashboard/schedule", { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (schedule) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">
            {schedule.frequency === "daily" ? "Daily" : "Weekly"} re-scans for {schedule.domain}
          </p>
          <p className="text-xs text-gray-500">
            Next run {new Date(schedule.nextRunAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleDisable}
          disabled={loading}
          className="text-sm font-medium text-red-600 disabled:opacity-50"
        >
          Disable
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleEnable} className="flex items-end gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Domain</label>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as "weekly" | "daily")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Saving…" : "Enable"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
