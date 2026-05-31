"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CredentialRow from "@/components/portal/CredentialRow";
import CancellationModal from "@/components/portal/CancellationModal";

interface ActionButton {
  label: string;
  url: string;
}

interface PortalSubscription {
  id: number;
  title: string;
  serviceName: string;
  status: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate?: string;
  startDate?: string;
  cancellationRequestedAt?: string;
  actionButtons: ActionButton[];
  credentialLabels: string[];
  credentialCount: number;
}

function statusColor(status: string) {
  switch (status) {
    case "active": return "bg-green-100 text-green-800";
    case "trialing": return "bg-blue-100 text-blue-800";
    case "paused": return "bg-yellow-100 text-yellow-800";
    case "past_due": return "bg-orange-100 text-orange-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-muted text-muted-foreground";
  }
}

function cycleLabel(cycle: string) {
  return { monthly: "/mo", quarterly: "/qtr", annually: "/yr", one_time: " one-time" }[cycle] ?? "";
}

export default function PortalSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<PortalSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<PortalSubscription | null>(null);

  useEffect(() => {
    fetch("/api/portal/subscriptions")
      .then((r) => r.json())
      .then((d) => setSubscriptions(d.subscriptions ?? []))
      .catch(() => toast.error("Failed to load subscriptions"))
      .finally(() => setLoading(false));
  }, []);

  function handleCancelSuccess(subId: number) {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === subId
          ? { ...s, cancellationRequestedAt: new Date().toISOString() }
          : s
      )
    );
    toast.success("Cancellation request submitted. Our team will be in touch shortly.");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!subscriptions.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No active services yet</p>
        <p className="text-sm mt-1">Your subscriptions will appear here once set up.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Services</h1>
        <p className="text-muted-foreground text-sm">Manage your active subscriptions and access credentials</p>
      </div>

      {subscriptions.map((sub) => (
        <Card key={sub.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">{sub.serviceName || sub.title}</CardTitle>
                {sub.serviceName && sub.title !== sub.serviceName && (
                  <p className="text-xs text-muted-foreground mt-0.5">{sub.title}</p>
                )}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor(sub.status)}`}>
                {sub.status.replace("_", " ")}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Billing summary */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Amount</p>
                <p className="font-semibold">
                  {sub.currency} {sub.amount?.toLocaleString()}{cycleLabel(sub.billingCycle)}
                </p>
              </div>
              {sub.nextBillingDate && (
                <div>
                  <p className="text-muted-foreground text-xs">Next billing</p>
                  <p className="font-medium">{sub.nextBillingDate}</p>
                </div>
              )}
              {sub.startDate && (
                <div>
                  <p className="text-muted-foreground text-xs">Started</p>
                  <p className="font-medium">{sub.startDate}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {sub.actionButtons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sub.actionButtons.map((btn, i) => (
                  <a
                    key={i}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border rounded-md hover:bg-muted transition-colors"
                  >
                    {btn.label}
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            )}

            {/* Credentials vault */}
            {sub.credentialLabels.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Credentials
                </p>
                <div className="border rounded-lg px-3 divide-y">
                  {sub.credentialLabels.map((label, i) => (
                    <CredentialRow
                      key={i}
                      label={label}
                      subscriptionId={sub.id}
                      fieldIndex={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation status / button */}
            <div className="pt-1 flex items-center justify-between">
              {sub.cancellationRequestedAt ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle size={14} className="text-orange-500" />
                  Cancellation requested on{" "}
                  {new Date(sub.cancellationRequestedAt).toLocaleDateString()}
                </div>
              ) : sub.status !== "cancelled" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive text-xs"
                  onClick={() => setCancelTarget(sub)}
                >
                  Request cancellation
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}

      {cancelTarget && (
        <CancellationModal
          subscriptionId={cancelTarget.id}
          subscriptionTitle={cancelTarget.serviceName || cancelTarget.title}
          open={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={() => handleCancelSuccess(cancelTarget.id)}
        />
      )}
    </div>
  );
}
