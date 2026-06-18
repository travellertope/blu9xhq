import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUser } from "@/lib/redis";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || "";
  const user = await getUser(email);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-ink">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm font-medium text-ink">{email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Member since</p>
          <p className="text-sm font-medium text-ink">
            {user ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Scans run</p>
          <p className="text-sm font-medium text-ink">{user?.scanCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
