"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { ClientStatusBadge } from "@/components/admin/ClientStatusBadge";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import type { WPSubscriptionPost } from "@/lib/wp-api";

interface ClientSubscriptionsProps {
  clientId: number;
  initialSubscriptions: WPSubscriptionPost[];
}

export function ClientSubscriptions({ initialSubscriptions }: ClientSubscriptionsProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  async function handleApproveCancellation(sub: WPSubscriptionPost) {
    setApprovingId(sub.id);
    try {
      const res = await fetch(`/api/admin/subscriptions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to approve cancellation");

      toast.success(`Cancellation approved — subscription marked as cancelled`);
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === sub.id ? { ...s, acf: { ...s.acf, status: "cancelled" } } : s
        )
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve cancellation");
    } finally {
      setApprovingId(null);
    }
  }

  if (subscriptions.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-slate-400">No active subscriptions</p>
        <a
          href="subscriptions/new"
          className="mt-2 inline-block text-xs text-indigo-600 hover:underline"
        >
          Add a subscription
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => {
        const isPendingCancellation = sub.acf.status === "cancellation_pending";
        return (
          <div
            key={sub.id}
            className={`rounded-lg border px-4 py-3 ${isPendingCancellation ? "border-red-200 bg-red-50" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {sub.title.rendered.replace(/<[^>]+>/g, "")}
                </p>
                <p className="text-xs text-slate-500">
                  {sub.acf.currency} {sub.acf.amount?.toLocaleString()} /{" "}
                  {sub.acf.billing_cycle?.replace("_", " ")}
                </p>
              </div>
              <div className="text-right">
                <ClientStatusBadge status={sub.acf.status} />
                {sub.acf.next_billing_date && !isPendingCancellation && (
                  <p className="text-xs text-slate-400 mt-1">
                    Next: {format(parseISO(sub.acf.next_billing_date), "MMM d")}
                  </p>
                )}
              </div>
            </div>

            {isPendingCancellation && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                  <div className="text-xs text-red-700">
                    <span className="font-medium">Client requested cancellation</span>
                    {sub.acf.sub_cancellation_requested_at && (
                      <span className="text-red-500 ml-1">
                        on {format(parseISO(sub.acf.sub_cancellation_requested_at), "MMM d, yyyy")}
                      </span>
                    )}
                    {sub.acf.sub_cancellation_reason && (
                      <p className="mt-0.5 text-red-600">
                        Reason: {sub.acf.sub_cancellation_reason.replace(/_/g, " ")}
                      </p>
                    )}
                    {sub.acf.sub_cancellation_note && (
                      <p className="mt-0.5 italic text-red-500">
                        &ldquo;{sub.acf.sub_cancellation_note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
                <PermissionGuard permission="approve_cancellations">
                  <button
                    onClick={() => handleApproveCancellation(sub)}
                    disabled={approvingId === sub.id}
                    className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {approvingId === sub.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : null}
                    Approve Cancellation
                  </button>
                </PermissionGuard>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
