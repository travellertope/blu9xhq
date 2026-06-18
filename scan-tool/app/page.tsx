"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { buildScanNarrative } from "@/lib/scan/narrative";

interface ScanScores {
  ai: number;
  site: number;
  comp: number;
  overall: number;
}

interface ScanVerdict {
  weakest: string;
  message: string;
  recommendation: string;
  serviceUrl: string;
}

interface AiDetail {
  prompt: string;
  category: string;
  intent: string;
  mentioned: boolean;
  position: string;
  sentiment: string;
  hasCitation: boolean;
  snippet: string;
}

interface CompetitorProfile {
  name: string;
  domain: string | null;
  hasStructuredData: boolean;
  hasBlog: boolean;
  estimatedContentDepth: string;
  wordCount: number;
}

interface CompDetails {
  competitors: CompetitorProfile[];
  brandMentionedMoreThanCompetitors: boolean;
  relativePosition: string;
  gaps: string[];
}

interface PageAnalysis {
  url: string;
  title: string;
  wordCount: number;
  headingCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  hasStructuredData: boolean;
  imageCount: number;
  imagesWithAlt: number;
}

interface SiteDetails {
  dnsResolves: boolean;
  https: boolean;
  responseTimeMs: number;
  hasTitle: boolean;
  hasDescription: boolean;
  hasOgTags: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  hasStructuredData: boolean;
  hasLlmsTxt: boolean;
  hasBlog: boolean;
  hasCanonical: boolean;
  hasMobileViewport: boolean;
  totalPagesFound: number;
  avgWordCount: number;
  avgHeadingCount: number;
  avgInternalLinks: number;
  imageAltCoverage: number;
  pages: PageAnalysis[];
}

interface ScanPollResponse {
  id: string;
  status: "processing" | "complete" | "failed";
  progress: number;
  currentStep: string;
  scores: ScanScores;
  verdict: ScanVerdict | null;
  summary: { pagesChecked: number; competitorsSurveyed: number; aiPromptsRun: number };
  aiDetails: AiDetail[] | null;
  compDetails: CompDetails | null;
  siteDetails: SiteDetails | null;
  strategicAnalysis: string | null;
  gated: boolean;
  error: string | null;
}

function bandColor(v: number): string {
  if (v < 45) return "#E2543D";
  if (v < 70) return "#D9A22A";
  return "#2F9E63";
}

function bandLabel(v: number): string {
  if (v < 30) return "Critical";
  if (v < 45) return "Poor";
  if (v < 60) return "Needs work";
  if (v < 75) return "Fair";
  if (v < 90) return "Good";
  return "Excellent";
}

const CATEGORY_LABELS: Record<string, string> = {
  informational: "Informational",
  transactional: "Purchase Intent",
  comparison: "Comparison",
  reputation: "Reputation",
};

export default function ScanPage() {
  const [noSite, setNoSite] = useState(false);
  const [domain, setDomain] = useState("");
  const [bizName, setBizName] = useState("");
  const [niche, setNiche] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState<ScanScores>({ ai: 0, site: 0, comp: 0, overall: 0 });
  const [verdict, setVerdict] = useState<ScanVerdict | null>(null);
  const [strategicAnalysis, setStrategicAnalysis] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState(0);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [aiDetails, setAiDetails] = useState<AiDetail[] | null>(null);
  const [compDetails, setCompDetails] = useState<CompDetails | null>(null);
  const [siteDetails, setSiteDetails] = useState<SiteDetails | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ScanPollResponse["summary"] | null>(null);
  const scanIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const performScan = useCallback(
    async (params: { domain: string; bizName: string; niche: string; noSite: boolean }) => {
      stopPolling();
      setScanError(null);
      setShowResults(false);
      setShowEmailGate(false);
      setEmailSent(false);
      setAiDetails(null);
      setCompDetails(null);
      setSiteDetails(null);
      setStrategicAnalysis(null);
      setSummary(null);
      setScanning(true);
      setProgress(0);

      const key = params.noSite ? params.bizName || "newbusiness" : params.domain || "example.com";
      setStatusText(
        params.noSite ? `Mapping the content landscape for "${key}"…` : `Scanning ${key}…`
      );

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: params.noSite ? undefined : params.domain,
            brand: params.noSite ? params.bizName : undefined,
            niche: params.niche || undefined,
            noSite: params.noSite,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setScanError(data.message || "Something went wrong.");
          setScanning(false);
          setStatusText("");
          return;
        }

        scanIdRef.current = data.id;

        pollRef.current = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/scan/${data.id}`);
            const poll: ScanPollResponse = await pollRes.json();

            setProgress(poll.progress);
            setStatusText(poll.currentStep);

            if (poll.status === "complete") {
              stopPolling();
              setScores(poll.scores);
              setVerdict(poll.verdict);
              setStrategicAnalysis(poll.strategicAnalysis);
              setSummary(poll.summary);
              setScanning(false);
              setShowResults(true);
              if (!poll.gated) {
                if (poll.aiDetails) setAiDetails(poll.aiDetails);
                if (poll.compDetails) setCompDetails(poll.compDetails);
                if (poll.siteDetails) setSiteDetails(poll.siteDetails);
              }
              setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            } else if (poll.status === "failed") {
              stopPolling();
              setScanError(poll.error || "Scan failed. Please try again.");
              setScanning(false);
              setStatusText("");
            }
          } catch {
            // Polling error — keep trying
          }
        }, 2000);
      } catch {
        setScanError("Network error. Please check your connection.");
        setScanning(false);
        setStatusText("");
      }
    },
    [stopPolling]
  );

  const handleScan = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      performScan({ domain, bizName, niche, noSite });
    },
    [performScan, noSite, domain, bizName, niche]
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const domainParam = url.searchParams.get("domain")?.trim() ?? "";
    const brandParam = url.searchParams.get("brand")?.trim() ?? "";
    const nicheParam = url.searchParams.get("niche")?.trim() ?? "";

    if (!domainParam && !brandParam) return;

    const noSiteParam = !domainParam && !!brandParam;

    setDomain(domainParam);
    setBizName(brandParam);
    setNiche(nicheParam);
    setNoSite(noSiteParam);

    performScan({ domain: domainParam, bizName: brandParam, niche: nicheParam, noSite: noSiteParam });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brandLabel = domain || bizName || "Your brand";

  // Build narrative from the detailed data
  const narrative = aiDetails
    ? buildScanNarrative(
        aiDetails as Parameters<typeof buildScanNarrative>[0],
        compDetails as Parameters<typeof buildScanNarrative>[1],
        siteDetails as Parameters<typeof buildScanNarrative>[2],
        brandLabel
      )
    : null;

  const handleEmailGate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!scanIdRef.current) return;

      setEmailSending(true);
      try {
        const res = await fetch("/api/email-gate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scanId: scanIdRef.current, email }),
        });
        const data = await res.json();

        if (res.ok) {
          setEmailSent(true);
          if (data.aiDetails) setAiDetails(data.aiDetails);
          if (data.compDetails) setCompDetails(data.compDetails);
          if (data.siteDetails) setSiteDetails(data.siteDetails);
          if (data.strategicAnalysis) setStrategicAnalysis(data.strategicAnalysis);
        }
      } catch {
        // Silently handle
      }
      setEmailSending(false);
    },
    [email]
  );

  // Group AI details by category
  const aiByCategory = aiDetails
    ? Object.entries(
        aiDetails.reduce<Record<string, AiDetail[]>>((acc, d) => {
          (acc[d.category] = acc[d.category] || []).push(d);
          return acc;
        }, {})
      )
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-line">
        <div className="max-w-site mx-auto px-7 flex items-center justify-between h-16">
          <a href="https://bluuhq.com" className="flex items-center gap-2 font-extrabold text-lg">
            <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
              <path d="M13 1L24 7.5V18.5L13 25L2 18.5V7.5L13 1Z" stroke="#2F5FE0" strokeWidth="1.8" />
              <circle cx="13" cy="13" r="4.5" fill="#2F5FE0" />
            </svg>
            Bluu<span className="text-blue">HQ</span>
            <span className="text-ink-soft font-medium text-sm ml-1">/ scan</span>
          </a>
          <a
            href="https://bluuhq.com/contact"
            className="text-sm font-semibold text-ink-soft hover:text-ink transition-colors"
          >
            Let&apos;s talk &rarr;
          </a>
        </div>
      </header>

      {/* ── Scan form ──────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-7 py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
            Free AI visibility scan
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
            See if AI search can find your brand.
          </h1>
          <p className="mt-3 text-ink-soft text-base leading-relaxed max-w-lg mx-auto">
            We test 12 real-world buyer queries, crawl up to 8 pages of your site, research your competitors, and write a strategic analysis. Takes about two minutes.
          </p>
        </div>

        <form
          onSubmit={handleScan}
          className="bg-white border border-line rounded-site p-6 shadow-sm max-w-2xl mx-auto"
        >
          <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer select-none mb-4">
            <input
              type="checkbox"
              checked={noSite}
              onChange={() => {
                setNoSite(!noSite);
                setShowResults(false);
                setShowEmailGate(false);
                setStatusText("");
                setScanError(null);
              }}
              className="accent-blue"
            />
            I don&apos;t have a website yet
          </label>

          <div className="flex gap-2.5 flex-wrap">
            {!noSite ? (
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourdomain.com"
                className="flex-1 min-w-[170px] px-4 py-3 rounded-[10px] border border-line bg-white text-ink text-sm placeholder:text-[#9AA3AF] focus:outline-2 focus:outline-blue focus:outline-offset-1"
              />
            ) : (
              <div className="flex gap-2.5 flex-1 min-w-[260px]">
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="Business name"
                  className="flex-1 px-4 py-3 rounded-[10px] border border-line bg-white text-ink text-sm placeholder:text-[#9AA3AF] focus:outline-2 focus:outline-blue focus:outline-offset-1"
                />
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Niche, e.g. SaaS"
                  className="flex-1 px-4 py-3 rounded-[10px] border border-line bg-white text-ink text-sm placeholder:text-[#9AA3AF] focus:outline-2 focus:outline-blue focus:outline-offset-1"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={scanning}
              className="px-5 py-3 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark hover:shadow-[0_10px_24px_-8px_rgba(47,95,224,0.55)] transition-all cursor-pointer border-none whitespace-nowrap disabled:opacity-70"
            >
              {scanning ? "Scanning…" : "Run free scan"}
            </button>
          </div>

          {scanError && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">
              {scanError}
            </div>
          )}

          {statusText && !scanError && (
            <div className="mt-3 text-sm text-ink-soft">
              {statusText}
              {scanning && (
                <div className="progress-bar mt-1.5">
                  <i
                    className="progress-bar-fill"
                    style={{ width: `${progress}%`, transition: "width 0.6s ease" }}
                  />
                </div>
              )}
            </div>
          )}
        </form>

        {/* ═══════════════ RESULTS ═══════════════ */}
        {showResults && (
          <div ref={resultsRef} className="mt-8 animate-fadein space-y-6">

            {/* ── Summary stats ──────────────────────────────── */}
            {summary && (
              <p className="text-center text-xs text-ink-soft">
                Tested {summary.aiPromptsRun} AI queries &middot; Crawled {summary.pagesChecked} pages &middot; Analyzed {summary.competitorsSurveyed} competitors
              </p>
            )}

            {/* ── Score card ─────────────────────────────────── */}
            <div className="p-6 bg-white border border-line rounded-site shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center flex-none"
                  style={{ background: `${bandColor(scores.overall)}15` }}
                >
                  <span className="text-3xl font-extrabold font-display" style={{ color: bandColor(scores.overall) }}>
                    {scores.overall}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold text-ink">
                    Overall: <span style={{ color: bandColor(scores.overall) }}>{bandLabel(scores.overall)}</span>
                  </p>
                  <p className="text-sm text-ink-soft mt-0.5">
                    Weighted score across AI visibility, site health, and competitive position.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { label: "AI Discoverability", val: scores.ai, weight: "45%" },
                  { label: "Site & Tech Health", val: scores.site, weight: "30%" },
                  { label: "Competitive Position", val: scores.comp, weight: "25%" },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-3">
                    <span className="w-40 text-sm text-ink-soft flex-none">
                      {p.label} <span className="text-[10px] text-ink-soft/60">({p.weight})</span>
                    </span>
                    <span className="pillar-track bg-bg-soft">
                      <span
                        className="pillar-fill"
                        style={{ width: `${p.val}%`, background: bandColor(p.val) }}
                      />
                    </span>
                    <span className="w-9 text-right text-sm font-bold flex-none" style={{ color: bandColor(p.val) }}>
                      {p.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Verdict ────────────────────────────────────── */}
            {verdict && (
              <div className="p-5 bg-bg-soft rounded-site border border-line">
                <p className="font-semibold text-ink mb-1 text-sm">{verdict.message}</p>
                <p className="text-sm text-ink-soft">{verdict.recommendation}</p>
                <a
                  href={verdict.serviceUrl}
                  className="inline-block mt-3 text-blue font-semibold text-xs hover:underline"
                >
                  See how we can help &rarr;
                </a>
              </div>
            )}

            {/* ── Strategic Analysis (Gemini-written) ────────── */}
            {strategicAnalysis && (
              <div className="p-6 bg-white border border-line rounded-site shadow-sm">
                <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue rounded-full" />
                  Strategic Assessment
                </h2>
                <div className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                  {strategicAnalysis}
                </div>
              </div>
            )}

            {/* ── AI Visibility — narrative + categorized ─────── */}
            {narrative && (
              <div className="p-6 bg-white border border-line rounded-site shadow-sm">
                <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue rounded-full" />
                  AI Visibility Analysis
                </h2>
                <div className="p-4 bg-bg-soft rounded-xl text-sm leading-relaxed mb-4">
                  <p className="font-semibold text-ink mb-2">{narrative.aiHeadline}</p>
                  <ul className="space-y-1.5 text-ink-soft text-xs">
                    {narrative.aiBullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-none bg-blue" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {aiByCategory.length > 0 && (
                  <details className="text-xs text-ink-soft">
                    <summary className="cursor-pointer font-medium text-ink select-none text-sm mb-3">
                      Query-by-query results ({aiDetails?.length} tested)
                    </summary>
                    <div className="space-y-4">
                      {aiByCategory.map(([category, items]) => (
                        <div key={category}>
                          <p className="font-semibold text-ink mb-2 text-xs uppercase tracking-wider">
                            {CATEGORY_LABELS[category] || category}
                          </p>
                          <div className="space-y-1.5">
                            {items.map((d, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-bg-soft rounded-lg">
                                <span className={`mt-0.5 w-2 h-2 rounded-full flex-none ${d.mentioned ? "bg-green-500" : "bg-red-400"}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-ink">
                                    &ldquo;{d.prompt}&rdquo;
                                    <span className="ml-2 text-[10px] font-normal text-ink-soft">({d.intent})</span>
                                  </p>
                                  {d.mentioned ? (
                                    <p className="text-ink-soft mt-0.5">
                                      {d.position} position &middot; {d.sentiment} sentiment
                                      {d.hasCitation && " · linked back to site"}
                                      {d.snippet && <span className="block mt-1 italic text-[11px]">&ldquo;{d.snippet}&rdquo;</span>}
                                    </p>
                                  ) : (
                                    <p className="text-ink-soft mt-0.5">Not mentioned in response</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* ── Site Health ────────────────────────────────── */}
            {narrative && (
              <div className="p-6 bg-white border border-line rounded-site shadow-sm">
                <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue rounded-full" />
                  Site Health
                </h2>
                <div className="p-4 bg-bg-soft rounded-xl text-sm leading-relaxed mb-4">
                  <p className="font-semibold text-ink mb-2">{narrative.siteHeadline}</p>
                  {narrative.siteBullets.length > 0 && (
                    <ul className="space-y-1.5 text-ink-soft text-xs">
                      {narrative.siteBullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 w-2 h-2 rounded-full flex-none bg-red-400" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {siteDetails && siteDetails.pages.length > 0 && (
                  <details className="text-xs text-ink-soft">
                    <summary className="cursor-pointer font-medium text-ink select-none text-sm mb-3">
                      Pages analyzed ({siteDetails.pages.length} of {siteDetails.totalPagesFound} found)
                    </summary>
                    <div className="space-y-1.5">
                      {siteDetails.pages.map((p, i) => (
                        <div key={i} className="p-3 bg-bg-soft rounded-lg flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-ink truncate">{p.title || p.url}</p>
                            <p className="text-ink-soft mt-0.5 truncate">{p.url}</p>
                          </div>
                          <div className="flex gap-3 flex-none text-[10px]">
                            <span>{p.wordCount} words</span>
                            <span>{p.headingCount} headings</span>
                            <span>{p.internalLinkCount} links</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* ── Competitive Position ─────────────────────── */}
            {narrative && (
              <div className="p-6 bg-white border border-line rounded-site shadow-sm">
                <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue rounded-full" />
                  Competitive Position
                </h2>
                <div className="p-4 bg-bg-soft rounded-xl text-sm leading-relaxed mb-4">
                  <p className="font-semibold text-ink mb-2">{narrative.compHeadline}</p>
                  <ul className="space-y-1.5 text-ink-soft text-xs">
                    {narrative.compBullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-none bg-blue" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {compDetails && compDetails.competitors.length > 0 && (
                  <details className="text-xs text-ink-soft">
                    <summary className="cursor-pointer font-medium text-ink select-none text-sm mb-3">
                      Competitor profiles ({compDetails.competitors.length} analyzed)
                    </summary>
                    <div className="space-y-1.5">
                      {compDetails.competitors.map((c, i) => (
                        <div key={i} className="p-3 bg-bg-soft rounded-lg flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-ink">{c.name}</p>
                            {c.domain && <p className="text-ink-soft">{c.domain}</p>}
                          </div>
                          <div className="flex gap-2 flex-none">
                            {c.hasBlog && (
                              <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-medium">Blog</span>
                            )}
                            {c.hasStructuredData && (
                              <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-medium">Schema</span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              c.estimatedContentDepth === "deep"
                                ? "bg-green-50 text-green-700"
                                : c.estimatedContentDepth === "moderate"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}>
                              {c.estimatedContentDepth} content
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* ── Email gate ──────────────────────────────────── */}
            <div className="p-6 bg-white border border-line rounded-site shadow-sm">
              {emailSent ? (
                <div className="text-center py-3">
                  <p className="text-sm font-semibold text-green-700">
                    Full report sent! Check your inbox.
                  </p>
                </div>
              ) : !showEmailGate ? (
                <div>
                  <h3 className="text-sm font-bold text-ink mb-2">Get the full report in your inbox</h3>
                  <ul className="text-xs text-ink-soft mb-4 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full flex-none bg-blue" />
                      Complete strategic analysis with specific recommendations
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full flex-none bg-blue" />
                      Competitor profiles with content depth and technical signals compared to yours
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full flex-none bg-blue" />
                      Prioritized action items you can hand to your team or agency
                    </li>
                  </ul>
                  <button
                    onClick={() => setShowEmailGate(true)}
                    className="w-full py-3 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark transition-all cursor-pointer border-none"
                  >
                    Send me the full report — free &rarr;
                  </button>
                  <p className="text-xs text-ink-soft text-center mt-2">
                    100% free &middot; no credit card &middot; takes 10 seconds
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-ink mb-2">
                    Enter your email to get the full report
                  </p>
                  <p className="text-xs text-ink-soft mb-3">
                    Free — includes strategic assessment, competitor comparison, prioritized fixes, and your personalized next step. No spam, no card.
                  </p>
                  <form onSubmit={handleEmailGate} className="flex gap-2.5">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="flex-1 px-4 py-3 rounded-[10px] border border-line text-sm placeholder:text-[#9AA3AF] focus:outline-2 focus:outline-blue focus:outline-offset-1"
                    />
                    <button
                      type="submit"
                      disabled={emailSending}
                      className="px-5 py-3 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark transition-all cursor-pointer border-none whitespace-nowrap disabled:opacity-70"
                    >
                      {emailSending ? "Sending…" : "Send report"}
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        )}

        <p className="mt-4 text-center text-xs text-ink-soft">
          No credit card required &middot; Results in ~2 minutes
        </p>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-navy text-[#9FB0C9] py-8 mt-16">
        <div className="max-w-site mx-auto px-7 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
              <path d="M13 1L24 7.5V18.5L13 25L2 18.5V7.5L13 1Z" stroke="#7FA0FF" strokeWidth="1.8" />
              <circle cx="13" cy="13" r="4.5" fill="#7FA0FF" />
            </svg>
            <span className="text-white font-bold">
              Bluu<span className="text-[#7FA0FF]">HQ</span>
            </span>
          </div>
          <span>&copy; {new Date().getFullYear()} Bluu HQ. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
