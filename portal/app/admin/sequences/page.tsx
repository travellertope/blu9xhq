"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withPermission } from "@/components/shared/PermissionGuard";
import { format, parseISO } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WPSequencePost {
  id: string;
  title: string;
  acf: {
    trigger?: string;
    is_active?: boolean;
    seq_loops_id?: string;
    seq_loops_synced_at?: string;
    steps?: unknown[];
  };
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const TRIGGER_COLORS: Record<string, string> = {
  manual:                 "bg-slate-100 text-slate-700",
  subscription_assigned:  "bg-indigo-100 text-indigo-700",
  invoice_overdue:        "bg-amber-100 text-amber-700",
  client_inactive:        "bg-orange-100 text-orange-700",
  cancellation_requested: "bg-red-100 text-red-700",
};

function TriggerBadge({ trigger }: { trigger?: string }) {
  const t = trigger ?? "manual";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        TRIGGER_COLORS[t] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {t.replace(/_/g, " ")}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SequencesPage() {
  const [sequences, setSequences] = useState<WPSequencePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sequences");
      const data = await res.json();
      setSequences(data.sequences ?? data ?? []);
    } catch {
      toast.error("Failed to load sequences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSync(seq: WPSequencePost) {
    setSyncingId(seq.id);
    try {
      const res = await fetch(`/api/admin/sequences/${seq.id}/sync`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      toast.success(`"${seq.title}" synced to Loops`);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncingId(null);
    }
  }

  const stepCount = (seq: WPSequencePost) =>
    Array.isArray(seq.acf?.steps) ? seq.acf.steps.length : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sequences</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage automated email sequences sent through Loops.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sequences/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New Sequence
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading sequences…
          </div>
        ) : sequences.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400 mb-4">
              No sequences yet. Create your first email sequence.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/sequences/new">
                <Plus className="h-4 w-4 mr-1" />
                Create Sequence
              </Link>
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Trigger</th>
                <th className="px-4 py-3 font-medium">Steps</th>
                <th className="px-4 py-3 font-medium">Loops Sync</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sequences.map((seq) => {
                const isSynced = !!seq.acf?.seq_loops_id;
                const syncedAt = seq.acf?.seq_loops_synced_at;
                const steps = stepCount(seq);

                return (
                  <tr key={seq.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {seq.title}
                    </td>
                    <td className="px-4 py-3">
                      <TriggerBadge trigger={seq.acf?.trigger} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {steps} {steps === 1 ? "step" : "steps"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSynced ? (
                        <span className="text-xs text-green-700 font-medium">
                          Synced ✓
                          {syncedAt && (
                            <span className="text-gray-400 font-normal ml-1">
                              {format(parseISO(syncedAt), "MMM d")}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Not synced</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`inline-block h-2.5 w-2.5 rounded-full ${
                          seq.acf?.is_active ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={seq.acf?.is_active ? "Active" : "Inactive"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/sequences/${seq.id}`}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleSync(seq)}
                          disabled={syncingId === seq.id}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 font-medium disabled:opacity-40"
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${syncingId === seq.id ? "animate-spin" : ""}`}
                          />
                          Sync to Loops
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default withPermission("build_sequences")(SequencesPage);
