"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortalNavProps {
  firstName: string;
}

interface MeData {
  unpaidInvoiceCount?: number;
}

const NAV_LINKS = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/subscriptions", label: "Subscriptions" },
  { href: "/portal/invoices", label: "Invoices" },
  { href: "/portal/files", label: "Files" },
  { href: "/portal/tickets", label: "Tickets" },
  { href: "/portal/profile", label: "Profile" },
];

export default function PortalNav({ firstName }: PortalNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unpaidCount, setUnpaidCount] = useState(0);

  useEffect(() => {
    fetch("/api/portal/me")
      .then((r) => r.json())
      .then((d: MeData) => {
        if (typeof d.unpaidInvoiceCount === "number") {
          setUnpaidCount(d.unpaidInvoiceCount);
        }
      })
      .catch(() => undefined);
  }, []);

  function isActive(href: string) {
    if (href === "/portal") return pathname === "/portal";
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b bg-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/portal" className="shrink-0">
            <Image src="/logo.png" alt="BluuHQ" width={100} height={28} priority className="object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive(link.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {link.label}
                {link.label === "Invoices" && unpaidCount > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none">
                    {unpaidCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right: name + sign out */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-slate-500">Hi, {firstName}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-slate-500 hover:text-slate-800"
              onClick={() => signOut({ callbackUrl: "/portal-login" })}
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{link.label}</span>
              {link.label === "Invoices" && unpaidCount > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none">
                  {unpaidCount}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-2 border-t mt-2 flex items-center justify-between">
            <span className="text-sm text-slate-500">Hi, {firstName}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-slate-500"
              onClick={() => signOut({ callbackUrl: "/portal-login" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
