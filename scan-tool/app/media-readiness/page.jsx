"use client";

import { useState } from "react";

// ─── Brand Tokens ───
const T = {
  terra: "#B84A1C", terraLight: "#D4764A", terraPale: "#F5E6DC",
  cream: "#FAF6F1", dark: "#1A1715", mid: "#6B6560", light: "#B5AFA9",
  border: "#E8E2DB", white: "#FFFFFF",
  green: "#2D6A4F", greenBg: "#E8F5EC",
  amber: "#946B00", amberBg: "#FFF8E1",
  red: "#B83230", redBg: "#FEF0F0",
};
const F = {
  serif: "'Georgia','Times New Roman',serif",
  sans: "'Inter',-apple-system,'Segoe UI',sans-serif",
};

// ─── Atoms ───
const Eyebrow = ({ children, style }) => (
  <p style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: T.terra, marginBottom: 8, ...style }}>{children}</p>
);

const Btn = ({ children, onClick, variant = "terra", disabled, style }) => {
  const base = { fontFamily: F.sans, fontSize: 14, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", border: "none", borderRadius: 0, cursor: disabled ? "default" : "pointer", padding: "16px 32px", transition: "all 0.2s", opacity: disabled ? 0.4 : 1, width: "100%", display: "block" };
  const v = { terra: { ...base, background: T.terra, color: T.white }, dark: { ...base, background: T.dark, color: T.white }, outline: { ...base, background: "transparent", color: T.dark, border: `1px solid ${T.dark}` } };
  return <button style={{ ...v[variant], ...style }} onClick={onClick} disabled={disabled} onMouseEnter={e => { if (!disabled) e.target.style.opacity = "0.85"; }} onMouseLeave={e => { e.target.style.opacity = disabled ? "0.4" : "1"; }}>{children}</button>;
};

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div style={{ marginBottom: 20 }}>
    {label && <label style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 500, color: T.mid, display: "block", marginBottom: 6 }}>{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ fontFamily: F.sans, fontSize: 15, padding: "14px 16px", border: `1px solid ${T.border}`, borderRadius: 0, width: "100%", boxSizing: "border-box", background: T.white, outline: "none", transition: "border 0.2s", color: T.dark }} onFocus={e => e.target.style.borderColor = T.terra} onBlur={e => e.target.style.borderColor = T.border} />
  </div>
);

// ═══════════════════════════════════════════
// QUESTIONS — each contributes to PR, Wiki, or both
// ═══════════════════════════════════════════
const questions = [
  {
    id: "type", label: "Who is this assessment for?",
    note: "We'll tailor your results based on your answer.",
    options: [
      { text: "A person — founder, creative, or public figure", pr: 0, wiki: 0 },
      { text: "An organisation, company, or brand", pr: 0, wiki: 0 },
      { text: "A creative project — film, album, book, exhibition", pr: 0, wiki: 0 },
    ],
  },
  {
    id: "story", label: "Do you have a clearly defined brand story or mission?",
    note: "Media needs a compelling narrative to cover. Wikipedia editors look for subjects with a distinct, documentable identity.",
    options: [
      { text: "Yes — well-articulated and documented", pr: 10, wiki: 3 },
      { text: "Somewhat — we know what we stand for but haven't formalised it", pr: 5, wiki: 1 },
      { text: "Not yet", pr: 1, wiki: 0 },
    ],
  },
  {
    id: "assets", label: "Do you have professional brand assets — logo, high-quality photos, brand guidelines?",
    note: "These are table stakes for any media engagement. Journalists and editors won't cover what they can't illustrate.",
    options: [
      { text: "Yes, a complete set ready to share", pr: 10, wiki: 2 },
      { text: "We have some but they need work", pr: 5, wiki: 1 },
      { text: "Not really", pr: 1, wiki: 0 },
    ],
  },
  {
    id: "coverage", label: "Have you been covered in independent media publications?",
    note: "This is the single most important factor — for PR momentum and for Wikipedia notability. Wikipedia requires \"significant coverage in reliable, independent, secondary sources.\"",
    options: [
      { text: "Yes — 5 or more in-depth articles in established publications", pr: 12, wiki: 25 },
      { text: "A few times — 2 to 4 articles in known publications", pr: 8, wiki: 15 },
      { text: "Once or twice, or only in niche/local outlets", pr: 4, wiki: 6 },
      { text: "Never, or only in our own channels", pr: 0, wiki: 0 },
    ],
  },
  {
    id: "depth", label: "How substantial is that media coverage?",
    note: "A name dropped in a round-up is not the same as a dedicated profile or feature. Wikipedia values in-depth treatment; PR value correlates with depth too.",
    options: [
      { text: "In-depth profiles, features, or investigative pieces", pr: 8, wiki: 15 },
      { text: "A mix of features and shorter mentions", pr: 5, wiki: 9 },
      { text: "Mostly brief mentions, listings, or event round-ups", pr: 2, wiki: 3 },
      { text: "Not sure / haven't checked", pr: 1, wiki: 1 },
    ],
  },
  {
    id: "independence", label: "Were those publications independent of you?",
    note: "Paid advertorials, sponsored content, and press release pickups don't count toward Wikipedia notability — and they carry less weight in PR credibility too.",
    options: [
      { text: "Yes — all or nearly all were independent editorial coverage", pr: 8, wiki: 15 },
      { text: "Some were independent, some were paid or sponsored", pr: 5, wiki: 8 },
      { text: "Most were paid, sponsored, or press release pickups", pr: 2, wiki: 2 },
      { text: "Not sure what counts as independent", pr: 1, wiki: 1 },
    ],
  },
  {
    id: "presskit", label: "Do you have a press kit or media page?",
    note: "A press kit is your brand's handshake with the media — company overview, key facts, assets, and contact info in one place.",
    options: [
      { text: "Yes — up to date and ready to share", pr: 10, wiki: 3 },
      { text: "We have one but it's outdated", pr: 4, wiki: 1 },
      { text: "No", pr: 0, wiki: 0 },
      { text: "What's a press kit?", pr: 0, wiki: 0 },
    ],
  },
  {
    id: "releases", label: "Have you ever written or distributed a press release?",
    note: "Press releases are the foundation of proactive media outreach. They also generate the kind of coverage that supports Wikipedia citations.",
    options: [
      { text: "Yes, multiple times with media pickup", pr: 10, wiki: 6 },
      { text: "A few times but limited distribution", pr: 5, wiki: 3 },
      { text: "Never", pr: 0, wiki: 0 },
    ],
  },
  {
    id: "network", label: "Do you have relationships with journalists or media contacts?",
    note: "Media relationships are the engine of sustained coverage. Without them, every announcement starts from zero.",
    options: [
      { text: "Yes — a solid network we engage regularly", pr: 12, wiki: 4 },
      { text: "A few contacts but nothing structured", pr: 6, wiki: 2 },
      { text: "None", pr: 0, wiki: 0 },
    ],
  },
  {
    id: "social", label: "How would you describe your social media presence?",
    note: "Social media amplifies every piece of coverage and builds the public footprint that supports both PR and notability.",
    options: [
      { text: "Strong and consistent — we post regularly with good engagement", pr: 10, wiki: 4 },
      { text: "Active but inconsistent", pr: 5, wiki: 2 },
      { text: "Minimal or inactive", pr: 1, wiki: 0 },
    ],
  },
  {
    id: "awards", label: "Have you received notable awards, honours, or formal recognition?",
    note: "Awards from established institutions strengthen your notability case and give media a reason to cover you.",
    options: [
      { text: "Yes — multiple recognised awards or honours", pr: 6, wiki: 12 },
      { text: "One or two meaningful recognitions", pr: 4, wiki: 7 },
      { text: "Nominated but haven't won", pr: 2, wiki: 4 },
      { text: "None yet", pr: 0, wiki: 0 },
    ],
  },
  {
    id: "references", label: "Can you find references to yourself in third-party databases, directories, or archives?",
    note: "Industry databases, library catalogues, academic citations, IMDb, Discogs, or government registries — these are independent evidence of notability.",
    options: [
      { text: "Yes — present in multiple third-party databases", pr: 4, wiki: 10 },
      { text: "A few entries in one or two places", pr: 2, wiki: 5 },
      { text: "Only on our own website and social profiles", pr: 1, wiki: 1 },
      { text: "Haven't looked", pr: 0, wiki: 0 },
    ],
  },
  {
    id: "history", label: "How long have you or your organisation been active?",
    note: "Longevity builds credibility. A sustained track record strengthens both your PR positioning and Wikipedia's assessment of lasting notability.",
    options: [
      { text: "10+ years", pr: 4, wiki: 10 },
      { text: "5–10 years", pr: 3, wiki: 7 },
      { text: "2–5 years", pr: 2, wiki: 4 },
      { text: "Under 2 years", pr: 1, wiki: 1 },
    ],
  },
  {
    id: "budget", label: "How much do you currently invest in PR or communications monthly?",
    note: "Not a judgment — this helps us understand your current infrastructure and what level of support would make sense.",
    options: [
      { text: "Nothing yet", pr: 0, wiki: 0 },
      { text: "Under ₦100,000", pr: 5, wiki: 3 },
      { text: "₦100,000 – ₦500,000", pr: 8, wiki: 5 },
      { text: "Over ₦500,000", pr: 10, wiki: 7 },
    ],
  },
];

const PR_MAX = 119; // sum of max pr values
const WIKI_MAX = 130; // sum of max wiki values

// ─── Grading ───
const prGrade = (pct) => {
  if (pct >= 75) return { label: "PR-Ready", color: T.green, bg: T.greenBg, msg: "Your brand has strong PR foundations. You're positioned to scale with sustained media coverage and strategic partnerships." };
  if (pct >= 50) return { label: "Almost There", color: T.amber, bg: T.amberBg, msg: "Good groundwork. A few focused improvements — especially around press infrastructure and media relationships — will make a significant difference." };
  if (pct >= 25) return { label: "Building", color: T.terraLight, bg: T.terraPale, msg: "Some pieces are in place, but key PR infrastructure is missing. You need structured media outreach and professional press materials." };
  return { label: "Early Stage", color: T.red, bg: T.redBg, msg: "Your PR foundations need significant work. The good news — with the right infrastructure, you can build momentum quickly." };
};

const wikiGrade = (pct) => {
  if (pct >= 70) return { label: "Likely Qualifies", color: T.green, bg: T.greenBg, icon: "✓", msg: "Based on your answers, you meet or are close to meeting Wikipedia's notability guidelines. You appear to have sufficient independent coverage and third-party references." };
  if (pct >= 45) return { label: "Close — Gaps Remain", color: T.amber, bg: T.amberBg, icon: "◐", msg: "You have some foundations, but clear gaps exist — most likely in independent media coverage or depth of references. An article submitted now risks deletion." };
  if (pct >= 22) return { label: "Not Yet", color: T.terraLight, bg: T.terraPale, icon: "◔", msg: "Your current media footprint isn't strong enough for Wikipedia. Most subjects at this stage need 12–18 months of intentional media activity." };
  return { label: "Not Ready", color: T.red, bg: T.redBg, icon: "○", msg: "A Wikipedia article would almost certainly be rejected at this stage. The path to Wikipedia is the path to genuine notability — and it starts with independent media coverage." };
};

// ─── Gap analysis ───
const getGaps = (scores) => {
  const g = [];
  if (scores.coverage_pr < 8) g.push({ area: "Media Coverage Volume", severity: "critical", detail: "You lack sufficient media coverage. This is the #1 factor for both PR momentum and Wikipedia notability.", service: "Sponsored Content", price: "From ₦200,000" });
  if (scores.independence < 5) g.push({ area: "Source Independence", severity: "critical", detail: "Wikipedia explicitly excludes paid, sponsored, or self-published sources. Independent editorial coverage is non-negotiable.", service: "Media Partnership", price: "From ₦80,000" });
  if (scores.depth_pr < 5) g.push({ area: "Coverage Depth", severity: "high", detail: "Brief mentions don't build credibility or meet Wikipedia's standards. You need dedicated profiles and features.", service: "Sponsored Content", price: "From ₦200,000" });
  if (scores.presskit < 4) g.push({ area: "Press Infrastructure", severity: "high", detail: "Without a press kit and press release history, you're invisible to journalists. This is the foundation everything else builds on.", service: "Presskit (PR)", price: "From ₦80,000/mo" });
  if (scores.network < 6) g.push({ area: "Media Relationships", severity: "moderate", detail: "Without journalist relationships, every announcement starts from zero. Sustained partnerships build a distribution network over time.", service: "Media Partnership", price: "From ₦80,000" });
  if (scores.social < 5) g.push({ area: "Social Media Presence", severity: "moderate", detail: "Social media amplifies every piece of coverage. Inconsistent presence limits the reach and impact of your PR efforts.", service: "Content Amplification", price: "From ₦65,000" });
  if (scores.awards < 4) g.push({ area: "Awards & Recognition", severity: "low", detail: "Formal recognition strengthens your notability case. Proactive PR helps surface your work to award bodies and institutions.", service: "Presskit (PR)", price: "From ₦80,000/mo" });
  if (scores.references < 5) g.push({ area: "Third-Party References", severity: "low", detail: "Your presence in independent databases and directories is thin. Sustained PR activity naturally builds these references over time.", service: "Presskit (PR)", price: "From ₦80,000/mo" });
  return g;
};

const sevColor = s => s === "critical" ? T.red : s === "high" ? T.amber : s === "moderate" ? T.terraLight : T.light;
const sevLabel = s => s === "critical" ? "Critical" : s === "high" ? "Significant" : s === "moderate" ? "Moderate" : "Minor";

// ─── Score bar ───
const Bar = ({ label, pct }) => {
  const c = pct >= 65 ? T.green : pct >= 35 ? T.amber : T.red;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 500, color: T.dark }}>{label}</span>
        <span style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: c }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: T.border, borderRadius: 3 }}>
        <div style={{ height: 5, width: `${pct}%`, background: c, borderRadius: 3, transition: "width 1s ease" }} />
      </div>
    </div>
  );
};

// ─── Score Circle ───
const ScoreCircle = ({ score, label, color, size = 120 }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ width: size, height: size, borderRadius: "50%", border: `3px solid ${color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
      <span style={{ fontFamily: F.serif, fontSize: size * 0.34, fontWeight: 400, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", color, marginTop: 2 }}>/ 100</span>
    </div>
    <span style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: T.mid, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
  </div>
);

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [step, setStep] = useState(-1); // -1=intro, 0..13=questions, 14=email, 15=results
  const [answers, setAnswers] = useState({});
  const [sel, setSel] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [anim, setAnim] = useState(true);
  const totalQ = questions.length;

  const go = (n) => { setAnim(false); setTimeout(() => { setStep(n); setSel(null); setAnim(true); }, 220); };

  const pick = (qId, prVal, wikiVal, idx) => {
    setSel(idx);
    setAnswers(prev => ({ ...prev, [`${qId}_pr`]: prVal, [`${qId}_wiki`]: wikiVal }));
    setTimeout(() => go(step + 1), 380);
  };

  // Compute scores
  const prRaw = Object.entries(answers).filter(([k]) => k.endsWith("_pr")).reduce((s, [, v]) => s + v, 0);
  const wikiRaw = Object.entries(answers).filter(([k]) => k.endsWith("_wiki")).reduce((s, [, v]) => s + v, 0);
  const prPct = Math.min(100, Math.round((prRaw / PR_MAX) * 100));
  const wikiPct = Math.min(100, Math.round((wikiRaw / WIKI_MAX) * 100));
  const pr = prGrade(prPct);
  const wiki = wikiGrade(wikiPct);

  // Category pcts for breakdown
  const catPr = {
    "Brand Foundation": Math.min(100, Math.round((((answers.story_pr || 0) + (answers.assets_pr || 0)) / 20) * 100)),
    "Media Coverage": Math.min(100, Math.round((((answers.coverage_pr || 0) + (answers.depth_pr || 0) + (answers.independence_pr || 0)) / 28) * 100)),
    "Press Infrastructure": Math.min(100, Math.round((((answers.presskit_pr || 0) + (answers.releases_pr || 0)) / 20) * 100)),
    "Network & Distribution": Math.min(100, Math.round((((answers.network_pr || 0) + (answers.social_pr || 0)) / 22) * 100)),
    "Strategy & Investment": Math.min(100, Math.round(((answers.budget_pr || 0) / 10) * 100)),
  };
  const catWiki = {
    "Media Coverage (Volume)": Math.min(100, Math.round(((answers.coverage_wiki || 0) / 25) * 100)),
    "Coverage Depth": Math.min(100, Math.round(((answers.depth_wiki || 0) / 15) * 100)),
    "Source Independence": Math.min(100, Math.round(((answers.independence_wiki || 0) / 15) * 100)),
    "Awards & Recognition": Math.min(100, Math.round(((answers.awards_wiki || 0) / 12) * 100)),
    "Third-Party References": Math.min(100, Math.round(((answers.references_wiki || 0) / 10) * 100)),
    "Track Record": Math.min(100, Math.round(((answers.history_wiki || 0) / 10) * 100)),
  };

  const gaps = getGaps({
    coverage_pr: answers.coverage_pr || 0,
    depth_pr: answers.depth_pr || 0,
    independence: answers.independence_pr || 0,
    presskit: answers.presskit_pr || 0,
    network: answers.network_pr || 0,
    social: answers.social_pr || 0,
    awards: answers.awards_pr || 0,
    references: answers.references_wiki || 0,
  });

  const wrap = { minHeight: "100vh", background: T.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
  const fade = { opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(10px)", transition: "all 0.22s ease" };

  // ─── INTRO ───
  if (step === -1) return (
    <div style={wrap}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${T.terra}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: F.sans, fontSize: 16, fontWeight: 700, color: T.terra }}>PR</span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}><span style={{ color: T.light, fontSize: 18 }}>+</span></div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${T.dark}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: F.serif, fontSize: 22, color: T.dark }}>W</span>
          </div>
        </div>
        <Eyebrow>Free Assessment</Eyebrow>
        <h1 style={{ fontFamily: F.serif, fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 400, color: T.dark, lineHeight: 1.15, margin: "0 0 16px" }}>
          How Ready Is Your Brand<br />for the Press — and Wikipedia?
        </h1>
        <p style={{ fontFamily: F.sans, fontSize: 15, color: T.mid, lineHeight: 1.65, maxWidth: 460, margin: "0 auto 12px" }}>
          One assessment. Two scores. Answer 14 questions and get a personalised report showing your PR readiness and whether you qualify for a Wikipedia article.
        </p>
        <p style={{ fontFamily: F.sans, fontSize: 14, color: T.mid, lineHeight: 1.6, maxWidth: 440, margin: "0 auto 40px" }}>
          Most brands overestimate their media readiness. Most Wikipedia articles get rejected. This tool tells you exactly where you stand — and what to fix.
        </p>
        <Btn onClick={() => go(0)} style={{ maxWidth: 340, margin: "0 auto" }}>Start the Assessment →</Btn>
        <p style={{ fontFamily: F.sans, fontSize: 12, color: T.light, marginTop: 32 }}>Takes about 3 minutes. Full report sent to your email.</p>
        <p style={{ fontFamily: F.sans, fontSize: 11, color: T.light, marginTop: 20 }}>Built by <span style={{ color: T.terra, fontWeight: 600 }}>The Moveee</span> — media infrastructure for African brands.</p>
      </div>
    </div>
  );

  // ─── QUESTIONS ───
  if (step >= 0 && step < totalQ) {
    const q = questions[step];
    return (
      <div style={wrap}>
        <div style={{ maxWidth: 580, width: "100%", ...fade }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 44 }}>
            <div style={{ flex: 1, height: 3, background: T.border, borderRadius: 2 }}>
              <div style={{ height: 3, background: T.terra, borderRadius: 2, width: `${((step + 1) / totalQ) * 100}%`, transition: "width 0.4s ease" }} />
            </div>
            <span style={{ fontFamily: F.sans, fontSize: 12, color: T.light, fontWeight: 500, whiteSpace: "nowrap" }}>{step + 1} / {totalQ}</span>
          </div>
          <h2 style={{ fontFamily: F.serif, fontSize: "clamp(20px, 3.5vw, 27px)", fontWeight: 400, color: T.dark, lineHeight: 1.3, margin: "0 0 8px" }}>{q.label}</h2>
          {q.note && <p style={{ fontFamily: F.sans, fontSize: 13, color: T.mid, lineHeight: 1.55, margin: "0 0 28px" }}>{q.note}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {q.options.map((o, i) => (
              <button key={i} onClick={() => pick(q.id, o.pr, o.wiki, i)} style={{
                fontFamily: F.sans, fontSize: 15, lineHeight: 1.45, padding: "15px 20px", textAlign: "left", cursor: "pointer", borderRadius: 0, transition: "all 0.2s",
                color: sel === i ? T.white : T.dark, background: sel === i ? T.dark : T.white,
                border: `1px solid ${sel === i ? T.dark : T.border}`,
              }}
                onMouseEnter={e => { if (sel !== i) e.target.style.borderColor = T.terra; }}
                onMouseLeave={e => { if (sel !== i) e.target.style.borderColor = T.border; }}
              >{o.text}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── EMAIL GATE ───
  if (step === totalQ) return (
    <div style={wrap}>
      <div style={{ maxWidth: 480, width: "100%", ...fade }}>
        <Eyebrow>Your report is ready</Eyebrow>
        <h2 style={{ fontFamily: F.serif, fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 400, color: T.dark, lineHeight: 1.25, margin: "0 0 12px" }}>Where should we send it?</h2>
        <p style={{ fontFamily: F.sans, fontSize: 15, color: T.mid, lineHeight: 1.6, margin: "0 0 36px" }}>
          Get your full PR Readiness Score, Wikipedia qualification verdict, category breakdown, and personalised action plan.
        </p>
        <Field label="Your name" value={name} onChange={setName} placeholder="e.g. Adaeze Okafor" />
        <Field label="Organisation (optional)" value={org} onChange={setOrg} placeholder="e.g. Omenka Gallery" />
        <Field label="Email address" value={email} onChange={setEmail} placeholder="you@company.com" type="email" />
        <Btn onClick={() => go(totalQ + 1)} disabled={!email.includes("@") || !name.trim()}>See My Results →</Btn>
        <p style={{ fontFamily: F.sans, fontSize: 11, color: T.light, marginTop: 16, textAlign: "center" }}>We'll email a copy of your report. No spam, ever.</p>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: T.cream, padding: "48px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", opacity: anim ? 1 : 0, transition: "opacity 0.5s ease" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>Your Media Readiness Report</Eyebrow>
          {name && <p style={{ fontFamily: F.sans, fontSize: 13, color: T.mid, margin: "0 0 28px" }}>Prepared for {name}{org ? ` — ${org}` : ""}</p>}

          {/* Dual Scores */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 48, flexWrap: "wrap", marginBottom: 28 }}>
            <ScoreCircle score={prPct} label="PR Readiness" color={pr.color} />
            <ScoreCircle score={wikiPct} label="Wikipedia" color={wiki.color} />
          </div>

          {/* Verdict badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: pr.color, background: pr.bg, padding: "6px 14px" }}>PR: {pr.label}</span>
            <span style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: wiki.color, background: wiki.bg, padding: "6px 14px" }}>{wiki.icon} Wiki: {wiki.label}</span>
          </div>
        </div>

        {/* PR Summary */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `4px solid ${pr.color}`, padding: "24px 28px", marginBottom: 12 }}>
          <h4 style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: pr.color, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>PR Readiness</h4>
          <p style={{ fontFamily: F.sans, fontSize: 14, color: T.dark, lineHeight: 1.6, margin: 0 }}>{pr.msg}</p>
        </div>

        {/* Wiki Summary */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, borderLeft: `4px solid ${wiki.color}`, padding: "24px 28px", marginBottom: 40 }}>
          <h4 style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: wiki.color, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>Wikipedia Readiness</h4>
          <p style={{ fontFamily: F.sans, fontSize: 14, color: T.dark, lineHeight: 1.6, margin: 0 }}>{wiki.msg}</p>
        </div>

        {/* PR Breakdown */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, padding: 28, marginBottom: 12 }}>
          <h3 style={{ fontFamily: F.serif, fontSize: 19, fontWeight: 400, color: T.dark, margin: "0 0 20px" }}>PR Score Breakdown</h3>
          {Object.entries(catPr).map(([k, v]) => <Bar key={k} label={k} pct={v} />)}
        </div>

        {/* Wiki Breakdown */}
        <div style={{ background: T.white, border: `1px solid ${T.border}`, padding: 28, marginBottom: 40 }}>
          <h3 style={{ fontFamily: F.serif, fontSize: 19, fontWeight: 400, color: T.dark, margin: "0 0 20px" }}>Wikipedia Score Breakdown</h3>
          {Object.entries(catWiki).map(([k, v]) => <Bar key={k} label={k} pct={v} />)}
        </div>

        {/* Gap Analysis */}
        {gaps.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <Eyebrow>Gap Analysis</Eyebrow>
            <h3 style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 400, color: T.dark, margin: "0 0 20px" }}>What's holding you back</h3>
            {gaps.map((g, i) => (
              <div key={i} style={{ background: T.white, border: `1px solid ${T.border}`, padding: "22px 26px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                  <h4 style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 600, color: T.dark, margin: 0 }}>{g.area}</h4>
                  <span style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, color: sevColor(g.severity), letterSpacing: "0.08em", textTransform: "uppercase" }}>{sevLabel(g.severity)}</span>
                </div>
                <p style={{ fontFamily: F.sans, fontSize: 13, color: T.mid, lineHeight: 1.5, margin: "0 0 8px" }}>{g.detail}</p>
                <p style={{ fontFamily: F.sans, fontSize: 12, margin: 0 }}>
                  <span style={{ color: T.mid }}>Recommended → </span>
                  <span style={{ color: T.terra, fontWeight: 600 }}>{g.service}</span>
                  <span style={{ color: T.light }}> · {g.price}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ background: T.dark, padding: "44px 28px", textAlign: "center", marginBottom: 32 }}>
          <Eyebrow style={{ color: T.terraLight }}>
            {prPct >= 60 && wikiPct >= 60 ? "Scale your presence" : "Start building"}
          </Eyebrow>
          <h3 style={{ fontFamily: F.serif, fontSize: "clamp(20px, 4vw, 27px)", fontWeight: 400, color: T.white, margin: "0 0 12px", lineHeight: 1.3 }}>
            {prPct >= 60 && wikiPct >= 60
              ? "You've built the foundation. Let's scale it."
              : "The path to coverage — and Wikipedia — starts here."
            }
          </h3>
          <p style={{ fontFamily: F.sans, fontSize: 14, color: "#A09A94", lineHeight: 1.6, maxWidth: 440, margin: "0 auto 28px" }}>
            The Moveee provides media infrastructure for African brands — editorial features, PR subscriptions, media partnerships, and content amplification. Tell us about your brand and we'll recommend the right starting point.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, maxWidth: 560, margin: "0 auto 28px", textAlign: "left" }}>
            {[
              { n: "Sponsored Content", p: "₦200,000", d: "Longform editorial features" },
              { n: "Media Partnership", p: "₦80,000", d: "3-month editorial programme" },
              { n: "Presskit (PR)", p: "₦80,000/mo", d: "Press releases & media outreach" },
              { n: "Content Amplification", p: "₦65,000", d: "Paid social & influencer reach" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px" }}>
                <p style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: T.white, margin: "0 0 3px" }}>{s.n}</p>
                <p style={{ fontFamily: F.sans, fontSize: 11, color: "#908A84", margin: "0 0 5px", lineHeight: 1.3 }}>{s.d}</p>
                <p style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: T.terraLight, margin: 0 }}>From {s.p}</p>
              </div>
            ))}
          </div>

          <Btn variant="terra" onClick={() => window.open("https://themoveee.com/services/africa", "_blank")} style={{ maxWidth: 320, margin: "0 auto" }}>
            Talk to The Moveee →
          </Btn>
        </div>

        {/* Retake */}
        <div style={{ textAlign: "center" }}>
          <button onClick={() => { setStep(-1); setAnswers({}); setEmail(""); setName(""); setOrg(""); }}
            style={{ fontFamily: F.sans, fontSize: 12, color: T.light, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Retake the Assessment →
          </button>
          <p style={{ fontFamily: F.sans, fontSize: 11, color: T.light, marginTop: 20 }}>
            Built by <span style={{ color: T.terra, fontWeight: 600 }}>The Moveee</span> — media infrastructure for African brands.
          </p>
        </div>
      </div>
    </div>
  );
}
