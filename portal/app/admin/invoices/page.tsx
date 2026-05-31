"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Send, CheckCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";

interface InvoiceRow {
  id: number;
  number: string;
  clientId: number;
  total: number;
  currency: string;
  status: string;
  dueDate: string;
  issuedDate: string;
  paidAt?: string;
  notes?: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft:   "bg-slate-100 text-slate-600",
  sent:    "bg-blue-100 text-blue-700",
  paid:    "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  void:    "bg-slate-100 text-slate-300",
};

const STATUSES = ["draft", "sent", "paid", "overdue", "void"];

interface MarkPaidModalProps {
  invoiceId: number;
  invoiceNumber: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function MarkPaidModal({ invoiceId, invoiceNumber, open, onClose, onSuccess }: MarkPaidModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, paidAt, reference: reference || undefined }),
      });
      if (!res.ok) throw new Error("Failed to mark as paid");
      toast.success(`Invoice ${invoiceNumber} marked as paid`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to mark invoice as paid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Invoice as Paid — {invoiceNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment Date</Label>
            <Input
              type="date"
              className="mt-1"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
            />
          </div>
          <div>
            <Label>Reference / Transaction ID (optional)</Label>
            <Input
              className="mt-1"
              placeholder="e.g. ch_1234..."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : "Confirm Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [markPaidInvoice, setMarkPaidInvoice] = useState<InvoiceRow | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/invoices?${params}`);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      setInvoices(data.invoices ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSend = async (inv: InvoiceRow) => {
    try {
      const res = await fetch(`/api/admin/invoices/${inv.id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send invoice");
      toast.success(`Invoice ${inv.number} sent to client`);
      fetchInvoices();
    } catch {
      toast.error("Failed to send invoice");
    }
  };

  const filteredInvoices = search
    ? invoices.filter((inv) =>
        inv.number.toLowerCase().includes(search.toLowerCase())
      )
    : invoices;

  // Summary stats
  const outstanding = invoices.filter((i) => i.status === "sent");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const outstandingTotal = outstanding.reduce((s, i) => s + (i.total ?? 0), 0);
  const overdueTotal = overdue.reduce((s, i) => s + (i.total ?? 0), 0);

  const now = new Date();
  const thisMonthPaid = invoices.filter((i) => {
    if (i.status !== "paid" || !i.paidAt) return false;
    const d = new Date(i.paidAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const collectedThisMonth = thisMonthPaid.reduce((s, i) => s + (i.total ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <PermissionGuard permission="create_invoices">
          <Button asChild>
            <a href="/admin/invoices/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Invoice
            </a>
          </Button>
        </PermissionGuard>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Outstanding</p>
            <p className="text-xl font-bold text-slate-900">{outstanding.length}</p>
            <p className="text-xs text-slate-400">${outstandingTotal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Overdue</p>
            <p className="text-xl font-bold text-red-600">{overdue.length}</p>
            <p className="text-xs text-slate-400">${overdueTotal.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Collected This Month</p>
            <p className="text-xl font-bold text-green-600">${collectedThisMonth.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Search invoice number…"
          className="max-w-xs h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Invoice #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">Loading…</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">No invoices found</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{inv.number}</td>
                    <td className="px-4 py-3 text-slate-600">Client #{inv.clientId}</td>
                    <td className="px-4 py-3 font-medium">
                      {inv.currency} {inv.total?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {inv.dueDate ? format(parseISO(inv.dueDate), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[inv.status] ?? STATUS_COLORS.draft}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                          <a href={`/admin/invoices/${inv.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <PermissionGuard permission="create_invoices">
                          {inv.status === "draft" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleSend(inv)}
                            >
                              <Send className="h-3.5 w-3.5 mr-1" />
                              Send
                            </Button>
                          )}
                        </PermissionGuard>
                        <PermissionGuard permission="mark_invoices_paid">
                          {(inv.status === "sent" || inv.status === "overdue") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-green-600"
                              onClick={() => setMarkPaidInvoice(inv)}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Paid
                            </Button>
                          )}
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{total} invoices</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 py-1">Page {page} of {totalPages}</span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mark Paid Modal */}
      {markPaidInvoice && (
        <MarkPaidModal
          invoiceId={markPaidInvoice.id}
          invoiceNumber={markPaidInvoice.number}
          open={!!markPaidInvoice}
          onClose={() => setMarkPaidInvoice(null)}
          onSuccess={fetchInvoices}
        />
      )}
    </div>
  );
}
