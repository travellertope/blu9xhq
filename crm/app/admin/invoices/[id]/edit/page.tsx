"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  discount: number | string;
  amount?: number;
}

const CURRENCIES = ["USD", "GBP", "EUR", "GHS", "NGN"];

function lineAmount(item: LineItem): number {
  const qty = parseFloat(String(item.quantity)) || 0;
  const price = parseFloat(String(item.unitPrice)) || 0;
  const disc = parseFloat(String(item.discount)) || 0;
  return Math.max(qty * price - disc, 0);
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: "", discount: 0 },
  ]);
  const [taxRate, setTaxRate] = useState<number | string>(0);
  const [overallDiscount, setOverallDiscount] = useState<number | string>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/invoices/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        const inv = data.invoice;
        if (inv.status !== "draft") {
          toast.error("Only draft invoices can be edited");
          router.replace(`/admin/invoices/${id}`);
          return;
        }
        setInvoiceNumber(inv.number ?? "");
        setCurrency(inv.currency ?? "USD");
        setDueDate(inv.dueDate ?? "");
        setNotes(inv.notes ?? "");
        setTaxRate(inv.taxRate ?? 0);
        setOverallDiscount(inv.discount ?? 0);
        setLineItems(
          inv.lineItems?.length
            ? inv.lineItems.map((li: any) => ({
                description: li.description ?? "",
                quantity: li.quantity ?? 1,
                unitPrice: li.unitPrice ?? li.amount ?? 0,
                discount: li.discount ?? 0,
              }))
            : [{ description: "", quantity: 1, unitPrice: "", discount: 0 }]
        );
      } catch {
        toast.error("Invoice not found");
        router.replace("/admin/invoices");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const itemsSubtotal = lineItems.reduce((sum, item) => sum + lineAmount(item), 0);
  const discountVal = parseFloat(String(overallDiscount)) || 0;
  const subtotalAfterDiscount = Math.max(itemsSubtotal - discountVal, 0);
  const taxRateVal = parseFloat(String(taxRate)) || 0;
  const taxAmount = subtotalAfterDiscount * (taxRateVal / 100);
  const total = subtotalAfterDiscount + taxAmount;

  const addLineItem = () =>
    setLineItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: "", discount: 0 }]);

  const removeLineItem = (idx: number) =>
    setLineItems((prev) => prev.filter((_, i) => i !== idx));

  const updateLineItem = (idx: number, field: keyof LineItem, value: string) =>
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );

  const handleSave = async () => {
    if (!dueDate) { toast.error("Please set a due date"); return; }
    if (lineItems.length === 0) { toast.error("Add at least one line item"); return; }
    if (lineItems.some((li) => !li.description || !li.unitPrice)) {
      toast.error("Fill in all line items");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: lineItems.map((li) => ({
            description: li.description,
            quantity: parseFloat(String(li.quantity)) || 1,
            unitPrice: parseFloat(String(li.unitPrice)) || 0,
            discount: parseFloat(String(li.discount)) || 0,
            amount: lineAmount(li),
          })),
          currency,
          dueDate,
          notes: notes || undefined,
          taxRate: taxRateVal || undefined,
          discount: discountVal || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to save invoice");
      }

      toast.success("Invoice updated");
      router.push(`/admin/invoices/${id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400">Loading invoice…</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-slate-900">Edit Invoice {invoiceNumber}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                className="mt-1"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
              Line Items
            </CardTitle>
            <Button size="sm" variant="outline" onClick={addLineItem}>
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 text-xs font-medium text-slate-500 px-1">
            <span className="flex-1">Description</span>
            <span className="w-16 text-center">Qty</span>
            <span className="w-24 text-center">Unit Price</span>
            <span className="w-20 text-center">Discount</span>
            <span className="w-24 text-right">Amount</span>
            <span className="w-9" />
          </div>

          {lineItems.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                />
              </div>
              <div className="w-16">
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(idx, "quantity", e.target.value)}
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(idx, "unitPrice", e.target.value)}
                />
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.discount}
                  onChange={(e) => updateLineItem(idx, "discount", e.target.value)}
                />
              </div>
              <div className="w-24 flex items-center justify-end h-9 text-sm font-medium text-slate-700">
                {lineAmount(item).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              {lineItems.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 text-red-400"
                  onClick={() => removeLineItem(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {lineItems.length <= 1 && <div className="w-9" />}
            </div>
          ))}

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Items Subtotal</span>
              <span className="font-medium">{currency} {itemsSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Overall Discount</span>
                <Input
                  type="number"
                  min="0"
                  className="w-24 h-7 text-xs"
                  value={overallDiscount}
                  onChange={(e) => setOverallDiscount(e.target.value)}
                />
              </div>
              {discountVal > 0 && (
                <span className="text-red-500 font-medium">
                  -{currency} {discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Tax Rate (%)</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-20 h-7 text-xs"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>
              {taxAmount > 0 && (
                <span className="font-medium">
                  +{currency} {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-xl font-bold text-slate-900">
                {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <Label>Notes (optional)</Label>
          <Textarea
            className="mt-1"
            placeholder="Payment instructions, terms, etc."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
