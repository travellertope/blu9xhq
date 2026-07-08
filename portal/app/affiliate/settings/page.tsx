"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const payoutSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("paypal"),
    paypalEmail: z.string().email("Enter a valid PayPal email"),
  }),
  z.object({
    method: z.literal("bank"),
    accountName: z.string().min(2, "Enter account name"),
    accountNumber: z.string().min(4, "Enter account number"),
    sortCode: z.string().optional(),
    bankName: z.string().min(2, "Enter bank name"),
  }),
  z.object({
    method: z.literal("stripe"),
    stripeEmail: z.string().email("Enter a valid email for Stripe Connect"),
  }),
]);
type PayoutFormData = z.infer<typeof payoutSchema>;

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [method, setMethod] = useState<"stripe" | "paypal" | "bank">("stripe");

  const { register, handleSubmit, formState: { errors } } = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: { method: "stripe" },
  });

  async function onSubmit(data: PayoutFormData) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/affiliates/payout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((body as any).error ?? "Failed to save payout details.");
      setMessage({ type: "success", text: "Payout details saved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your affiliate profile and payout preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-slate-500">Name</span>
            <span className="text-sm font-medium text-slate-800">{user?.name ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-slate-500">Email</span>
            <span className="text-sm font-medium text-slate-800">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-slate-500">Affiliate code</span>
            <span className="text-sm font-bold text-blue-700 tracking-wider">{user?.affiliateCode ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-500">Account status</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              user?.affiliateStatus === "active"
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              {user?.affiliateStatus ?? "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payout method */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payout method</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Preferred method</label>
              <div className="flex gap-2">
                {(["stripe", "paypal", "bank"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      method === m
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {m === "stripe" ? "Stripe" : m === "paypal" ? "PayPal" : "Bank transfer"}
                  </button>
                ))}
              </div>
            </div>

            <input type="hidden" {...register("method")} value={method} />

            {method === "stripe" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email for Stripe Connect</label>
                <input
                  {...register("stripeEmail" as any)}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {(errors as any).stripeEmail && <p className="text-xs text-destructive">{(errors as any).stripeEmail.message}</p>}
                <p className="text-xs text-slate-400">We&apos;ll send a Stripe Connect onboarding link to this email.</p>
              </div>
            )}

            {method === "paypal" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">PayPal email</label>
                <input
                  {...register("paypalEmail" as any)}
                  type="email"
                  placeholder="you@paypal.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {(errors as any).paypalEmail && <p className="text-xs text-destructive">{(errors as any).paypalEmail.message}</p>}
              </div>
            )}

            {method === "bank" && (
              <div className="space-y-3">
                {[
                  { field: "accountName", label: "Account name", placeholder: "Jane Smith" },
                  { field: "accountNumber", label: "Account number", placeholder: "12345678" },
                  { field: "sortCode", label: "Sort code / routing number (optional)", placeholder: "12-34-56" },
                  { field: "bankName", label: "Bank name", placeholder: "Barclays" },
                ].map(({ field, label, placeholder }) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">{label}</label>
                    <input
                      {...register(field as any)}
                      placeholder={placeholder}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    {(errors as any)[field] && <p className="text-xs text-destructive">{(errors as any)[field].message}</p>}
                  </div>
                ))}
              </div>
            )}

            {message && (
              <div className={`text-sm px-3 py-2.5 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              {saving ? "Saving…" : "Save payout details"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
