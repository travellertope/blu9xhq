"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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
  mentioned: boolean;
  position: string;
  sentiment: string;
  snippet: string;
}

interface CompDetails {
  competitors: string[];
  brandMentionedMoreThanCompetitors: boolean;
}

interface SiteDetails {
  https: boolean;
  hasTitle: boolean;
  hasDescription: boolean;
  hasOgTags: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  hasStructuredData: boolean;
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
  gated: boolean;
  error: string | null;
}

const SITE_FIX_LABELS: Array<{ key: keyof SiteDetails; label: string }> = [
  { key: "https", label: "Move to HTTPS" },
  { key: "hasTitle", label: "Add a descriptive page title" },
  { key: "hasDescription", label: "Add a meta description" },
  { key: "hasOgTags", label: "Add Open Graph tags" },
  { key: "hasStructuredData", label: "Add structured data (schema.org)" },
  { key: "hasRobotsTxt", label: "Add a robots.txt file" },
  { key: "hasSitemap", label: "Add an XML sitemap" },
];

function bandColor(v: number): string {
  if (v < 45) return "#E2543D";
  if (v < 70) return "#D9A22A";
  return "#2F9E63";
}

export default function ScanPage() {
  const [noSite, setNoSite] = useState(false);
  const [domain, setDomain] = useState("");
  const [bizName, setBizName] = useState("");
  const [niche, setNiche] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState<ScanScores>({ ai: 0, site: 0, comp: 0, overall: 0 });
  const [verdict, setVerdict] = useState<ScanVerdict | null>(null);
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

  // Auto-run the scan when arriving from the homepage form with a
  // domain/brand already in the query string, instead of showing an
  // empty form the visitor has to resubmit.
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
    // Only ever run on initial load from the incoming URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        }
      } catch {
        // Silently handle
      }
      setEmailSending(false);
    },
    [email]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* ── Minimal header ──────────────────────────────────────── */}
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
            Book a call &rarr;
          </a>
        </div>
      </header>

      {/* ── Scan form ───────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-7 py-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
            Free AI visibility scan
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
            See if AI search can find your brand.
          </h1>
          <p className="mt-3 text-ink-soft text-base leading-relaxed max-w-lg mx-auto">
            Run a quick scan to check your AI discoverability, site health, and
            content gaps. Takes about two minutes.
          </p>
        </div>

        <form
          onSubmit={handleScan}
          className="bg-white border border-line rounded-site p-6 shadow-sm"
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

        {/* ── Results ─────────────────────────────────────────── */}
        {showResults && (
          <div
            ref={resultsRef}
            className="mt-6 p-6 bg-white border border-line rounded-site shadow-sm animate-fadein"
          >
            <div className="flex items-baseline gap-2.5 mb-5">
              <span
                className="text-[42px] font-extrabold font-display"
                style={{ color: bandColor(scores.overall) }}
              >
                {scores.overall}
              </span>
              <span className="text-sm text-ink-soft">/ 100 overall</span>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: "AI discoverability", val: scores.ai },
                { label: "Site & tech health", val: scores.site },
                { label: "Competitor intel", val: scores.comp },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-ink-soft flex-none">{p.label}</span>
                  <span className="pillar-track bg-bg-soft">
                    <span
                      className="pillar-fill"
                      style={{ width: `${p.val}%`, background: bandColor(p.val) }}
                    />
                  </span>
                  <span className="w-9 text-right text-sm font-bold flex-none">{p.val}</span>
                </div>
              ))}
            </div>

            {verdict && (
              <div className="p-4 bg-bg-soft rounded-xl text-sm leading-relaxed text-ink-soft mb-4">
                <p className="font-semibold text-ink mb-1">{verdict.message}</p>
                <p>{verdict.recommendation}</p>
                <a
                  href={verdict.serviceUrl}
                  className="inline-block mt-2 text-blue font-semibold text-xs hover:underline"
                >
                  See how we can help &rarr;
                </a>
              </div>
            )}

            {/* ── AI detail breakdown (ungated) ────────────── */}
            {aiDetails && aiDetails.length > 0 && (
              <div className="mt-4 mb-4">
                <h3 className="text-sm font-bold text-ink mb-3">AI Discoverability Breakdown</h3>
                <div className="space-y-2">
                  {aiDetails.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-bg-soft rounded-lg text-xs">
                      <span className={`mt-0.5 w-2 h-2 rounded-full flex-none ${d.mentioned ? "bg-green-500" : "bg-red-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink">{d.prompt}</p>
                        {d.mentioned ? (
                          <p className="text-ink-soft mt-0.5">
                            {d.position} position &middot; {d.sentiment} sentiment
                            {d.snippet && <span className="block mt-1 italic text-[11px]">&ldquo;{d.snippet}&rdquo;</span>}
                          </p>
                        ) : (
                          <p className="text-ink-soft mt-0.5">Not mentioned</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Competitor names (gated) ──────────────────── */}
            {compDetails && compDetails.competitors.length > 0 && (
              <div className="mt-4 mb-4">
                <h3 className="text-sm font-bold text-ink mb-3">Who AI Recommends Instead</h3>
                <div className="flex flex-wrap gap-2">
                  {compDetails.competitors.map((c, i) => (
                    <span key={i} className="text-xs font-medium px-3 py-1.5 bg-bg-soft rounded-full text-ink">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Prioritized fixes (gated) ─────────────────── */}
            {siteDetails && (
              <div className="mt-4 mb-4">
                <h3 className="text-sm font-bold text-ink mb-3">Prioritized Fixes</h3>
                <div className="space-y-1.5">
                  {SITE_FIX_LABELS.filter((f) => !siteDetails[f.key]).map((f) => (
                    <div key={f.key} className="flex items-start gap-2 text-xs text-ink-soft">
                      <span className="mt-0.5 w-2 h-2 rounded-full flex-none bg-red-400" />
                      {f.label}
                    </div>
                  ))}
                  {SITE_FIX_LABELS.every((f) => siteDetails[f.key]) && (
                    <p className="text-xs text-ink-soft">Nice — no technical gaps found.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Email gate for full report ───────────────── */}
            <div className="mt-6 pt-5 border-t border-line">
              {emailSent ? (
                <div className="text-center py-3">
                  <p className="text-sm font-semibold text-green-700">
                    Report sent! Check your inbox.
                  </p>
                </div>
              ) : !showEmailGate ? (
                <div>
                  <ul className="text-xs text-ink-soft mb-3 space-y-1.5">
                    <li>&bull; Every AI prompt we tested, with your exact position and sentiment</li>
                    <li>&bull; The competitors AI recommends instead of you, by name</li>
                    <li>&bull; A prioritized fix list for site health and content gaps</li>
                    <li>&bull; One clear next step based on your weakest score</li>
                  </ul>
                  <button
                    onClick={() => setShowEmailGate(true)}
                    className="w-full py-3 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark transition-all cursor-pointer border-none"
                  >
                    Get the full breakdown — free &rarr;
                  </button>
                  <p className="text-xs text-ink-soft text-center mt-2">
                    100% free &middot; no credit card &middot; takes 10 seconds
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-ink mb-2">
                    Enter your email to unlock the detailed report
                  </p>
                  <p className="text-xs text-ink-soft mb-3">
                    Free — we&apos;ll send the full breakdown — what&apos;s wrong, competitor names,
                    and a recommended next step. No spam, no card.
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

      {/* ── Minimal footer ──────────────────────────────────────── */}
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
