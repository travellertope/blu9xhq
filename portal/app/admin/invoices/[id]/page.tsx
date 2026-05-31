"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { ArrowLeft, Send, CheckCircle, FileDown, Ban } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Invoice {
  id: number;
  number: string;
  clientId: number;
  total: number;
  currency: string;
  status: string;
  dueDate: string;
  issuedDate: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  pdfUrl?: string;
  lineItems: { description: string; amount: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  draft:   "bg-slate-100 text-slate-600",
  sent:    "bg-blue-100 text-blue-700",
  paid:    "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  void:    "bg-slate-100 text-slate-300",
};

interface MarkPaidModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { paymentMethod: string; paidAt: string; reference?: string }) => void;
  loading: boolean;
}

function MarkPaidModal({ open, onClose, onConfirm, loading }: MarkPaidModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Invoice as Paid</DialogTitle>
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
            <Label>Reference (optional)</Label>
            <Input
              className="mt-1"
              placeholder="Transaction ID"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => onConfirm({ paymentMethod, paidAt, reference: reference || undefined })}
            disabled={loading}
          >
            {loading ? "Saving…" : "Confirm Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [voiding, setVoiding] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/invoices/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setInvoice(data.invoice);
      } catch {
        toast.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSend = async () => {
    if (!invoice) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send");
      toast.success("Invoice sent to client");
      setInvoice((prev) => prev ? { ...prev, status: "sent" } : prev);
    } catch {
      toast.error("Failed to send invoice");
    } finally {
      setSending(false);
    }
  };

  const handleMarkPaid = async (data: { paymentMethod: string; paidAt: string; reference?: string }) => {
    setMarkPaidLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to mark as paid");
      toast.success("Invoice marked as paid");
      setInvoice((prev) => prev ? { ...prev, status: "paid", paidAt: data.paidAt, paymentMethod: data.paymentMethod } : prev);
      setMarkPaidOpen(false);
    } catch {
      toast.error("Failed to mark invoice as paid");
    } finally {
      setMarkPaidLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}/pdf`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice?.number ?? id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleVoid = async () => {
    if (!confirm("Are you sure you want to void this invoice?")) return;
    setVoiding(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "void" }),
      });
      if (!res.ok) throw new Error("Failed to void invoice");
      toast.success("Invoice voided");
      setInvoice((prev) => prev ? { ...prev, status: "void" } : prev);
    } catch {
      toast.error("Failed to void invoice");
    } finally {
      setVoiding(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400">Loading invoice…</div>;
  }

  if (!invoice) {
    return <div className="py-16 text-center text-slate-400">Invoice not found</div>;
  }

  const canSend = invoice.status === "draft";
  const canMarkPaid = invoice.status === "sent" || invoice.status === "overdue";
  const canVoid = invoice.status !== "void" && invoice.status !== "paid";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-slate-900">{invoice.number}</h1>
        <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[invoice.status] ?? STATUS_COLORS.draft}`}>
          {invoice.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <PermissionGuard permission="create_invoices">
          {canSend && (
            <Button size="sm" onClick={handleSend} disabled={sending}>
              <Send className="h-4 w-4 mr-1.5" />
              {sending ? "Sending…" : "Send to Client"}
            </Button>
          )}
        </PermissionGuard>

        <PermissionGuard permission="mark_invoices_paid">
          {canMarkPaid && (
            <Button size="sm" variant="outline" onClick={() => setMarkPaidOpen(true)}>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Mark as Paid
            </Button>
          )}
        </PermissionGuard>

        <Button size="sm" variant="outline" onClick={handleDownloadPdf} disabled={pdfLoading}>
          <FileDown className="h-4 w-4 mr-1.5" />
          {pdfLoading ? "Generating…" : "Download PDF"}
        </Button>

        <PermissionGuard permission="create_invoices">
          {canVoid && (
            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={handleVoid} disabled={voiding}>
              <Ban className="h-4 w-4 mr-1.5" />
              {voiding ? "Voiding…" : "Void Invoice"}
            </Button>
          )}
        </PermissionGuard>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Invoice Number</p>
              <p className="font-medium text-slate-900">{invoice.number}</p>
            </div>
            <div>
              <p className="text-slate-500">Client</p>
              <a href={`/admin/clients/${invoice.clientId}`} className="font-medium text-indigo-600 hover:underline">
                Client #{invoice.clientId}
              </a>
            </div>
            <div>
              <p className="text-slate-500">Issue Date</p>
              <p className="font-medium">{invoice.issuedDate ? format(parseISO(invoice.issuedDate), "MMM d, yyyy") : "—"}</p>
            </div>
            <div>
              <p className="text-slate-500">Due Date</p>
              <p className="font-medium">{invoice.dueDate ? format(parseISO(invoice.dueDate), "MMM d, yyyy") : "—"}</p>
            </div>
            {invoice.paidAt && (
              <div>
                <p className="text-slate-500">Paid On</p>
                <p className="font-medium text-green-600">{format(parseISO(invoice.paidAt), "MMM d, yyyy")}</p>
              </div>
            )}
            {invoice.paymentMethod && (
              <div>
                <p className="text-slate-500">Payment Method</p>
                <p className="font-medium">{invoice.paymentMethod.replace("_", " ")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Line Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoice.lineItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <span className="text-slate-700">{item.description}</span>
                <span className="font-medium">{invoice.currency} {item.amount?.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm pt-2 font-bold">
              <span>Total</span>
              <span className="text-lg">{invoice.currency} {invoice.total?.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      <MarkPaidModal
        open={markPaidOpen}
        onClose={() => setMarkPaidOpen(false)}
        onConfirm={handleMarkPaid}
        loading={markPaidLoading}
      />
    </div>
  );
}
