"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  amount: number | string;
}

interface ClientOption {
  id: number;
  name: string;
  company?: string;
}

const CURRENCIES = ["USD", "GBP", "EUR", "GHS", "NGN"];

export default function NewInvoicePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const role = user?.bluuhqRole ?? "viewer";

  // Permission check
  useEffect(() => {
    if (status === "authenticated" && role !== "super_admin" && role !== "billing_manager") {
      router.replace("/admin/invoices");
    }
  }, [status, role, router]);

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", amount: "" }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/admin/clients?per_page=100");
        if (!res.ok) return;
        const data = await res.json();
        setClients(
          (data.clients ?? []).map((c: any) => ({
            id: c.id,
            name: c.acf?.contact_name || c.title?.rendered,
            company: c.acf?.company_name,
          }))
        );
      } catch {
        // non-fatal
      }
    }
    loadClients();
  }, []);

  const total = lineItems.reduce((sum, item) => {
    const amt = parseFloat(String(item.amount)) || 0;
    return sum + amt;
  }, 0);

  const addLineItem = () => setLineItems((prev) => [...prev, { description: "", amount: "" }]);

  const removeLineItem = (idx: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLineItem = (idx: number, field: keyof LineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    if (!clientId) { toast.error("Please select a client"); return; }
    if (!dueDate) { toast.error("Please set a due date"); return; }
    if (lineItems.length === 0) { toast.error("Add at least one line item"); return; }
    if (lineItems.some((li) => !li.description || !li.amount)) {
      toast.error("Fill in all line items");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: parseInt(clientId, 10),
          lineItems: lineItems.map((li) => ({
            description: li.description,
            amount: parseFloat(String(li.amount)) || 0,
          })),
          currency,
          dueDate,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create invoice");
      }

      const data = await res.json();
      toast.success(`Invoice ${data.invoice.number} created`);
      router.push(`/admin/invoices/${data.invoice.id}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-slate-900">New Invoice</h1>
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
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select client…" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}{c.company ? ` — ${c.company}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          {lineItems.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="flex-1">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => updateLineItem(idx, "amount", e.target.value)}
                />
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
            </div>
          ))}

          <div className="flex justify-end border-t pt-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-900">
                {currency} {total.toLocaleString()}
              </p>
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

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={saving}>
        {saving ? "Saving…" : "Save as Draft"}
      </Button>
    </div>
  );
}
