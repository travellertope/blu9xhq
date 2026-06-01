"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, Download, CreditCard } from "lucide-react";

interface PortalInvoice {
  id: number;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  issuedDate: string;
  dueDate: string;
  paidAt?: string;
  hasPdf: boolean;
  subscriptionName: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  sent:    { bg: "bg-blue-100",   text: "text-blue-800",  label: "Outstanding" },
  overdue: { bg: "bg-red-100",    text: "text-red-800",   label: "OVERDUE" },
  paid:    { bg: "bg-green-100",  text: "text-green-800", label: "Paid" },
  draft:   { bg: "bg-slate-100",  text: "text-slate-600", label: "Draft" },
  void:    { bg: "bg-slate-100",  text: "text-slate-400", label: "Void" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function formatAmount(currency: string, amount: number) {
  return currency + " " + (amount ?? 0).toLocaleString();
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"outstanding" | "all">("outstanding");

  useEffect(() => {
    fetch("/api/portal/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(id: number) {
    try {
      const res = await fetch("/api/portal/invoices/" + id + "/download");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { error?: string }).error ?? "Download failed");
        return;
      }
      const { signedUrl } = await res.json() as { signedUrl: string };
      window.open(signedUrl, "_blank");
    } catch {
      toast.error("Failed to download invoice");
    }
  }

  const outstanding = invoices.filter(
    (inv) => inv.status === "sent" || inv.status === "overdue"
  );
  const shown = tab === "outstanding" ? outstanding : invoices;
  const totalOutstanding = outstanding.reduce((sum, inv) => sum + (inv.total ?? 0), 0);
  const outstandingCurrency = outstanding[0]?.currency ?? "";

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
        <p className="text-sm text-slate-500">Your billing history and outstanding payments</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {(["outstanding", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors " +
              (tab === t
                ? "border-[#1875F2] text-[#1875F2]"
                : "border-transparent text-slate-500 hover:text-slate-700")
            }
          >
            {t === "outstanding" ? (
              <span className="flex items-center gap-1.5">
                Outstanding
                {outstanding.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                    {outstanding.length}
                  </span>
                )}
              </span>
            ) : (
              "All Invoices"
            )}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="mx-auto mb-3 opacity-40" size={40} />
          <p className="font-medium text-slate-600">
            {tab === "outstanding"
              ? "You have no outstanding invoices. You're all up to date!"
              : "No invoices yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Invoice #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Service</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Due Date</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {shown.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.subscriptionName || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatAmount(inv.currency, inv.total)}</td>
                    <td className={"px-4 py-3 " + (isOverdue(inv.dueDate) && inv.status !== "paid" ? "text-red-600 font-medium" : "text-slate-500")}>
                      {inv.dueDate}
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {(inv.status === "sent" || inv.status === "overdue") && (
                          <Link href={"/portal/invoices/" + inv.id} className="inline-flex items-center gap-1 text-xs font-medium bg-[#1875F2] hover:bg-[#1461CE] text-white px-3 py-1.5 rounded-md transition-colors">
                            <CreditCard size={12} />
                            Pay Now
                          </Link>
                        )}
                        {inv.hasPdf && (
                          <button onClick={() => handleDownload(inv.id)} className="text-slate-400 hover:text-[#1875F2] transition-colors p-1">
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {shown.map((inv) => (
              <div key={inv.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-800">{inv.invoiceNumber}</span>
                  <StatusBadge status={inv.status} />
                </div>
                {inv.subscriptionName && <p className="text-sm text-slate-500">{inv.subscriptionName}</p>}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{formatAmount(inv.currency, inv.total)}</p>
                    <p className={"text-xs " + (isOverdue(inv.dueDate) && inv.status !== "paid" ? "text-red-500" : "text-slate-400")}>Due {inv.dueDate}</p>
                  </div>
                  <div className="flex gap-2">
                    {(inv.status === "sent" || inv.status === "overdue") && (
                      <Link href={"/portal/invoices/" + inv.id} className="inline-flex items-center gap-1 text-xs font-medium bg-[#1875F2] hover:bg-[#1461CE] text-white px-3 py-1.5 rounded-md">
                        <CreditCard size={12} />
                        Pay
                      </Link>
                    )}
                    {inv.hasPdf && (
                      <button onClick={() => handleDownload(inv.id)} className="p-1.5 text-slate-400 hover:text-[#1875F2]">
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tab === "outstanding" && outstanding.length > 0 && (
            <div className="flex justify-end text-sm text-slate-600">
              Total outstanding:{" "}
              <span className="ml-1 font-bold text-slate-800">{formatAmount(outstandingCurrency, totalOutstanding)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
