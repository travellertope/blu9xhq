"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Settings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  address: string;
  fromEmailName: string;
}

interface PaymentSettings {
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  paystackSecretKey: string;
  paystackPublicKey: string;
  preferredGateway: string;
}

type Tab = "general" | "bank" | "payments" | "security";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<Settings>({
    bankName: "",
    accountName: "",
    accountNumber: "",
    sortCode: "",
    address: "",
    fromEmailName: "",
  });
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripeSecretKey: "",
    stripePublishableKey: "",
    stripeWebhookSecret: "",
    paystackSecretKey: "",
    paystackPublicKey: "",
    preferredGateway: "auto",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Tab | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [tenantPlan, setTenantPlan] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/bank-details")
      .then((r) => r.json())
      .then((d) => setSettings((prev) => ({ ...prev, ...(d as Partial<Settings>) })))
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/admin/settings/payment-gateways")
      .then((r) => r.json())
      .then((d) => setPaymentSettings((prev) => ({ ...prev, ...(d as Partial<PaymentSettings>) })))
      .catch(() => toast.error("Failed to load payment settings"));
  }, []);

  useEffect(() => {
    fetch("/api/admin/tenants")
      .then((r) => r.json())
      .then((d) => {
        const tenants = Array.isArray(d) ? d : d.tenants ?? [];
        const current = tenants.find((t: any) => t.isCurrent);
        if (current) {
          setTenantId(current.id);
        }
      })
      .catch(() => {});
    fetch("/api/admin/tenant-plan")
      .then((r) => r.json())
      .then((d) => { if (d.plan) setTenantPlan(d.plan); })
      .catch(() => {});
  }, []);

  function update(key: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updatePayment(key: keyof PaymentSettings, value: string) {
    setPaymentSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(section: Tab) {
    setSaving(section);

    if (section === "payments") {
      try {
        const res = await fetch("/api/admin/settings/payment-gateways", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentSettings),
        });
        if (!res.ok) throw new Error("Save failed");
        toast.success("Payment settings saved");
      } catch {
        toast.error("Failed to save payment settings");
      } finally {
        setSaving(null);
      }
      return;
    }

    const payload: Partial<Settings> =
      section === "bank"
        ? {
            bankName: settings.bankName,
            accountName: settings.accountName,
            accountNumber: settings.accountNumber,
            sortCode: settings.sortCode,
          }
        : {
            address: settings.address,
            fromEmailName: settings.fromEmailName,
          };

    try {
      const res = await fetch("/api/admin/settings/bank-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure BluuHQ portal options</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {(["general", "bank", "payments", "security"] as const)
          .filter((t) => t !== "payments" || (tenantPlan && tenantPlan !== "free"))
          .map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors " +
              (tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700")
            }
          >
            {t === "general" ? "General" : t === "bank" ? "Bank Details" : t === "payments" ? "Payments" : "Security"}
          </button>
        ))}
        <Link
          href="/admin/settings/team"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-colors"
        >
          Team
        </Link>
        <Link
          href="/admin/settings/branding"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-colors"
        >
          Branding
        </Link>
      </div>

      {/* General tab */}
      {tab === "general" && (
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Portal Base URL</label>
            <input
              type="text"
              value={process.env.NEXT_PUBLIC_APP_URL ?? "(not set)"}
              readOnly
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-default"
            />
            <p className="text-xs text-slate-400">Set via NEXT_PUBLIC_APP_URL environment variable</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">From Email Name</label>
            <input
              type="text"
              value={settings.fromEmailName}
              onChange={(e) => update("fromEmailName", e.target.value)}
              placeholder="BluuHQ"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400">Sender name shown in client emails</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Business Address</label>
            <textarea
              value={settings.address}
              onChange={(e) => update("address", e.target.value)}
              rows={3}
              placeholder="123 Example St, City, Country"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400">Shown on invoice PDFs</p>
          </div>

          <button
            onClick={() => handleSave("general")}
            disabled={saving === "general"}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md px-5 py-2 text-sm font-medium transition-colors"
          >
            {saving === "general" ? "Saving…" : "Save General Settings"}
          </button>
        </div>
      )}

      {/* Bank Details tab */}
      {tab === "bank" && (
        <div className="space-y-5">
          <p className="text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            These details are shown to clients who pay via bank transfer.
          </p>

          {[
            { key: "bankName" as const, label: "Bank Name", placeholder: "e.g. Barclays, GTBank" },
            { key: "accountName" as const, label: "Account Name", placeholder: "BluuHQ Ltd" },
            { key: "accountNumber" as const, label: "Account Number", placeholder: "12345678" },
            { key: "sortCode" as const, label: "Sort Code / Routing Number", placeholder: "00-00-00" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium text-slate-700">{label}</label>
              <input
                type="text"
                value={settings[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}

          <button
            onClick={() => handleSave("bank")}
            disabled={saving === "bank"}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md px-5 py-2 text-sm font-medium transition-colors"
          >
            {saving === "bank" ? "Saving…" : "Save Bank Details"}
          </button>
        </div>
      )}

      {/* Payments tab */}
      {tab === "payments" && (
        <div className="space-y-5">
          <p className="text-sm text-slate-500 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
            Configure payment gateways to accept online payments for invoices.
          </p>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Preferred Gateway</label>
            <select
              value={paymentSettings.preferredGateway}
              onChange={(e) => updatePayment("preferredGateway", e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="auto">Auto</option>
              <option value="stripe">Stripe</option>
              <option value="paystack">Paystack</option>
            </select>
            {paymentSettings.preferredGateway === "auto" && (
              <p className="text-xs text-slate-400">
                Automatically selects Paystack for NGN/GHS currencies, Stripe for others
              </p>
            )}
          </div>

          {/* Stripe */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-slate-800">Stripe</h3>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Publishable Key</label>
              <input
                type="text"
                value={paymentSettings.stripePublishableKey}
                onChange={(e) => updatePayment("stripePublishableKey", e.target.value)}
                placeholder="pk_live_..."
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Secret Key</label>
              <input
                type="password"
                value={paymentSettings.stripeSecretKey}
                onChange={(e) => updatePayment("stripeSecretKey", e.target.value)}
                placeholder="sk_live_..."
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Webhook Secret</label>
              <input
                type="password"
                value={paymentSettings.stripeWebhookSecret}
                onChange={(e) => updatePayment("stripeWebhookSecret", e.target.value)}
                placeholder="whsec_..."
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <p className="text-xs text-slate-400">
              Set your Stripe webhook URL to:{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-xs select-all">
                https://crm.bluuhq.com/api/webhooks/tenant-stripe/{tenantId || "loading..."}
              </code>
            </p>
          </div>

          {/* Paystack */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-slate-800">Paystack</h3>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Public Key</label>
              <input
                type="text"
                value={paymentSettings.paystackPublicKey}
                onChange={(e) => updatePayment("paystackPublicKey", e.target.value)}
                placeholder="pk_live_..."
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Secret Key</label>
              <input
                type="password"
                value={paymentSettings.paystackSecretKey}
                onChange={(e) => updatePayment("paystackSecretKey", e.target.value)}
                placeholder="sk_live_..."
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <p className="text-xs text-slate-400">
              Set your Paystack webhook URL to:{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-xs select-all">
                https://crm.bluuhq.com/api/webhooks/tenant-paystack/{tenantId || "loading..."}
              </code>
            </p>
          </div>

          <button
            onClick={() => handleSave("payments")}
            disabled={saving === "payments"}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md px-5 py-2 text-sm font-medium transition-colors"
          >
            {saving === "payments" ? "Saving…" : "Save Payment Settings"}
          </button>
        </div>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div className="space-y-5">
          <p className="text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Change the password for your admin account.
          </p>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={async () => {
              if (!currentPassword) {
                toast.error("Please enter your current password");
                return;
              }
              if (newPassword.length < 8) {
                toast.error("New password must be at least 8 characters");
                return;
              }
              if (newPassword !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
              }
              setSaving("security");
              try {
                const supabase = createSupabaseBrowserClient();
                // Re-authenticate with current password to verify identity
                const { data: { user } } = await supabase.auth.getUser();
                if (!user?.email) throw new Error("Could not verify current user");
                const { error: signInErr } = await supabase.auth.signInWithPassword({
                  email: user.email,
                  password: currentPassword,
                });
                if (signInErr) {
                  toast.error("Current password is incorrect");
                  setSaving(null);
                  return;
                }
                const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
                if (updateErr) throw updateErr;
                toast.success("Password updated successfully");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              } catch (err: any) {
                toast.error(err?.message || "Failed to update password");
              } finally {
                setSaving(null);
              }
            }}
            disabled={saving === "security"}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md px-5 py-2 text-sm font-medium transition-colors"
          >
            {saving === "security" ? "Updating…" : "Update Password"}
          </button>
        </div>
      )}
    </div>
  );
}
