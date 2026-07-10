"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Link2, TrendingUp, DollarSign, Wallet,
  FolderOpen, Settings, LogOut, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const NAV_ITEMS = [
  { href: "/affiliate",             label: "Overview",    icon: LayoutDashboard, exact: true },
  { href: "/affiliate/links",       label: "Links",       icon: Link2 },
  { href: "/affiliate/conversions", label: "Conversions", icon: TrendingUp },
  { href: "/affiliate/earnings",    label: "Earnings",    icon: DollarSign },
  { href: "/affiliate/payouts",     label: "Payouts",     icon: Wallet },
  { href: "/affiliate/assets",      label: "Assets",      icon: FolderOpen },
  { href: "/affiliate/settings",    label: "Settings",    icon: Settings },
] as const;

interface Props {
  firstName: string;
  affiliateCode: string;
}

function NavInner({ firstName, affiliateCode, onNavigate }: Props & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.replace("/affiliate-login");
  }

  return (
    <div className="flex h-full flex-col bg-white border-r">
      <div className="flex h-14 items-center px-5 border-b shrink-0">
        <Image src="/logo.png" alt="BluuHQ" width={110} height={32} priority className="object-contain" />
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-3 mb-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">Affiliate Program</p>
          {affiliateCode && (
            <div className="px-2 py-1.5 bg-blue-50 rounded-md">
              <p className="text-[10px] text-slate-500">Your code</p>
              <p className="text-sm font-bold text-blue-700 tracking-wider">{affiliateCode}</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-0.5 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-700" : "text-slate-400")} />
                {label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3 space-y-1 shrink-0">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-slate-800 truncate">{firstName}</p>
          <p className="text-xs text-slate-400">Affiliate</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-500 hover:text-slate-800 gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export default function AffiliateNav({ firstName, affiliateCode }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 h-full">
        <NavInner firstName={firstName} affiliateCode={affiliateCode} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-50 flex items-center justify-between px-4">
        <Image src="/logo.png" alt="BluuHQ" width={90} height={26} priority className="object-contain" />
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-56 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <NavInner firstName={firstName} affiliateCode={affiliateCode} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
