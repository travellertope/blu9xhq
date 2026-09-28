"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  label: string;
  href: string;
  exact?: boolean;
}

const TABS: Tab[] = [
  { label: "General",      href: "/admin/settings",           exact: true },
  { label: "Bank Details", href: "/admin/settings?tab=bank",  exact: true },
  { label: "Security",     href: "/admin/settings?tab=security", exact: true },
  { label: "Team",         href: "/admin/settings/team" },
  { label: "Branding",     href: "/admin/settings/branding" },
];

export function SettingsTabBar({ active }: { active?: string }) {
  const pathname = usePathname();

  function isActive(tab: Tab) {
    if (active) {
      return tab.label.toLowerCase() === active.toLowerCase();
    }
    return tab.exact
      ? pathname === "/admin/settings"
      : pathname.startsWith(tab.href.split("?")[0]);
  }

  return (
    <div className="flex gap-1 border-b border-slate-200">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors " +
            (isActive(tab)
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700")
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
