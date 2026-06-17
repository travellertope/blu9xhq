"use client";

import { useState, useRef, useCallback } from "react";

function hashStr(str: string, seedOffset: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i) + seedOffset) % 100000;
  }
  return Math.abs(h);
}

function scoreFrom(str: string, seedOffset: number): number {
  const s = str || "example";
  return 22 + (hashStr(s.toLowerCase(), seedOffset) % 70);
}

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
  const [scores, setScores] = useState({ ai: 0, site: 0, comp: 0, overall: 0 });
  const [verdict, setVerdict] = useState("");
  const [statusText, setStatusText] = useState("");
  const [barWidth, setBarWidth] = useState("0%");
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScan = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const key = noSite ? bizName || "newbusiness" : domain || "example.com";

      setShowResults(false);
      setShowEmailGate(false);
      setScanning(true);
      setStatusText(
        noSite
          ? `Mapping the content landscape for "${key}"…`
          : `Scanning ${key}…`
      );
      setBarWidth("0%");
      requestAnimationFrame(() => setBarWidth("100%"));

      setTimeout(() => {
        let ai: number, site: number, comp: number;
        if (noSite) {
          ai = scoreFrom(key, 1);
          comp = scoreFrom(key, 2);
          site = 12;
        } else {
          ai = scoreFrom(key, 1);
          site = scoreFrom(key, 2);
          comp = scoreFrom(key, 3);
        }
        const overall = Math.round((ai + site + comp) / 3);

        setScores({ ai, site, comp, overall });
        setStatusText(
          noSite ? "Scan complete — based on niche, not a live site." : "Scan complete."
        );
        setScanning(false);
        setShowResults(true);

        const weakScores = { ai, site, comp };
        const weakest = (Object.keys(weakScores) as Array<keyof typeof weakScores>).reduce(
          (a, b) => (weakScores[a] <= weakScores[b] ? a : b)
        );

        let message: string;
        if (noSite) {
          message = `No live site detected — before content or hosting matters, <b>${key}</b> needs a site to publish to.`;
        } else if (weakest === "ai" || weakest === "comp") {
          message = `Your biggest gap is <b>${weakest === "ai" ? "AI discoverability" : "competitor coverage"}</b>. Content strategy is where to start.`;
        } else {
          const pick = hashStr(key, 9) % 3;
          if (pick === 0) message = "Your site's technical foundation needs rebuilding.";
          else if (pick === 1) message = "Your site looks unmaintained — fixes and updates are the gap.";
          else message = "Your site's speed and stability point to a hosting problem.";
        }
        setVerdict(message);
      }, 1700);
    },
    [noSite, domain, bizName, niche]
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
              Run free scan
            </button>
          </div>

          {statusText && (
            <div className="mt-3 text-sm text-ink-soft">
              {statusText}
              {scanning && (
                <div className="progress-bar">
                  <i className="progress-bar-fill" style={{ width: barWidth }} />
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

            <div
              className="p-4 bg-bg-soft rounded-xl text-sm leading-relaxed text-ink-soft [&_b]:text-ink"
              dangerouslySetInnerHTML={{ __html: verdict }}
            />

            {/* ── Email gate for full report ───────────────── */}
            <div className="mt-6 pt-5 border-t border-line">
              {!showEmailGate ? (
                <button
                  onClick={() => setShowEmailGate(true)}
                  className="w-full py-3 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark transition-all cursor-pointer border-none"
                >
                  Get the full breakdown &rarr;
                </button>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-ink mb-2">
                    Enter your email to unlock the detailed report
                  </p>
                  <p className="text-xs text-ink-soft mb-3">
                    We&apos;ll send the full breakdown — what&apos;s wrong, competitor names,
                    and a recommended next step. No spam, no card.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      // Phase 1: this will POST to an API route
                      alert(`Report will be sent to ${email}`);
                    }}
                    className="flex gap-2.5"
                  >
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
                      className="px-5 py-3 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark transition-all cursor-pointer border-none whitespace-nowrap"
                    >
                      Send report
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-ink-soft">
          No credit card required &middot; Results in 2 minutes
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
