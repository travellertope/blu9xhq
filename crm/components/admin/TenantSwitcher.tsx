"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

interface TenantOption {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  role: string;
  isCurrent: boolean;
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TenantSwitcher() {
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/tenants")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTenants(data);
        else if (Array.isArray(data.tenants)) setTenants(data.tenants);
      })
      .catch(() => {});
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = tenants.find((t) => t.isCurrent);

  if (tenants.length === 0) return null;

  async function handleSwitch(tenantId: string) {
    setSwitching(true);
    try {
      await fetch("/api/admin/tenants/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      window.location.href = "/admin";
    } catch {
      setSwitching(false);
    }
  }

  const showDropdown = tenants.length > 1;

  return (
    <div ref={ref} className="relative border-b">
      <button
        type="button"
        onClick={() => showDropdown && setOpen((o) => !o)}
        className={
          "flex w-full items-center gap-2 px-5 py-2.5 text-left text-sm transition-colors " +
          (showDropdown
            ? "hover:bg-slate-50 cursor-pointer"
            : "cursor-default")
        }
        disabled={switching}
      >
        <span className="flex-1 truncate font-medium text-slate-700">
          {current?.name ?? "Loading..."}
        </span>
        {showDropdown && (
          <ChevronDown
            className={
              "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform " +
              (open ? "rotate-180" : "")
            }
          />
        )}
      </button>

      {open && (
        <div className="absolute left-2 right-2 top-full z-50 mt-1 rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="py-1">
            {tenants.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (!t.isCurrent) handleSwitch(t.id);
                  else setOpen(false);
                }}
                disabled={switching}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
              >
                <span className="w-4 shrink-0">
                  {t.isCurrent && (
                    <Check className="h-3.5 w-3.5 text-indigo-600" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-medium text-slate-700">
                    {t.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {formatRole(t.role)}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="border-t">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create New Tenant
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
