"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CredentialRow from "@/components/portal/CredentialRow";
import CancellationModal from "@/components/portal/CancellationModal";
import {
  ExternalLink,
  Globe,
  Code2,
  LayoutDashboard,
  Settings,
  Mail,
  Phone,
  FileText,
  Shield,
  Key,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ActionButton {
  icon: string;
  label: string;
  url: string;
}

interface SensitiveFieldLabel {
  label: string;
}

interface ServiceInfo {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  deliverables: string | null;
}

interface SubscriptionItem {
  id: number;
  status: string;
  amount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  cancellationReason?: string | null;
  cancellationRequestedAt?: string | null;
  actionButtons: ActionButton[];
  sensitiveFieldLabels: SensitiveFieldLabel[];
  filesCount: number;
  service?: ServiceInfo | null;
}

interface SubscriptionsData {
  subscriptions?: SubscriptionItem[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  ExternalLink,
  Globe,
  Code2,
  LayoutDashboard,
  Settings,
  Mail,
  Phone,
  FileText,
  Shield,
  Key,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? ExternalLink;
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "active": return "bg-green-100 text-green-700 border border-green-200";
    case "paused": return "bg-amber-100 text-amber-700 border border-amber-200";
    case "cancellation_pending": return "bg-orange-100 text-orange-700 border border-orange-200";
    case "cancelled": return "bg-slate-100 text-slate-500 border border-slate-200";
    default: return "bg-slate-100 text-slate-500 border border-slate-200";
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

function ServiceDetails({ service }: { service: ServiceInfo }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-md overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        Service Details
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2 text-sm text-slate-600 bg-white">
          {service.description && (
            <div>
              <p className="font-medium text-slate-700 mb-0.5">Description</p>
              <p>{service.description}</p>
            </div>
          )}
          {service.deliverables && (
            <div>
              <p className="font-medium text-slate-700 mb-0.5">Deliverables</p>
              <p>{service.deliverables}</p>
            </div>
          )}
          {service.category && (
            <div>
              <p className="font-medium text-slate-700 mb-0.5">Category</p>
              <p className="capitalize">{service.category.replace(/_/g, " ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubscriptionCard({
  sub,
  onCancelled,
}: {
  sub: SubscriptionItem;
  onCancelled: (id: number) => void;
}) {
  const [cancelOpen, setCancelOpen] = useState(false);

  return (
    <Card id={`subscription-${sub.id}`} className="scroll-mt-20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-slate-800 text-base">
            {sub.service?.name ?? `Subscription #${sub.id}`}
          </CardTitle>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${getStatusBadgeClass(sub.status)}`}
          >
            {formatStatusLabel(sub.status)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Billing details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Amount</p>
            <p className="font-semibold text-slate-800">
              {sub.currency} {sub.amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Billing Cycle</p>
            <p className="font-medium text-slate-700 capitalize">
              {sub.billingCycle.replace(/_/g, " ")}
            </p>
          </div>
          {sub.nextBillingDate && (
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Next Billing</p>
              <p className="font-medium text-slate-700">
                {new Date(sub.nextBillingDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
          {sub.startDate && (
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Started</p>
              <p className="font-medium text-slate-700">
                {new Date(sub.startDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
          {sub.endDate && (
            <div>
              <p className="text-slate-500 text-xs mb-0.5">End Date</p>
              <p className="font-medium text-slate-700">
                {new Date(sub.endDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Service details collapsible */}
        {sub.service && (sub.service.description || sub.service.deliverables || sub.service.category) && (
          <ServiceDetails service={sub.service} />
        )}

        {/* Action buttons */}
        {sub.actionButtons.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              {sub.actionButtons.map((btn, i) => {
                const Icon = getIcon(btn.icon);
                return (
                  <a
                    key={i}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {btn.label}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Credentials vault */}
        {sub.sensitiveFieldLabels.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">
              Credentials Vault
            </p>
            <div className="space-y-2">
              {sub.sensitiveFieldLabels.map((field) => (
                <CredentialRow
                  key={field.label}
                  subscriptionId={sub.id}
                  fieldLabel={field.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            {sub.filesCount > 0
              ? `${sub.filesCount} file${sub.filesCount > 1 ? "s" : ""} shared`
              : "No files shared yet"}
          </span>
          <Link
            href={`/portal/files?subscription=${sub.id}`}
            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
          >
            View Files
          </Link>
        </div>

        {/* Cancellation info or link */}
        {sub.status === "cancellation_pending" && sub.cancellationRequestedAt && (
          <div className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2 text-sm text-orange-700">
            Cancellation requested on{" "}
            {new Date(sub.cancellationRequestedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {sub.cancellationReason && (
              <span className="block text-xs mt-0.5 text-orange-600">
                Reason: {sub.cancellationReason.replace(/_/g, " ")}
              </span>
            )}
          </div>
        )}

        {sub.status === "active" && (
          <div className="pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-destructive px-0"
              onClick={() => setCancelOpen(true)}
            >
              Request Cancellation
            </Button>
          </div>
        )}
      </CardContent>

      <CancellationModal
        subscriptionId={sub.id}
        serviceName={sub.service?.name ?? `Subscription #${sub.id}`}
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onSuccess={() => onCancelled(sub.id)}
      />
    </Card>
  );
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "all">("active");

  useEffect(() => {
    fetch("/api/portal/subscriptions")
      .then((r) => r.json() as Promise<SubscriptionsData>)
      .then((d) => setSubscriptions(d.subscriptions ?? []))
      .catch((err) => console.error("[subscriptions] fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  function handleCancelled(id: number) {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "cancellation_pending" } : s
      )
    );
  }

  const filtered =
    filter === "active"
      ? subscriptions.filter((s) => s.status === "active" || s.status === "paused")
      : subscriptions;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Subscriptions</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your active services and billing details
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === "active"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-indigo-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All ({subscriptions.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg font-medium">No subscriptions found</p>
          <p className="text-sm mt-1">
            {filter === "active" ? "Switch to 'All' to see past subscriptions." : "Contact us at hello@bluuhq.com to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              onCancelled={handleCancelled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
