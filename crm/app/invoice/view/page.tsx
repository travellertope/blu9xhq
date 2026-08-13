"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface LineItem {
  description: string;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  status: string;
  total: number;
  subtotal: number;
  taxRate: number | null;
  taxAmount: number | null;
  currency: string;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
  notes: string | null;
  lineItems: LineItem[];
  clientName: string;
  clientCompany: string;
  tenantName: string;
  tenantLogo: string | null;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    paid:    { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle, label: "Paid" },
    sent:    { bg: "bg-blue-50",  text: "text-blue-700",  icon: Clock,       label: "Awaiting Payment" },
    overdue: { bg: "bg-red-50",   text: "text-red-700",   icon: AlertCircle, label: "Overdue" },
    draft:   { bg: "bg-gray-50",  text: "text-gray-600",  icon: Clock,       label: "Draft" },
    void:    { bg: "bg-gray-50",  text: "text-gray-500",  icon: AlertCircle, label: "Void" },
  };
  const s = map[status] ?? map.draft;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${s.bg} ${s.text}`}>
      <Icon className="h-4 w-4" />
      {s.label}
    </span>
  );
}

export default function PublicInvoiceViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading invoice…</p>
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  );
}

function InvoiceContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Invalid invoice link.");
      setLoading(false);
      return;
    }
    fetch(`/api/invoice/view?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load invoice");
        }
        return res.json();
      })
      .then(setInvoice)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading invoice…</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Invoice</h1>
          <p className="text-gray-500">{error || "Invoice not found."}</p>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => `${invoice.currency} ${n.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              {invoice.tenantLogo ? (
                <img src={invoice.tenantLogo} alt={invoice.tenantName} className="h-10 mb-2" />
              ) : (
                <h2 className="text-xl font-bold text-gray-900">{invoice.tenantName}</h2>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Invoice</p>
              <p className="text-lg font-bold text-gray-900">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Status + Meta */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <StatusBadge status={invoice.status} />
            {invoice.status === "paid" && invoice.paidDate && (
              <p className="text-sm text-green-600">Paid on {formatDate(invoice.paidDate)}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 mb-0.5">Bill To</p>
              <p className="font-medium text-gray-900">{invoice.clientName}</p>
              {invoice.clientCompany && invoice.clientCompany !== invoice.clientName && (
                <p className="text-gray-600">{invoice.clientCompany}</p>
              )}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-gray-500 mb-0.5">Issued</p>
                <p className="text-gray-900">{formatDate(invoice.issuedDate)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-8 py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Description</th>
                <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">{item.description}</td>
                  <td className="py-3 text-right text-gray-900">{fmt(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 space-y-2">
            {invoice.taxAmount != null && invoice.taxAmount > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{fmt(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax{invoice.taxRate ? ` (${invoice.taxRate}%)` : ""}</span>
                  <span>{fmt(invoice.taxAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-base font-bold text-gray-900">{fmt(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-8 pb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-gray-600 mb-1">Notes</p>
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            {invoice.tenantName} &middot; Contact us with any questions about this invoice.
          </p>
        </div>
      </div>
    </div>
  );
}
