import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AffiliateNav from "./AffiliateNav";
import type { ReactNode } from "react";

export const metadata = {
  title: { default: "Bluu Affiliates", template: "%s — Bluu Affiliates" },
};

export default async function AffiliateLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "bluu_affiliate") {
    redirect("/affiliate-login");
  }

  const user = session.user as any;
  const firstName    = user?.name?.split(" ")[0] ?? "Affiliate";
  const affiliateCode = user?.affiliateCode ?? "";

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <AffiliateNav firstName={firstName} affiliateCode={affiliateCode} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="lg:hidden h-14 shrink-0" />
        <main className="flex-1 min-h-0 overflow-auto overscroll-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
