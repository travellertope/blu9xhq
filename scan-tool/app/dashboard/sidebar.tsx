"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: IconHome },
  { href: "/dashboard/scans", label: "Scan history", icon: IconList },
  { href: "/dashboard/trends", label: "Trends", icon: IconTrendingUp },
  { href: "/dashboard/competitors", label: "Competitors", icon: IconUsers },
  { href: "/dashboard/billing", label: "Billing", icon: IconCreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: IconSettings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-blue-soft text-blue-dark" : "text-ink-soft hover:bg-bg-soft hover:text-ink"
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-dark" : "text-ink-soft"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-14 items-center px-5 border-b border-line shrink-0">
        <Link href="/dashboard" className="font-extrabold text-ink">
          BluuAudit
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5M5 10v9.5a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

export function IconList({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export function IconTrendingUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17 9 11l4 4 8-8M17 6h6v6" />
    </svg>
  );
}

export function IconUsers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M19 8.5a2.5 2.5 0 1 0-2-4.03M21 20v-1a3.5 3.5 0 0 0-2.5-3.36M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
    </svg>
  );
}

export function IconCreditCard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path strokeLinecap="round" d="M2.5 9.5h19" />
    </svg>
  );
}

export function IconSettings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 13a7.97 7.97 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L14.8 3h-4l-.5 2.6a8 8 0 0 0-1.7 1l-2.5-1-2 3.4L6.2 11a7.97 7.97 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1a8 8 0 0 0 1.7 1l.5 2.6h4l.5-2.6a8 8 0 0 0 1.7-1l2.5 1 2-3.4-2.1-1.6Z" />
    </svg>
  );
}

export function IconMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-.5A5.5 5.5 0 0 1 10.5 14h3A5.5 5.5 0 0 1 19 19.5V20" />
    </svg>
  );
}

export function IconLogOut({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
