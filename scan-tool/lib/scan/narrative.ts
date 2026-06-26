import type { AiCheckResult, CompDetails, SiteDetails } from "./types";

export interface ScanNarrative {
  aiHeadline: string;
  aiBullets: string[];
  siteHeadline: string;
  siteBullets: string[];
  compHeadline: string;
  compBullets: string[];
}

export function buildScanNarrative(
  aiDetails: AiCheckResult[],
  compDetails: CompDetails | null,
  siteDetails: SiteDetails | null,
  brandName: string
): ScanNarrative {
  return {
    ...buildAiSection(aiDetails, brandName),
    ...buildSiteSection(siteDetails),
    ...buildCompSection(compDetails, brandName),
  };
}

function buildAiSection(details: AiCheckResult[], brandName: string) {
  const total = details.length;
  if (total === 0) {
    return { aiHeadline: "No AI discoverability data available.", aiBullets: [] };
  }

  const mentioned = details.filter((d) => d.mentioned);
  const mentionRate = Math.round((mentioned.length / total) * 100);

  const aiHeadline =
    mentioned.length === 0
      ? `${brandName} was not referenced in any of the ${total} real-world queries we tested — AI tools are sending buyers elsewhere.`
      : mentioned.length <= 3
      ? `${brandName} appeared in ${mentioned.length} of ${total} AI-generated answers (${mentionRate}%) — some visibility, but large gaps remain.`
      : `${brandName} appeared in ${mentioned.length} of ${total} AI-generated answers (${mentionRate}%) — a solid foundation to build on.`;

  const aiBullets: string[] = [];

  // Category breakdown
  const categories = ["informational", "transactional", "comparison", "reputation"] as const;
  const categoryResults = categories.map((cat) => {
    const inCat = details.filter((d) => d.category === cat);
    const mentionedInCat = inCat.filter((d) => d.mentioned);
    return { category: cat, total: inCat.length, mentioned: mentionedInCat.length };
  });

  const weakCategories = categoryResults.filter((c) => c.mentioned === 0 && c.total > 0);
  if (weakCategories.length > 0) {
    const labels: Record<string, string> = {
      informational: "informational queries (people learning about the space)",
      transactional: "purchase-intent queries (people ready to buy)",
      comparison: "comparison queries (people evaluating options)",
      reputation: "reputation queries (people checking credibility)",
    };
    aiBullets.push(
      `Completely absent from ${weakCategories.map((c) => labels[c.category]).join(" and ")}.`
    );
  }

  if (mentioned.length > 0) {
    const topCount = mentioned.filter((d) => d.position === "top").length;
    const bottomCount = mentioned.filter((d) => d.position === "bottom").length;

    if (topCount > bottomCount) {
      aiBullets.push("When mentioned, the brand tends to lead the response — a strong trust signal.");
    } else if (bottomCount > topCount) {
      aiBullets.push("When mentioned, the brand was usually listed last — easy to miss in AI responses.");
    }

    const citedCount = mentioned.filter((d) => d.hasCitation).length;
    aiBullets.push(
      citedCount === 0
        ? "None of those mentions linked back to the site, meaning AI visibility isn't converting to traffic."
        : `${citedCount} of ${mentioned.length} mentions included a direct link — good for driving traffic from AI tools.`
    );
  } else {
    aiBullets.push(
      "When buyers ask AI tools questions your brand should answer, other brands (or no one) are filling that space."
    );
  }

  return { aiHeadline, aiBullets };
}

function buildSiteSection(details: SiteDetails | null) {
  if (!details || !details.dnsResolves) {
    return {
      siteHeadline: "No website to analyze — site health could not be assessed.",
      siteBullets: [],
    };
  }

  const strengths: string[] = [];
  const issues: string[] = [];

  if (details.https) strengths.push("HTTPS");
  else issues.push("Not using HTTPS — browsers and AI crawlers penalize this");

  if (details.responseTimeMs > 0 && details.responseTimeMs < 1000) strengths.push(`fast load time (${details.responseTimeMs}ms)`);
  else if (details.responseTimeMs >= 2500) issues.push(`Slow load time (${details.responseTimeMs}ms) — hurts both UX and crawlability`);

  if (!details.hasStructuredData) issues.push("No structured data (schema.org) — AI tools can't parse your business details");
  if (!details.hasSitemap) issues.push("No XML sitemap — crawlers can't discover all your pages");
  if (!details.hasDescription) issues.push("Missing meta description on the homepage");
  if (!details.hasOgTags) issues.push("No Open Graph tags — social and AI previews won't render properly");

  if (details.hasBlog) strengths.push("blog detected");
  else issues.push("No blog or content section found — this limits your ability to build topical authority");

  if (details.avgWordCount < 200 && details.avgWordCount > 0) {
    issues.push(`Pages average only ${details.avgWordCount} words — too thin for AI tools to extract useful information`);
  }

  if (details.imageAltCoverage < 50) {
    issues.push(`Only ${details.imageAltCoverage}% of images have alt text — AI tools can't interpret them`);
  }

  const siteHeadline = issues.length === 0
    ? "Your site's technical foundation is solid — no critical gaps found."
    : issues.length <= 2
    ? `Your site is mostly sound, but ${issues.length} issue${issues.length > 1 ? "s" : ""} could be holding back visibility.`
    : `Your site has ${issues.length} technical gaps that are actively limiting how AI tools can read and recommend you.`;

  return { siteHeadline, siteBullets: issues.slice(0, 5) };
}

function buildCompSection(details: CompDetails | null, brandName: string) {
  if (!details) {
    return { compHeadline: "Competitor analysis could not be completed.", compBullets: [] };
  }

  const compCount = details.competitors.length;
  if (compCount === 0) {
    return {
      compHeadline: `We couldn't confidently identify direct competitors for ${brandName} — the brand may be too new or niche for AI tools to compare.`,
      compBullets: ["Adding a niche on your next scan will sharpen this analysis."],
    };
  }

  const compHeadline = details.brandMentionedMoreThanCompetitors
    ? `${brandName} holds its own against ${compCount} identified competitors — but there's room to pull ahead.`
    : `${brandName} is being outpaced by ${compCount} competitors in AI-generated recommendations.`;

  const topicGapBullets = details.topicGaps.map(
    (g) => `"${g.topic}" is covered by ${g.competitorsCovering} of ${compCount} competitors but not by you — ${g.opportunity}-opportunity content gap.`
  );

  const compBullets = [...details.gaps, ...topicGapBullets];

  return {
    compHeadline,
    compBullets: compBullets.length > 0 ? compBullets : ["No critical competitive gaps detected — focus on maintaining your edge."],
  };
}
