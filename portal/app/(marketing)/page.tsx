"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

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

interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-line">
      <button
        className="w-full text-left bg-transparent border-none py-5 px-1 flex items-center justify-between cursor-pointer text-base font-bold text-ink"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {question}
        <span
          className="text-xl text-blue transition-transform duration-200 flex-none ml-3.5 font-normal"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </button>
      <div
        ref={answerRef}
        className="overflow-hidden transition-all duration-250"
        style={{
          maxHeight: open ? answerRef.current?.scrollHeight + "px" : "0px",
        }}
      >
        <p className="px-1 pb-5 text-ink-soft text-sm leading-relaxed max-w-[640px]">
          {answer}
        </p>
      </div>
    </div>
  );
}

const faqs: FaqItemProps[] = [
  {
    question: "What is an AI visibility score?",
    answer:
      "It’s a measure of whether AI tools like ChatGPT, Perplexity, and Google’s AI Overviews actually surface your brand when someone asks a relevant question — separate from, but related to, traditional search rankings.",
  },
  {
    question: "Is this different from a normal SEO audit?",
    answer:
      "Yes. A standard SEO audit checks how Google ranks your pages. This also checks whether AI answer engines cite or recommend you at all, which depends on different signals like structured data and content clarity.",
  },
  {
    question: "Do I need a website to run the scan?",
    answer:
      'No. Tick "no website yet" and tell us your business and niche instead — we’ll show you what’s already being published in your space and whether a site needs to exist before anything else.',
  },
  {
    question: "Is the scan really free?",
    answer:
      "Yes, no card required. You’ll see your top results immediately; a fuller breakdown is sent to your email.",
  },
  {
    question: "What happens after I get my results?",
    answer:
      "We point you to whichever of our four services matches what the scan found — content, a new site, ongoing site management, or hosting — and you can book a short call if you want a second opinion.",
  },
];

export default function HomePage() {
  const [noSite, setNoSite] = useState(false);
  const [domain, setDomain] = useState("");
  const [bizName, setBizName] = useState("");
  const [niche, setNiche] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState({ ai: 0, site: 0, comp: 0, overall: 0 });
  const [verdict, setVerdict] = useState<{ message: string; targetId: string }>({
    message: "",
    targetId: "",
  });
  const [statusText, setStatusText] = useState("");
  const [barWidth, setBarWidth] = useState("0%");
  const [pulseId, setPulseId] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScan = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const key = noSite ? bizName || "newbusiness" : domain || "example.com";

      setShowResults(false);
      setScanning(true);
      setStatusText(
        noSite
          ? `Mapping the content landscape for “${key}”…`
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

        let targetId: string;
        let message: string;

        if (noSite) {
          targetId = "card-web-mobile-dev";
          message = `No live site detected — before content or hosting matters, <b>${key}</b> needs a site to publish to. <a href="/services/web-mobile-dev" class="text-blue font-bold hover:underline">See Web &amp; App Dev →</a>`;
        } else if (weakest === "ai" || weakest === "comp") {
          targetId = "card-content-ops";
          message = `Your biggest gap is <b>${weakest === "ai" ? "AI discoverability" : "competitor coverage"}</b>. <a href="/content-ops" class="text-blue font-bold hover:underline">See Content Ops →</a>`;
        } else {
          const pick = hashStr(key, 9) % 3;
          if (pick === 0) {
            targetId = "card-web-mobile-dev";
            message =
              'Your site\'s technical foundation needs rebuilding. <a href="/services/web-mobile-dev" class="text-blue font-bold hover:underline">See Web &amp; App Dev →</a>';
          } else if (pick === 1) {
            targetId = "card-web-manage";
            message =
              'Your site looks unmaintained — fixes and updates are the gap. <a href="/services/web-manage" class="text-blue font-bold hover:underline">See Web Management →</a>';
          } else {
            targetId = "card-hosting";
            message =
              'Your site\'s speed and stability point to a hosting problem. <a href="/services/hosting" class="text-blue font-bold hover:underline">See Hosting →</a>';
          }
        }

        setVerdict({ message, targetId });
        setPulseId("");

        setTimeout(() => {
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            setPulseId(targetId);
          }
        }, 500);
      }, 1700);
    },
    [noSite, domain, bizName, niche]
  );

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="py-16 md:pb-22" id="top">
        <div className="max-w-site mx-auto px-7 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
              Free 2-minute scan
            </span>
            <h1 className="font-display text-[36px] md:text-[46px] font-extrabold leading-[1.12] tracking-tight">
              Most brands are invisible
              <br />
              to AI search.
              <span className="text-blue block">
                See your AI visibility score — free.
              </span>
            </h1>
            <p className="mt-4 max-w-[480px] text-ink-soft text-[17px] leading-relaxed">
              Run a quick scan to check your AI discoverability, site health,
              and content gaps — then get a clear next step, whether that&apos;s
              content, your site, or both.
            </p>

            <form onSubmit={handleScan} id="demoForm">
              <label className="flex items-center gap-2 text-[13px] text-ink-soft cursor-pointer select-none mt-5 mb-3">
                <input
                  type="checkbox"
                  checked={noSite}
                  onChange={() => {
                    setNoSite(!noSite);
                    setShowResults(false);
                    setStatusText("");
                  }}
                  className="accent-[#2F5FE0]"
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
                    className="flex-1 min-w-[170px] px-4 py-3.5 rounded-[10px] border-[1.5px] border-line bg-white text-ink text-[15px] placeholder:text-[#9AA3AF] focus-visible:outline-[2.5px] focus-visible:outline-blue focus-visible:outline-offset-1"
                  />
                ) : (
                  <div className="flex gap-2.5 flex-1 min-w-[260px]">
                    <input
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      placeholder="Business name"
                      className="flex-1 px-4 py-3.5 rounded-[10px] border-[1.5px] border-line bg-white text-ink text-[15px] placeholder:text-[#9AA3AF] focus-visible:outline-[2.5px] focus-visible:outline-blue focus-visible:outline-offset-1"
                    />
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="Niche, e.g. SaaS"
                      className="flex-1 px-4 py-3.5 rounded-[10px] border-[1.5px] border-line bg-white text-ink text-[15px] placeholder:text-[#9AA3AF] focus-visible:outline-[2.5px] focus-visible:outline-blue focus-visible:outline-offset-1"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={scanning}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark hover:shadow-[0_10px_24px_-8px_rgba(47,95,224,0.55)] transition-all cursor-pointer border-[1.5px] border-transparent whitespace-nowrap disabled:opacity-70"
                >
                  Run free scan
                </button>
              </div>
            </form>

            {statusText && (
              <div className="mt-3.5 text-[13.5px] text-ink-soft min-h-[18px]">
                {statusText}
                {scanning && (
                  <div className="progress-bar">
                    <i
                      className="progress-bar-fill"
                      style={{ width: barWidth }}
                    />
                  </div>
                )}
              </div>
            )}

            <p className="mt-3.5 text-[13px] text-ink-soft">
              No credit card &middot; or{" "}
              <Link
                href="/contact"
                className="text-blue font-semibold"
              >
                book a 15-minute call &rarr;
              </Link>
            </p>

            {/* Results card */}
            {showResults && (
              <div
                ref={resultsRef}
                className="mt-6 p-6 bg-white border border-line rounded-[14px] shadow-[0_16px_36px_-20px_rgba(14,26,46,0.16)] animate-fadein"
              >
                <div className="flex items-baseline gap-2.5 mb-4">
                  <span
                    className="text-[42px] font-extrabold font-display"
                    style={{ color: bandColor(scores.overall) }}
                  >
                    {scores.overall}
                  </span>
                  <span className="text-[13px] text-ink-soft">/ 100 overall</span>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "AI discoverability", val: scores.ai },
                    { label: "Site & tech health", val: scores.site },
                    { label: "Competitor intel", val: scores.comp },
                  ].map((p) => (
                    <div key={p.label} className="flex items-center gap-3">
                      <span className="w-32 text-[13px] text-ink-soft flex-none">
                        {p.label}
                      </span>
                      <span className="pillar-track bg-bg-soft">
                        <span
                          className="pillar-fill"
                          style={{
                            width: `${p.val}%`,
                            background: bandColor(p.val),
                          }}
                        />
                      </span>
                      <span className="w-[38px] text-right text-[13px] font-bold flex-none">
                        {p.val}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-5 p-3.5 bg-bg-soft rounded-xl text-[13.5px] leading-relaxed text-ink-soft [&_b]:text-ink"
                  dangerouslySetInnerHTML={{ __html: verdict.message }}
                />
              </div>
            )}
          </div>

          {/* Sample report card */}
          <div className="demo-card hidden lg:flex" aria-hidden="true">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2F9E63] shadow-[0_0_0_4px_rgba(47,158,99,0.25)]" />
                <span className="text-xs text-[#9FB0C9] font-semibold">
                  SAMPLE REPORT
                </span>
              </div>
              <span className="text-xs text-[#9FB0C9] opacity-60">
                bluuhq.com/scan
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2.5 mb-4">
                <span className="text-[42px] font-extrabold font-display text-[#D9A22A]">
                  78
                </span>
                <span className="text-[13px] text-[#9FB0C9]">/ 100 overall</span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "AI discoverability", val: 64, color: "#D9A22A" },
                  { label: "Site & tech health", val: 91, color: "#2F9E63" },
                  { label: "Competitor intel", val: 79, color: "#2F9E63" },
                ].map((p) => (
                  <div key={p.label} className="flex items-center gap-3">
                    <span className="w-32 text-[13px] text-[#C7D2E3] flex-none">
                      {p.label}
                    </span>
                    <span className="pillar-track bg-navy-soft">
                      <span
                        className="pillar-fill"
                        style={{ width: `${p.val}%`, background: p.color }}
                      />
                    </span>
                    <span className="w-[38px] text-right text-[13px] font-bold flex-none">
                      {p.val}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-3.5 bg-navy-soft rounded-xl text-[13.5px] leading-relaxed text-[#D7E0EE]">
                <b className="text-white">Biggest opportunity:</b> AI
                discoverability — most AI tools can&apos;t find this brand yet.{" "}
                <Link href="/content-ops" className="text-blue font-bold hover:underline">
                  See Content Ops &rarr;
                </Link>
              </div>
            </div>
            <div className="text-xs text-[#7E8FA8] tracking-wide pt-4 border-t border-navy-soft mt-2">
              Checked 42 pages &middot; 3 competitor sites &middot; 18 AI search
              prompts
            </div>
          </div>
        </div>
      </section>

      {/* ── What the scan checks ─────────────────────────────────── */}
      <section className="mkt-section">
        <div className="max-w-site mx-auto px-7 text-center">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
            What the scan checks
          </span>
          <h2 className="font-display text-[30px] md:text-[38px] font-extrabold leading-tight">
            Three things, in about two minutes.
          </h2>
          <p className="max-w-[600px] mx-auto text-ink-soft text-[17px] leading-relaxed mt-3.5">
            No fluff metrics. Just whether AI and search can actually find you,
            and what to do if they can&apos;t.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="3" stroke="#2F5FE0" strokeWidth="1.6" />
                    <path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.5 3.5l2 2M14.5 14.5l2 2M16.5 3.5l-2 2M5.5 14.5l-2 2" stroke="#2F5FE0" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                ),
                title: "AI discoverability",
                desc: "Whether ChatGPT, Perplexity, and Google’s AI Overviews actually surface your brand when it matters.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2 18l5-5 4 4 7-9" stroke="#2F5FE0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Site & technical health",
                desc: "Page speed, crawlability, and the technical groundwork AI and search both need to find you at all.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="8.5" cy="8.5" r="6" stroke="#2F5FE0" strokeWidth="1.6" />
                    <path d="M13.2 13.2L18 18" stroke="#2F5FE0" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ),
                title: "Competitor intel",
                desc: "What’s already being published in your space — and what’s sitting open for you to take.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white border border-line rounded-[14px] p-7 border-t-[3px] border-t-blue text-left"
              >
                <div className="w-[42px] h-[42px] rounded-[10px] bg-blue-soft flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="font-display text-lg font-bold mb-2.5">{card.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="callout-coral rounded-[14px] p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-14">
            <div>
              <h3 className="font-display text-[17px] font-bold mb-1.5">
                Don&apos;t have a website yet?
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed max-w-[560px]">
                The scan still works. Tick &quot;no website yet&quot; above and
                tell us your business and niche — we&apos;ll show you the
                landscape you&apos;re stepping into, and whether a site needs to
                come first.
              </p>
            </div>
            <Link
              href="#demoForm"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[10px] text-[13px] font-bold border border-line text-ink hover:border-blue hover:text-blue transition-colors whitespace-nowrap"
            >
              Run the scan anyway &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── After your scan ──────────────────────────────────────── */}
      <section className="mkt-section bg-bg-soft" id="next">
        <div className="max-w-site mx-auto px-7 text-center">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
            After your scan
          </span>
          <h2 className="font-display text-[30px] md:text-[38px] font-extrabold leading-tight">
            One result, four ways we can help.
          </h2>
          <p className="max-w-[600px] mx-auto text-ink-soft text-[17px] leading-relaxed mt-3.5">
            Your scan points to exactly one of these. We don&apos;t sell you all
            four — just the one you actually need.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-14 text-left">
            {[
              {
                id: "card-content-ops",
                color: "blue",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 5h14M2 9h10M2 13h7" stroke="#2F5FE0" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ),
                title: "Content Ops",
                desc: "If your content is the gap, we run research, writing, publishing, and reporting as one monthly retainer.",
                href: "/content-ops",
              },
              {
                id: "card-web-mobile-dev",
                color: "coral",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="2" width="14" height="10" rx="1.5" stroke="#E2543D" strokeWidth="1.6" />
                    <path d="M6 16h6" stroke="#E2543D" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                ),
                title: "Web & App Dev",
                desc: "If there’s no site yet, or it needs rebuilding, we design and build it from scratch.",
                href: "/services/web-mobile-dev",
              },
              {
                id: "card-web-manage",
                color: "coral",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2l6 3v4c0 4-3 6-6 7-3-1-6-3-6-7V5l6-3z" stroke="#E2543D" strokeWidth="1.6" />
                  </svg>
                ),
                title: "Web Management",
                desc: "If your site exists but nobody’s keeping it current, we take over updates, fixes, and improvements.",
                href: "/services/web-manage",
              },
              {
                id: "card-hosting",
                color: "coral",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="3" width="14" height="4.5" rx="1.2" stroke="#E2543D" strokeWidth="1.6" />
                    <rect x="2" y="10.5" width="14" height="4.5" rx="1.2" stroke="#E2543D" strokeWidth="1.6" />
                  </svg>
                ),
                title: "Hosting",
                desc: "If your site is slow or unreliable, we move it to infrastructure that’s actually maintained.",
                href: "/services/hosting",
              },
            ].map((scard) => (
              <div
                key={scard.id}
                id={scard.id}
                className={`bg-white border border-line rounded-[14px] p-6 md:p-7 transition-all duration-200 ${
                  scard.color === "coral"
                    ? "border-l-4 border-l-[#E2543D]"
                    : "border-l-4 border-l-blue"
                } ${pulseId === scard.id ? "scard-pulse" : ""}`}
              >
                <div className="w-[42px] h-[42px] rounded-[10px] bg-blue-soft flex items-center justify-center mb-3.5">
                  {scard.icon}
                </div>
                <h3 className="font-display text-[17px] font-bold mb-2">
                  {scard.title}
                </h3>
                <p className="text-ink-soft text-sm leading-relaxed mb-3.5">
                  {scard.desc}
                </p>
                <Link
                  href={scard.href}
                  className="text-[13.5px] font-bold text-blue hover:underline"
                >
                  Learn more &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────── */}
      <div className="py-12 text-center text-ink-soft text-sm font-semibold">
        Trusted by SaaS teams, agencies, and DTC brands to keep their content —
        and their visibility — running.
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="mkt-section" id="faq">
        <div className="max-w-site mx-auto px-7 text-center">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
            FAQ
          </span>
          <h2 className="font-display text-[30px] md:text-[38px] font-extrabold leading-tight">
            Questions worth answering up front.
          </h2>
        </div>
        <div className="max-w-[720px] mx-auto mt-12 px-7">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} {...faq} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="cta-gradient py-22 text-center">
        <div className="max-w-site mx-auto px-7">
          <h2 className="font-display text-[28px] md:text-[34px] font-extrabold max-w-[560px] mx-auto leading-[1.2]">
            Ready to see where you stand?
          </h2>
          <p className="max-w-[600px] mx-auto text-ink-soft text-[17px] leading-relaxed mt-4">
            Run the free scan, or skip straight to a conversation.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 mt-7">
            <Link
              href="#top"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark hover:shadow-[0_10px_24px_-8px_rgba(47,95,224,0.55)] transition-all"
            >
              Run your free scan
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-[10px] text-sm font-bold bg-white text-ink border border-line hover:border-blue hover:text-blue transition-colors"
            >
              Book a Discovery Call
            </Link>
          </div>
          <p className="mt-4 text-[13px] text-ink-soft">
            Limited monthly capacity
          </p>
        </div>
      </section>
    </>
  );
}
