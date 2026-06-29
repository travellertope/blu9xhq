import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserScanIds, getScan, getUser } from "@/lib/redis";
import { TrendChart, type TrendPoint } from "./trend-chart";

export default async function TrendsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  const user = email ? await getUser(email) : null;
  const tier = user?.tier || "free";

  if (tier === "free") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-ink">Trends</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
          Trend charts require the Monitor plan or higher.{" "}
          <a href="/dashboard/billing" className="text-blue-600 font-medium">
            Upgrade on the Billing page
          </a>
          .
        </div>
      </div>
    );
  }

  const ids = email ? await getUserScanIds(email, 90) : [];
  const scans = (await Promise.all(ids.map((id) => getScan(id))))
    .filter((s) => s && s.status === "complete" && s.scores)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const points: TrendPoint[] = scans.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    overall: s.scores.overall,
    ai: s.scores.ai,
    site: s.scores.site,
    comp: s.scores.comp,
  }));

  const first = points[0];
  const latest = points[points.length - 1];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-ink">Trends</h1>

      {points.length < 2 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
          You need at least two completed scans to see a trend. Run another scan to start tracking changes over time.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <DeltaCard label="Overall" first={first.overall} latest={latest.overall} />
            <DeltaCard label="AI Visibility" first={first.ai} latest={latest.ai} />
            <DeltaCard label="Site Health" first={first.site} latest={latest.site} />
            <DeltaCard label="Competitive" first={first.comp} latest={latest.comp} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <TrendChart points={points} />
          </div>
        </>
      )}
    </div>
  );
}

function DeltaCard({ label, first, latest }: { label: string; first: number; latest: number }) {
  const delta = latest - first;
  const color = delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-gray-500";
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";

  return (
    <div className="bg-white rounded-xl border border-gray-200 text-center py-4">
      <div className="text-2xl font-extrabold text-ink">{latest}</div>
      <div className={`text-xs font-semibold ${color}`}>
        {arrow} {Math.abs(delta)} since first scan
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
