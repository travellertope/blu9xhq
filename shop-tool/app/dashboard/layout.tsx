import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyShop } from "@/lib/auth";
import BottomNav from "@/components/dashboard/bottom-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const shop = await getMyShop();
  if (!shop) redirect("/create");

  return (
    <div className="min-h-screen bg-bg-soft pb-16">
      <header className="bg-white border-b border-line">
        <div className="max-w-site mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-extrabold text-ink">{shop.name}</span>
          <Link
            href={`/${shop.slug}`}
            target="_blank"
            className="text-sm font-semibold text-blue hover:underline"
          >
            View shop ↗
          </Link>
        </div>
      </header>

      <main className="max-w-site mx-auto px-4 py-5">{children}</main>

      <BottomNav />
    </div>
  );
}
