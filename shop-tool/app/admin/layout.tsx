import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="bg-white border-b border-line">
        <div className="max-w-site mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="font-extrabold text-ink">
              Bluu<span className="text-blue">Shop</span> Admin
            </span>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/admin" className="text-ink-soft hover:text-ink">
                Analytics
              </Link>
              <Link href="/admin/shops" className="text-ink-soft hover:text-ink">
                Shops
              </Link>
              <Link href="/admin/users" className="text-ink-soft hover:text-ink">
                Users
              </Link>
            </nav>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-blue hover:underline">
            My shop
          </Link>
        </div>
      </header>

      <main className="max-w-site mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
