"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, Users, Package, CalendarDays, FileText,
  FolderOpen, Mail, Workflow, Settings, LogOut, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const NAV_ITEMS = [
  { href: "/admin",             label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/clients",     label: "Clients",       icon: Users },
  { href: "/admin/services",    label: "Services",      icon: Package },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CalendarDays },
  { href: "/admin/invoices",    label: "Invoices",      icon: FileText },
  { href: "/admin/files",       label: "Files",         icon: FolderOpen },
  { href: "/admin/email",       label: "Email",         icon: Mail },
  { href: "/admin/sequences",   label: "Sequences",     icon: Workflow },
  { href: "/admin/settings",    label: "Settings",      icon: Settings },
];

interface SidebarNavProps {
  pathname: string;
  onNavigate?: () => void;
}

function SidebarNav({ pathname, onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-600" : "text-slate-400")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

interface SidebarInnerProps {
  userName: string;
  onNavigate?: () => void;
}

function SidebarInner({ userName, onNavigate }: SidebarInnerProps) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center px-6 border-b">
        <span className="font-bold text-slate-900 tracking-tight">BluuHQ</span>
        <span className="ml-1 text-xs text-slate-400 font-normal">CRM</span>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4">
        <SidebarNav pathname={pathname} onNavigate={onNavigate} />
      </ScrollArea>

      <Separator />

      {/* User + logout */}
      <div className="p-4 space-y-1">
        <p className="px-3 text-xs text-slate-500 truncate">{userName}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          Sign out
        </button>
      </div>
    </div>
  );
}

interface SidebarProps {
  userName: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-white">
        <SidebarInner userName={userName} />
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b bg-white px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="mr-3"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-bold text-slate-900 tracking-tight">BluuHQ</span>
        <span className="ml-1 text-xs text-slate-400">CRM</span>
      </div>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarInner userName={userName} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
