import { GoogleGenAI } from "@google/genai";
import type { CompDetails, CompetitorProfile, SiteDetails } from "./types";

function getClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
}

export async function checkCompetitorIntel(
  domain: string | undefined,
  brand: string | undefined,
  niche: string | undefined,
  ownSiteDetails: SiteDetails | null
): Promise<{ score: number; details: CompDetails }> {
  const brandName = brand || domainToName(domain || "");
  const subject = domain ? `the website "${domain}"` : `the business "${brandName}"`;
  const scopePhrase = niche ? `in the ${niche} space` : "in its space";

  const siteContext = ownSiteDetails?.homepageSummary
    ? `\n\nHere is real content scraped directly from ${subject}'s own homepage — use this as ground truth for what the business actually does, don't rely on search alone since this brand may be small or hard to find:\n"""\n${ownSiteDetails.homepageSummary}\n"""\n`
    : "";

  try {
    const ai = getClient();
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${subject} is a real, existing business or website.${siteContext}\nBased on the above (and a web search if useful), identify what category/industry this business operates in, then list the top 5 real companies or tools that are its direct competitors ${scopePhrase}. For each, give the company name and their website domain — these must be real, currently-operating competitors, not made up. Then state whether "${brandName}" is among the most visible brands in this space. Always return exactly 5 competitor names — never an empty list, even if you have to use your best judgment based on the category. Respond with ONLY this JSON object, no markdown, no extra commentary: {"competitors": [{"name": "Company Name", "domain": "example.com"}, ...], "brandVisible": true/false}`,
      config: { tools: [{ googleSearch: {} }] },
    });

    const fullText = result.text || "";
    const cleanedText = fullText.replace(/```json|```/gi, "").trim();

    let rawCompetitors: Array<{ name: string; domain?: string }> = [];
    let brandVisible = false;

    const jsonMatch = cleanedText.match(/\{[\s\S]*?"brandVisible"\s*:\s*(?:true|false)[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        rawCompetitors = Array.isArray(parsed.competitors) ? parsed.competitors : [];
        brandVisible = parsed.brandVisible === true;
      } catch {
        rawCompetitors = extractCompetitorNames(cleanedText).map((n) => ({ name: n }));
        brandVisible = cleanedText.toLowerCase().includes(brandName.toLowerCase());
      }
    } else {
      rawCompetitors = extractCompetitorNames(cleanedText).map((n) => ({ name: n }));
      brandVisible = cleanedText.toLowerCase().includes(brandName.toLowerCase());
    }

    if (rawCompetitors.length === 0) {
      rawCompetitors = extractCompetitorNames(cleanedText).map((n) => ({ name: n }));
    }

    const competitors = rawCompetitors.slice(0, 5);

    // Fetch competitor homepages in parallel for comparison
    const profiles = await Promise.all(
      competitors.map((c) => buildCompetitorProfile(c.name, c.domain || null))
    );

    const gaps = identifyGaps(ownSiteDetails, profiles);

    const relativePosition: CompDetails["relativePosition"] = brandVisible
      ? "even"
      : "behind";

    const score = calculateCompScore(brandVisible, profiles, ownSiteDetails);

    return {
      score,
      details: {
        competitors: profiles,
        brandMentionedMoreThanCompetitors: brandVisible,
        relativePosition,
        gaps,
      },
    };
  } catch {
    return {
      score: 50,
      details: {
        competitors: [],
        brandMentionedMoreThanCompetitors: false,
        relativePosition: "even",
        gaps: [],
      },
    };
  }
}

async function buildCompetitorProfile(
  name: string,
  domain: string | null
): Promise<CompetitorProfile> {
  const profile: CompetitorProfile = {
    name: typeof name === "string" ? name : String(name),
    domain,
    hasStructuredData: false,
    hasBlog: false,
    estimatedContentDepth: "thin",
    wordCount: 0,
  };

  if (!domain) return profile;

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  try {
    const res = await fetch(`https://${cleanDomain}`, {
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return profile;

    const html = await res.text();
    const lower = html.toLowerCase();

    profile.hasStructuredData = lower.includes('"@context"') || lower.includes("application/ld+json");

    const blogPatterns = /\/(blog|articles|news|insights|resources|posts|journal)(\/|["'])/i;
    profile.hasBlog = blogPatterns.test(html);

    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    profile.wordCount = textContent.split(/\s+/).filter((w) => w.length > 1).length;

    if (profile.wordCount >= 800) profile.estimatedContentDepth = "deep";
    else if (profile.wordCount >= 300) profile.estimatedContentDepth = "moderate";
  } catch {
    // Fetch failed — leave defaults
  }

  return profile;
}

function identifyGaps(
  own: SiteDetails | null,
  competitors: CompetitorProfile[]
): string[] {
  const gaps: string[] = [];
  if (!own) return gaps;

  const compsWithBlog = competitors.filter((c) => c.hasBlog).length;
  if (!own.hasBlog && compsWithBlog >= 2) {
    gaps.push(`${compsWithBlog} of ${competitors.length} competitors have a blog — you don't.`);
  }

  const compsWithSchema = competitors.filter((c) => c.hasStructuredData).length;
  if (!own.hasStructuredData && compsWithSchema >= 2) {
    gaps.push(`${compsWithSchema} competitors use structured data for AI readability — your site doesn't.`);
  }

  const avgCompWordCount = competitors.length > 0
    ? Math.round(competitors.reduce((s, c) => s + c.wordCount, 0) / competitors.length)
    : 0;
  if (own.avgWordCount > 0 && avgCompWordCount > 0 && own.avgWordCount < avgCompWordCount * 0.6) {
    gaps.push(`Your pages average ${own.avgWordCount} words — competitors average ${avgCompWordCount}. Thin content hurts AI visibility.`);
  }

  if (!own.hasSitemap) {
    gaps.push("You're missing an XML sitemap. AI crawlers use this to discover your pages.");
  }

  if (!own.hasLlmsTxt) {
    gaps.push("No llms.txt file found. This file helps AI models understand how to use your content.");
  }

  if (own.imageAltCoverage < 50) {
    gaps.push(`Only ${own.imageAltCoverage}% of your images have alt text — AI tools can't interpret them.`);
  }

  return gaps;
}

function domainToName(domain: string): string {
  return domain
    .replace(/^(www\.)?/, "")
    .replace(/\.(com|io|co|net|org|ai|dev|app)$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractCompetitorNames(text: string): string[] {
  const lines = text
    .split("\n")
    .filter((l) => /^\s*(\d+[\.\)]|[-*•])\s+\S/.test(l));

  return lines
    .map((l) =>
      l
        .replace(/^\s*(\d+[\.\)]|[-*•])\s*/, "")
        .replace(/[*_`]/g, "")
        .split(/[:–—-]/)[0]
        .trim()
    )
    .filter(Boolean)
    .slice(0, 5);
}

function calculateCompScore(
  brandVisible: boolean,
  competitors: CompetitorProfile[],
  ownSite: SiteDetails | null
): number {
  if (competitors.length === 0) return 50;

  let score = 0;

  // Brand visibility in AI results (30 pts)
  if (brandVisible) score += 30;

  // Content depth comparison (25 pts)
  if (ownSite) {
    const deepCompetitors = competitors.filter((c) => c.estimatedContentDepth === "deep").length;
    const ownDepth = ownSite.avgWordCount >= 800 ? "deep" : ownSite.avgWordCount >= 300 ? "moderate" : "thin";

    if (ownDepth === "deep") score += 25;
    else if (ownDepth === "moderate" && deepCompetitors <= 2) score += 15;
    else if (ownDepth === "moderate") score += 10;
    else score += 5;
  } else {
    score += 5;
  }

  // Blog/content presence (20 pts)
  if (ownSite?.hasBlog) score += 20;
  else {
    const compsWithBlog = competitors.filter((c) => c.hasBlog).length;
    if (compsWithBlog === 0) score += 15;
    else score += 5;
  }

  // Technical parity (15 pts)
  if (ownSite?.hasStructuredData) score += 10;
  if (ownSite?.hasSitemap) score += 5;

  // Gap penalty (up to -10)
  const gapCount = competitors.filter((c) => c.hasBlog && !ownSite?.hasBlog).length +
    competitors.filter((c) => c.hasStructuredData && !ownSite?.hasStructuredData).length;
  score -= Math.min(10, gapCount * 2);

  return Math.max(0, Math.min(100, score));
}
