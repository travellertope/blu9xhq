import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "./shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <DashboardShell email={session?.user?.email}>
      <div className="max-w-5xl mx-auto">{children}</div>
    </DashboardShell>
  );
}
