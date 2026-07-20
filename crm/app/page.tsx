import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import MarketingHome from "@/components/marketing/MarketingHome";
import type { UserRole } from "@/types";

const ROLE_HOME: Record<UserRole, string> = {
  bluu_admin: "/admin",
  bluu_client: "/portal",
  bluu_affiliate: "/affiliate",
};

export default async function Home() {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.user.role] ?? "/portal-login");
  }

  return <MarketingHome />;
}
