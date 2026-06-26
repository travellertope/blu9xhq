import { GoogleGenAI } from "@google/genai";
import { extractSiteIdentity, deriveBrandName } from "./prompts";
import { getCachedCompetitor, cacheCompetitor } from "../redis";
import type { CompDetails, CompetitorProfile, SiteDetails, TopicGap } from "./types";

const MAX_SITEMAP_URLS = 50;
const STOPWORD_SLUGS = new Set([
  "page", "index", "home", "category", "tag", "tags", "author", "p", "id",
  "amp", "feed", "wp-content", "wp-json", "static", "assets", "en", "us",
]);

function getClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
}

export async function checkCompetitorIntel(
  domain: string | undefined,
  brand: string | undefined,
  niche: string | undefined,
  ownSiteDetails: SiteDetails | null
): Promise<{ score: number; details: CompDetails }> {
  const siteIdentity = ownSiteDetails?.homepageSummary ? extractSiteIdentity(ownSiteDetails.homepageSummary) : undefined;
  const detectedName = siteIdentity?.siteTitle ? deriveBrandName(siteIdentity.siteTitle, domain) : "";
  const brandName = brand || (detectedName.length > 2 && detectedName.length < 40 ? detectedName : "") || domainToName(domain || "");
  const subject = domain ? `the website "${domain}" (also known as "${brandName}")` : `the business "${brandName}"`;
  const scopePhrase = niche ? `in the ${niche} space` : "in its space";

  const siteContext = ownSiteDetails?.homepageSummary
    ? `\n\nHere is real content scraped directly from ${subject}'s own homepage — use this as ground truth for what the business actually does, don't rely on search alone since this brand may be small or hard to find:\n"""\n${ownSiteDetails.homepageSummary}\n"""\n`
    : "";

  try {
    const ai = getClient();
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    const topicGaps = identifyTopicGaps(ownSiteDetails, profiles);
    const contentFreshness = assessFreshness(profiles);

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
        topicGaps,
        contentFreshness,
      },
    };
  } catch (err) {
    console.error("[competitor-intel] generateContent failed:", err instanceof Error ? err.message : err);
    return {
      score: 50,
      details: {
        competitors: [],
        brandMentionedMoreThanCompetitors: false,
        relativePosition: "even",
        gaps: [],
        topicGaps: [],
        contentFreshness: "unknown",
      },
    };
  }
}

export async function buildCompetitorProfile(
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
    sitemapPageCount: 0,
    topTopics: [],
    lastModified: null,
  };

  if (!domain) return profile;

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  const cached = await getCachedCompetitor<CompetitorProfile>(cleanDomain);
  if (cached) {
    return { ...cached, name: profile.name };
  }

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

  const sitemapResult = await crawlSitemap(cleanDomain);
  profile.sitemapPageCount = sitemapResult.urls.length;
  profile.topTopics = extractTopics(sitemapResult.urls);
  profile.lastModified = sitemapResult.mostRecentLastmod;

  await cacheCompetitor(cleanDomain, profile);

  return profile;
}

interface SitemapResult {
  urls: string[];
  mostRecentLastmod: string | null;
}

async function crawlSitemap(domain: string): Promise<SitemapResult> {
  const empty: SitemapResult = { urls: [], mostRecentLastmod: null };

  try {
    const res = await fetch(`https://${domain}/sitemap.xml`, {
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return empty;

    const xml = await res.text();

    // Sitemap index — descend into the first child sitemap rather than
    // returning empty, since most real sites use index files.
    const sitemapRefs = Array.from(xml.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi)).map((m) => m[1]);
    if (sitemapRefs.length > 0) {
      const childRes = await fetch(sitemapRefs[0], { signal: AbortSignal.timeout(6000) });
      if (!childRes.ok) return empty;
      return parseUrlset(await childRes.text());
    }

    return parseUrlset(xml);
  } catch {
    return empty;
  }
}

function parseUrlset(xml: string): SitemapResult {
  const entries = Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)).map((m) => m[1]);
  const urls: string[] = [];
  let mostRecentLastmod: string | null = null;

  for (const entry of entries.slice(0, MAX_SITEMAP_URLS)) {
    const loc = entry.match(/<loc>([^<]+)<\/loc>/i)?.[1];
    if (loc) urls.push(loc.trim());

    const lastmod = entry.match(/<lastmod>([^<]+)<\/lastmod>/i)?.[1];
    if (lastmod && (!mostRecentLastmod || lastmod > mostRecentLastmod)) {
      mostRecentLastmod = lastmod;
    }
  }

  return { urls, mostRecentLastmod };
}

function extractTopics(urls: string[]): string[] {
  const counts = new Map<string, number>();

  for (const url of urls) {
    try {
      const path = new URL(url).pathname;
      const segments = path.split("/").filter(Boolean);
      for (const segment of segments) {
        const slug = segment.toLowerCase().replace(/\.\w+$/, "");
        if (slug.length < 3 || /^\d+$/.test(slug) || STOPWORD_SLUGS.has(slug)) continue;
        const words = slug.split(/[-_]/).filter((w) => w.length > 2);
        for (const word of words) {
          counts.set(word, (counts.get(word) || 0) + 1);
        }
      }
    } catch {
      // Malformed URL — skip
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

function assessFreshness(competitors: CompetitorProfile[]): CompDetails["contentFreshness"] {
  const dates = competitors
    .map((c) => c.lastModified)
    .filter((d): d is string => !!d)
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t));

  if (dates.length === 0) return "unknown";

  const mostRecent = Math.max(...dates);
  const daysSince = (Date.now() - mostRecent) / (1000 * 60 * 60 * 24);

  return daysSince <= 60 ? "fresh" : "stale";
}

export function identifyTopicGaps(
  own: SiteDetails | null,
  competitors: CompetitorProfile[]
): TopicGap[] {
  if (!own || competitors.length === 0) return [];

  const ownTopics = new Set(
    own.pages.flatMap((p) => {
      try {
        return new URL(p.url).pathname
          .split("/")
          .filter(Boolean)
          .flatMap((seg) => seg.toLowerCase().replace(/\.\w+$/, "").split(/[-_]/))
          .filter((w) => w.length > 2);
      } catch {
        return [];
      }
    })
  );

  const topicCoverage = new Map<string, number>();
  for (const comp of competitors) {
    for (const topic of comp.topTopics) {
      topicCoverage.set(topic, (topicCoverage.get(topic) || 0) + 1);
    }
  }

  const gaps: TopicGap[] = [];
  for (const [topic, coveringCount] of Array.from(topicCoverage.entries())) {
    if (ownTopics.has(topic)) continue;
    if (coveringCount < 2) continue;

    gaps.push({
      topic,
      competitorsCovering: coveringCount,
      opportunity: coveringCount >= 3 ? "high" : "medium",
    });
  }

  return gaps.sort((a, b) => b.competitorsCovering - a.competitorsCovering).slice(0, 5);
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

  const avgCompPageCount = competitors.length > 0
    ? Math.round(competitors.reduce((s, c) => s + c.sitemapPageCount, 0) / competitors.length)
    : 0;
  if (avgCompPageCount > 0 && own.totalPagesFound > 0 && own.totalPagesFound < avgCompPageCount * 0.5) {
    gaps.push(`Competitors publish ${avgCompPageCount} pages on average — you have ${own.totalPagesFound}. More content volume means more chances to be cited.`);
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
