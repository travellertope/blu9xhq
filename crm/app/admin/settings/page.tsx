"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface Settings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  address: string;
  fromEmailName: string;
}

type Tab = "general" | "bank";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Tab | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/bank-details")
      .then((r) => r.json())
      .then((d) => setSettings((prev) => ({ ...prev, ...(d as Partial<Settings>) })))
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  function update(key: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(section: Tab) {
    setSaving(section);
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
        {(["general", "bank"] as const).map((t) => (
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
            {t === "general" ? "General" : "Bank Details"}
          </button>
        ))}
        <Link
          href="/admin/settings/team"
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-colors"
        >
          Team
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
    </div>
  );
}
