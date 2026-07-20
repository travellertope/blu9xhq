"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  SidebarInner,
  IconMenu,
  IconUser,
  IconLogOut,
} from "./sidebar";

function UserMenu({ email }: { email?: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="flex items-center justify-center h-9 w-9 rounded-full bg-bg-soft text-ink-soft hover:bg-blue-soft hover:text-blue-dark transition-colors"
      >
        <IconUser className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-line bg-white shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-line">
            <p className="text-sm text-ink truncate">{email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-ink-soft hover:bg-bg-soft hover:text-ink"
          >
            <IconLogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function DashboardShell({
  email,
  children,
}: {
  email?: string | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-soft">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line">
        <SidebarInner />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <SidebarInner onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-2 text-ink"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <span className="lg:hidden font-extrabold text-ink">BluuAudit</span>
          <div className="ml-auto">
            <UserMenu email={email} />
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-auto px-4 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
