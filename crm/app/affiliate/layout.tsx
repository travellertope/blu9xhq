import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AffiliateNav from "./AffiliateNav";
import type { ReactNode } from "react";

export const metadata = {
  title: { default: "Bluu Affiliates", template: "%s — Bluu Affiliates" },
};

export default async function AffiliateLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || session.user.role !== "bluu_affiliate") {
    redirect("/affiliate-login");
  }

  const { name, affiliateCode } = session.user;

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <AffiliateNav firstName={name?.split(" ")[0] ?? "Affiliate"} affiliateCode={affiliateCode ?? ""} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="lg:hidden h-14 shrink-0" />
        <main className="flex-1 min-h-0 overflow-auto overscroll-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
