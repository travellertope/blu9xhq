import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUser, getSchedule, getUserScanIds, getScan, getApiKeyForUser } from "@/lib/redis";
import { TIER_SCHEDULE_FREQUENCIES } from "@/lib/stripe";
import { ScheduleForm } from "./schedule-form";
import { ApiKeyPanel } from "./api-key-panel";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || "";
  const user = await getUser(email);
  const schedule = email ? await getSchedule(email) : null;

  const latestIds = email ? await getUserScanIds(email, 1) : [];
  const latestScan = latestIds.length > 0 ? await getScan(latestIds[0]) : null;
  const defaultDomain: string = latestScan?.input?.domain || "";
  const apiKey = email ? await getApiKeyForUser(email) : null;
  const tier = user?.tier || "free";
  const allowedFrequencies = TIER_SCHEDULE_FREQUENCIES[tier];

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

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-ink mb-1">Scheduled re-scans</h2>
        <p className="text-xs text-gray-500 mb-4">
          Available on Monitor and Monitor Pro. Automatically re-scans your domain and emails you if the score moves.
        </p>
        <ScheduleForm schedule={schedule} defaultDomain={defaultDomain} allowedFrequencies={allowedFrequencies} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-ink mb-1">API access</h2>
        <p className="text-xs text-gray-500 mb-4">
          Available on Monitor Pro. Trigger scans and fetch results programmatically.
        </p>
        <ApiKeyPanel apiKey={apiKey} isPro={tier === "monitor_pro"} />
      </div>
    </div>
  );
}
