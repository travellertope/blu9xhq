"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MeData {
  clientId?: number;
  name?: string;
  activeSubscriptionCount?: number;
  unpaidInvoiceCount?: number;
}

interface SubscriptionItem {
  id: number;
  status: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate?: string | null;
  service?: { name: string } | null;
}

interface SubscriptionsData {
  subscriptions?: SubscriptionItem[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200";
    case "paused":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "cancellation_pending":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "cancelled":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case "active": return "Active";
    case "paused": return "Paused";
    case "cancellation_pending": return "Cancellation Pending";
    case "cancelled": return "Cancelled";
    default: return status;
  }
}

export default function ClientPortalDashboard() {
  const [me, setMe] = useState<MeData | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire and forget login ping
    fetch("/api/portal/profile/login-ping", { method: "PATCH" }).catch(() => undefined);

    Promise.all([
      fetch("/api/portal/me").then((r) => r.json() as Promise<MeData>),
      fetch("/api/portal/subscriptions").then((r) => r.json() as Promise<SubscriptionsData>),
    ])
      .then(([meData, subsData]) => {
        setMe(meData);
        setSubscriptions(subsData.subscriptions ?? []);
      })
      .catch((err) => {
        console.error("[dashboard] fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const firstName = me?.name?.split(" ")[0] ?? "";
  const activeCount = me?.activeSubscriptionCount ?? 0;
  const unpaidCount = me?.unpaidInvoiceCount ?? 0;

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");

  const nextBilling = activeSubscriptions
    .filter((s) => s.nextBillingDate)
    .sort(
      (a, b) =>
        new Date(a.nextBillingDate!).getTime() - new Date(b.nextBillingDate!).getTime()
    )[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {getGreeting()}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s a summary of your account
        </p>
      </div>

      {/* Unpaid invoice alert */}
      {!loading && unpaidCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-800 font-medium">
            You have {unpaidCount} unpaid invoice{unpaidCount > 1 ? "s" : ""} outstanding.
          </p>
          <Link
            href="/portal/invoices"
            className="text-sm font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900"
          >
            View Invoices
          </Link>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/portal/subscriptions">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Active Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? "—" : activeCount}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-400">Loading…</p>
            ) : nextBilling ? (
              <div>
                <p className="text-lg font-bold text-slate-800">
                  {nextBilling.currency} {nextBilling.amount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(nextBilling.nextBillingDate!).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No upcoming payments</p>
            )}
          </CardContent>
        </Card>

        <Link href="/portal/invoices">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-800">
                {loading ? "—" : unpaidCount}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">unpaid</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Active subscriptions */}
      {!loading && activeSubscriptions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Your Services</h2>
            <Link
              href="/portal/subscriptions"
              className="text-sm text-[#1875F2] hover:text-[#1461CE] font-medium"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeSubscriptions.map((sub) => (
              <Link
                key={sub.id}
                href={`/portal/subscriptions#subscription-${sub.id}`}
                className="block"
              >
                <Card className="hover:border-blue-200 hover:shadow-sm transition-all">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-800 text-sm leading-snug">
                        {sub.service?.name ?? "Service"}
                      </p>
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadgeClass(sub.status)}`}
                      >
                        {formatStatusLabel(sub.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {sub.nextBillingDate
                        ? `Next billing: ${new Date(sub.nextBillingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${sub.currency} ${sub.amount.toLocaleString()}`
                        : `${sub.currency} ${sub.amount.toLocaleString()} / ${sub.billingCycle}`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Files CTA */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">Shared Files</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Contracts, deliverables, and documents from your team
              </p>
            </div>
            <Link
              href="/portal/files"
              className="text-sm font-semibold text-[#1875F2] hover:text-[#1461CE]"
            >
              View Files
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Help */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <h3 className="font-semibold text-slate-800 mb-1">Need help?</h3>
          <p className="text-sm text-slate-500">
            Reach out to your account manager at{" "}
            <a
              href="mailto:hello@bluuhq.com"
              className="text-[#1875F2] hover:text-[#1461CE] underline underline-offset-2"
            >
              hello@bluuhq.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
