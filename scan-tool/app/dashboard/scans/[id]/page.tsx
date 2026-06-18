import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getScan } from "@/lib/redis";
import { buildScanNarrative } from "@/lib/scan/narrative";

export default async function ScanDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const scan = await getScan(params.id);

  if (!scan || scan.email !== email) {
    notFound();
  }

  const brandLabel = scan.input?.domain || scan.input?.brand || "your brand";
  const narrative = scan.aiDetails
    ? buildScanNarrative(scan.aiDetails, scan.compDetails, scan.siteDetails, brandLabel)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">{brandLabel}</h1>
        <p className="text-sm text-gray-500">
          Scanned {new Date(scan.createdAt).toLocaleString()}
        </p>
      </div>

      {scan.scores && (
        <div className="grid grid-cols-4 gap-4">
          <ScoreCard label="Overall" value={scan.scores.overall} />
          <ScoreCard label="AI Visibility" value={scan.scores.ai} />
          <ScoreCard label="Site Health" value={scan.scores.site} />
          <ScoreCard label="Competitive" value={scan.scores.comp} />
        </div>
      )}

      {scan.verdict && (
        <div className="bg-blue-50 rounded-xl p-5">
          <p className="font-semibold text-ink mb-1">{scan.verdict.message}</p>
          <p className="text-sm text-gray-600">{scan.verdict.recommendation}</p>
        </div>
      )}

      {scan.strategicAnalysis && (
        <Section title="Strategic Assessment">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {scan.strategicAnalysis}
          </p>
        </Section>
      )}

      {narrative && (
        <>
          <Section title="AI Visibility Analysis">
            <p className="font-semibold text-ink text-sm mb-2">{narrative.aiHeadline}</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {narrative.aiBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Section>

          <Section title="Site Health">
            <p className="font-semibold text-ink text-sm mb-2">{narrative.siteHeadline}</p>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {narrative.siteBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Section>

          <Section title="Competitive Position">
            <p className="font-semibold text-ink text-sm mb-2">{narrative.compHeadline}</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {narrative.compBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Section>
        </>
      )}
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = value < 45 ? "text-red-600" : value < 70 ? "text-amber-600" : "text-green-600";
  return (
    <div className="bg-white rounded-xl border border-gray-200 text-center py-4">
      <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-bold text-ink mb-3 border-l-3 border-blue-600 pl-2">{title}</h2>
      {children}
    </div>
  );
}
