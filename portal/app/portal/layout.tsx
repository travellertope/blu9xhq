import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { ReactNode } from "react";
import PortalNav from "./PortalNav";

export const metadata = {
  title: "BluuHQ Client Portal",
  description: "Your BluuHQ client portal",
};

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as { role?: string })?.role !== "bluu_client") {
    redirect("/portal-login");
  }

  const firstName = session.user?.name?.split(" ")[0] ?? "Client";

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      <PortalNav firstName={firstName} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <footer className="border-t bg-white py-4 text-center text-sm text-slate-400">
        Powered by BluuHQ &middot;{" "}
        <a href="mailto:hello@bluuhq.com" className="hover:text-slate-600 transition-colors">
          hello@bluuhq.com
        </a>
      </footer>
    </div>
  );
}
