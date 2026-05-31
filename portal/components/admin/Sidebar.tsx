"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, Users, Package, CalendarDays, FileText,
  FolderOpen, Mail, Workflow, Settings, LogOut, Menu, CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { hasPermission, type Role } from "@/lib/permissions";

// Nav items with their required permission (undefined = visible to all team roles)
const NAV_ITEMS = [
  { href: "/admin",               label: "Dashboard",     icon: LayoutDashboard, permission: undefined },
  { href: "/admin/clients",       label: "Clients",       icon: Users,           permission: undefined },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CalendarDays,    permission: undefined },
  { href: "/admin/invoices",      label: "Invoices",      icon: FileText,        permission: undefined },
  { href: "/admin/files",         label: "Files",         icon: FolderOpen,      permission: undefined },
  { href: "/admin/follow-ups",    label: "Follow-ups",    icon: CheckSquare,     permission: undefined },
  { href: "/admin/email",         label: "Email",         icon: Mail,            permission: undefined },
  { href: "/admin/services",      label: "Services",      icon: Package,         permission: "create_edit_services" },
  { href: "/admin/sequences",     label: "Sequences",     icon: Workflow,        permission: "build_sequences" },
  { href: "/admin/settings",      label: "Settings",      icon: Settings,        permission: "access_settings" },
] as const;

interface SidebarInnerProps {
  userName: string;
  bluuhqRole: string;
  onNavigate?: () => void;
}

function SidebarInner({ userName, bluuhqRole, onNavigate }: SidebarInnerProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(({ permission }) =>
    !permission || hasPermission(bluuhqRole as Role, permission)
  );

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center px-6 border-b shrink-0">
        <span className="font-bold text-slate-900 tracking-tight">BluuHQ</span>
        <span className="ml-1 text-xs text-slate-400 font-normal">CRM</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-0.5 px-3">
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
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
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-indigo-600" : "text-slate-400"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User info + role + logout */}
      <div className="p-4 space-y-2">
        <div className="px-3 space-y-1">
          <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
          <RoleBadge role={bluuhqRole as Role} />
        </div>
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
  bluuhqRole: string;
}

export function Sidebar({ userName, bluuhqRole }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r">
        <SidebarInner userName={userName} bluuhqRole={bluuhqRole} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b bg-white px-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-bold text-slate-900 tracking-tight">BluuHQ</span>
        <span className="text-xs text-slate-400">CRM</span>
      </div>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarInner
            userName={userName}
            bluuhqRole={bluuhqRole}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
