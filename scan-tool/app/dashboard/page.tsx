import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserScanIds, getScan } from "@/lib/redis";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const ids = email ? await getUserScanIds(email, 1) : [];
  const latest = ids.length > 0 ? await getScan(ids[0]) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-ink">Overview</h1>

      {latest ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Most recent scan</p>
          <p className="font-semibold text-ink mb-4">
            {latest.input?.domain || latest.input?.brand || "Untitled scan"}
          </p>
          {latest.scores && (
            <div className="flex gap-4 mb-4">
              <ScoreBox label="Overall" value={latest.scores.overall} />
              <ScoreBox label="AI Visibility" value={latest.scores.ai} />
              <ScoreBox label="Site Health" value={latest.scores.site} />
              <ScoreBox label="Competitive" value={latest.scores.comp} />
            </div>
          )}
          <Link
            href={`/dashboard/scans/${latest.id}`}
            className="text-blue-600 text-sm font-medium"
          >
            View full report →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
          No scans yet.{" "}
          <Link href="/" className="text-blue-600 font-medium">
            Run your first scan →
          </Link>
        </div>
      )}

      <Link
        href="/"
        className="inline-block rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold"
      >
        Run a new scan
      </Link>
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  const color = value < 45 ? "text-red-600" : value < 70 ? "text-amber-600" : "text-green-600";
  return (
    <div className="text-center bg-gray-50 rounded-lg px-4 py-3 flex-1">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
