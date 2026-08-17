"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Package, CalendarDays, FileText,
  FolderOpen, Mail, Workflow, Settings, LogOut, Menu, CheckSquare, TicketCheck, Users2, CreditCard, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { TenantSwitcher } from "@/components/admin/TenantSwitcher";
import { hasPermission, type Role } from "@/lib/permissions";

// Nav items with their required permission (undefined = visible to all team roles)
const NAV_ITEMS = [
  { href: "/admin",               label: "Dashboard",     icon: LayoutDashboard, permission: undefined },
  { href: "/admin/clients",       label: "Clients",       icon: Users,           permission: undefined },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CalendarDays,    permission: undefined },
  { href: "/admin/invoices",      label: "Invoices",      icon: FileText,        permission: undefined },
  { href: "/admin/files",         label: "Files",         icon: FolderOpen,      permission: undefined },
  { href: "/admin/tickets",        label: "Tickets",       icon: TicketCheck,     permission: undefined },
  { href: "/admin/follow-ups",    label: "Follow-ups",    icon: CheckSquare,     permission: undefined },
  { href: "/admin/email",         label: "Email",         icon: Mail,            permission: undefined },
  { href: "/admin/services",      label: "Services",      icon: Package,         permission: "create_edit_services" },
  { href: "/admin/sequences",     label: "Sequences",     icon: Workflow,        permission: "build_sequences" },
  { href: "/admin/daily-logs",    label: "Daily Logs",    icon: ClipboardList,   permission: "manage_daily_logs" },
  { href: "/admin/affiliates",    label: "Affiliates",    icon: Users2,          permission: "manage_affiliates" },
  { href: "/admin/billing",       label: "Billing",       icon: CreditCard,      permission: "access_settings" },
  { href: "/admin/settings",      label: "Settings",      icon: Settings,        permission: "access_settings" },
] as const;

interface SidebarInnerProps {
  userName: string;
  bluuhqRole: string;
  tenantLogo?: string;
  accentColour?: string;
  onNavigate?: () => void;
}

function SidebarInner({ userName, bluuhqRole, tenantLogo, accentColour, onNavigate }: SidebarInnerProps) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.replace("/admin-login");
  }

  const visibleItems = NAV_ITEMS.filter(({ permission }) =>
    !permission || hasPermission(bluuhqRole as Role, permission)
  );

  const accent = accentColour ?? "#2F5FE0";

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b shrink-0">
        {tenantLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tenantLogo} alt="Logo" className="h-8 max-w-[140px] object-contain" />
        ) : (
          <Image src="/logo.png" alt="BluuHQ" width={110} height={32} priority className="object-contain" />
        )}
      </div>

      {/* Tenant switcher */}
      <TenantSwitcher />

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
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                style={isActive ? { backgroundColor: accent, color: "#fff" } : undefined}
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")}
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
          onClick={handleSignOut}
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
  tenantLogo?: string;
  accentColour?: string;
}

export function Sidebar({ userName, bluuhqRole, tenantLogo, accentColour }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r">
        <SidebarInner userName={userName} bluuhqRole={bluuhqRole} tenantLogo={tenantLogo} accentColour={accentColour} />
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
        {tenantLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tenantLogo} alt="Logo" className="h-7 max-w-[110px] object-contain" />
        ) : (
          <Image src="/logo.png" alt="BluuHQ" width={90} height={26} priority className="object-contain" />
        )}
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
            tenantLogo={tenantLogo}
            accentColour={accentColour}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
