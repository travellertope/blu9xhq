"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Client { id: number; name: string; }
interface Service { id: number; name: string; basePrice?: number; currency?: string; billingCycle?: string; }

const CURRENCIES  = ["USD", "EUR", "GBP", "NGN", "GHS", "ZAR", "CAD", "AUD"];
const BILLING_CYCLES: { value: string; label: string }[] = [
  { value: "monthly",   label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual",    label: "Annual" },
  { value: "one_time",  label: "One-time" },
];

function todayStr() { return new Date().toISOString().split("T")[0]; }

function calcNextBillingDate(start: string, cycle: string): string {
  const d = new Date(start);
  if (cycle === "monthly")   d.setMonth(d.getMonth() + 1);
  else if (cycle === "quarterly") d.setMonth(d.getMonth() + 3);
  else if (cycle === "annual")    d.setFullYear(d.getFullYear() + 1);
  else return "";
  return d.toISOString().split("T")[0];
}

export default function NewSubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledClientId = searchParams.get("clientId") ?? "";

  const [clients,  setClients]  = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  const [clientId,       setClientId]       = useState(prefilledClientId);
  const [serviceId,      setServiceId]      = useState("");
  const [status,         setStatus]         = useState("active");
  const [amount,         setAmount]         = useState("");
  const [currency,       setCurrency]       = useState("USD");
  const [billingCycle,   setBillingCycle]   = useState("monthly");
  const [startDate,      setStartDate]      = useState(todayStr());
  const [nextBillingDate, setNextBillingDate] = useState(() => calcNextBillingDate(todayStr(), "monthly"));
  const [notes,          setNotes]          = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/clients?per_page=100").then(r => r.json()),
      fetch("/api/admin/services?per_page=100").then(r => r.json()),
    ]).then(([cd, sd]) => {
      const clientList: Client[] = (cd.clients ?? cd.items ?? []).map((c: any) => ({
        id:   c.id,
        name: c.acf?.company_name || c.acf?.contact_name || c.title?.rendered || `Client #${c.id}`,
      }));
      const serviceList: Service[] = (sd.services ?? sd.items ?? []).map((s: any) => ({
        id:          s.id,
        name:        s.title?.rendered?.replace(/<[^>]+>/g, "") || `Service #${s.id}`,
        basePrice:   s.acf?.base_price,
        currency:    s.acf?.currency,
        billingCycle: s.acf?.billing_cycle,
      }));
      setClients(clientList);
      setServices(serviceList);
    }).catch(() => toast.error("Failed to load data")).finally(() => setLoading(false));
  }, []);

  function onServiceChange(id: string) {
    setServiceId(id);
    const svc = services.find(s => String(s.id) === id);
    if (svc) {
      if (svc.basePrice != null) setAmount(String(svc.basePrice));
      if (svc.currency)          setCurrency(svc.currency);
      if (svc.billingCycle)      setBillingCycle(svc.billingCycle);
    }
  }

  function onStartDateChange(val: string) {
    setStartDate(val);
    setNextBillingDate(calcNextBillingDate(val, billingCycle));
  }

  function onBillingCycleChange(val: string) {
    setBillingCycle(val);
    setNextBillingDate(calcNextBillingDate(startDate, val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !serviceId || !amount) {
      toast.error("Client, service, and amount are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId:       parseInt(clientId, 10),
          serviceId:      parseInt(serviceId, 10),
          status,
          amount:         parseFloat(amount),
          currency,
          billingCycle,
          startDate:      startDate || undefined,
          nextBillingDate: billingCycle !== "one_time" ? (nextBillingDate || undefined) : undefined,
          notes:          notes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create");
      toast.success("Service assigned successfully");
      router.push(clientId ? `/admin/clients/${clientId}` : "/admin/subscriptions");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link
          href={prefilledClientId ? `/admin/clients/${prefilledClientId}` : "/admin/subscriptions"}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {prefilledClientId ? "Back to client" : "Back to subscriptions"}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assign Service</h1>
        <p className="text-sm text-slate-500 mt-0.5">Link a service to a client and set billing terms</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Assignment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="client">Client <span className="text-red-500">*</span></Label>
                <Select value={clientId} onValueChange={setClientId} required>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select client…" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service">Service <span className="text-red-500">*</span></Label>
                <Select value={serviceId} onValueChange={onServiceChange} required>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select service…" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {services.length === 0 && (
                  <p className="text-xs text-slate-400">
                    No services found.{" "}
                    <Link href="/admin/services" className="text-indigo-600 hover:underline">
                      Add services first
                    </Link>
                    .
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Billing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="billing-cycle">Billing Cycle</Label>
                <Select value={billingCycle} onValueChange={onBillingCycleChange}>
                  <SelectTrigger id="billing-cycle"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BILLING_CYCLES.map(b => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={e => onStartDateChange(e.target.value)}
                  />
                </div>
                {billingCycle !== "one_time" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="next-billing">Next Billing Date</Label>
                    <Input
                      id="next-billing"
                      type="date"
                      value={nextBillingDate}
                      onChange={e => setNextBillingDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Notes <span className="text-slate-400 font-normal text-sm">(internal)</span></CardTitle></CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any internal notes about this subscription…"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving…</> : "Assign Service"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
