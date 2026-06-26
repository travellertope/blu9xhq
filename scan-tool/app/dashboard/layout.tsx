import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-extrabold text-ink">
              BluuHQ Scan
            </Link>
            <nav className="flex items-center gap-4 text-sm text-gray-600">
              <Link href="/dashboard">Overview</Link>
              <Link href="/dashboard/scans">Scan history</Link>
              <Link href="/dashboard/trends">Trends</Link>
              <Link href="/dashboard/competitors">Competitors</Link>
              <Link href="/dashboard/billing">Billing</Link>
              <Link href="/dashboard/settings">Settings</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{session?.user?.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
