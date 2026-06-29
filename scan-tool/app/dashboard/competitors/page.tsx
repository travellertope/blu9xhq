import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTrackedCompetitors, getUserScanIds, getScan, getUser } from "@/lib/redis";
import { TIER_COMPETITOR_LIMITS } from "@/lib/stripe";
import { buildCompetitorProfile, identifyTopicGaps } from "@/lib/scan/competitor-intel";
import type { SiteDetails } from "@/lib/scan/types";
import { AddCompetitorForm } from "./add-competitor-form";
import { RemoveCompetitorButton } from "./remove-competitor-button";

export default async function CompetitorsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  const user = email ? await getUser(email) : null;
  const limit = TIER_COMPETITOR_LIMITS[user?.tier || "free"];

  if (limit === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-ink">Competitor tracking</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
          Competitor tracking requires the Monitor plan or higher.{" "}
          <a href="/dashboard/billing" className="text-blue-600 font-medium">
            Upgrade on the Billing page
          </a>
          .
        </div>
      </div>
    );
  }

  const tracked = email ? await getTrackedCompetitors(email) : [];

  const latestScanIds = email ? await getUserScanIds(email, 1) : [];
  const latestScan = latestScanIds.length > 0 ? await getScan(latestScanIds[0]) : null;
  const ownSiteDetails: SiteDetails | null = latestScan?.siteDetails || null;
  const ownOverall: number | null = latestScan?.scores?.overall ?? null;

  const profiles = await Promise.all(
    tracked.map((c) => buildCompetitorProfile(c.domain, c.domain))
  );

  const topicGaps = ownSiteDetails ? identifyTopicGaps(ownSiteDetails, profiles) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Competitor tracking</h1>
        <AddCompetitorForm disabled={tracked.length >= limit} />
      </div>

      {!ownSiteDetails && (
        <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
          Run a scan first so we have a baseline to compare tracked competitors against.
        </div>
      )}

      {tracked.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 text-sm">
          No competitors tracked yet. Add a domain above to start comparing.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3">Domain</th>
                <th className="text-left px-6 py-3">Content depth</th>
                <th className="text-left px-6 py-3">Pages (sitemap)</th>
                <th className="text-left px-6 py-3">Blog</th>
                <th className="text-left px-6 py-3">Structured data</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map((p, i) => (
                <tr key={tracked[i].domain}>
                  <td className="px-6 py-4 font-semibold text-ink">{tracked[i].domain}</td>
                  <td className="px-6 py-4 capitalize text-gray-700">{p.estimatedContentDepth}</td>
                  <td className="px-6 py-4 text-gray-700">{p.sitemapPageCount || "—"}</td>
                  <td className="px-6 py-4 text-gray-700">{p.hasBlog ? "Yes" : "No"}</td>
                  <td className="px-6 py-4 text-gray-700">{p.hasStructuredData ? "Yes" : "No"}</td>
                  <td className="px-6 py-4 text-right">
                    <RemoveCompetitorButton domain={tracked[i].domain} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ownOverall !== null && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Your latest overall score</p>
          <p className="text-3xl font-extrabold text-ink">{ownOverall}</p>
        </div>
      )}

      {topicGaps.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-ink mb-3 border-l-3 border-blue-600 pl-2">Topic gap matrix</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {topicGaps.map((g) => (
              <li key={g.topic}>
                <span className="font-semibold">"{g.topic}"</span> — covered by {g.competitorsCovering} of{" "}
                {tracked.length} tracked competitors, not by you ({g.opportunity}-opportunity gap)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
