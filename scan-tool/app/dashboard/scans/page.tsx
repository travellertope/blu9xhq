import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserScanIds, getScan } from "@/lib/redis";

export default async function ScanHistoryPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const ids = email ? await getUserScanIds(email) : [];
  const scans = (await Promise.all(ids.map((id) => getScan(id)))).filter(Boolean);
  const hasExpiredScans = ids.length > 0 && scans.length === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-ink">Scan history</h1>

      {scans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
          {hasExpiredScans
            ? "Your earlier scan reports have expired and are no longer available. New scans now stay in your history permanently."
            : "No scans yet."}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {scans.map((scan) => (
            <Link
              key={scan.id}
              href={`/dashboard/scans/${scan.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold text-ink text-sm">
                  {scan.input?.domain || scan.input?.brand || "Untitled scan"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(scan.createdAt).toLocaleDateString()} · {scan.status}
                </p>
              </div>
              {scan.scores && (
                <div className="text-xl font-extrabold text-ink">{scan.scores.overall}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
