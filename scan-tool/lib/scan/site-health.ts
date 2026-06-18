import type { SiteDetails, PageAnalysis } from "./types";

const MAX_PAGES = 8;
const FETCH_TIMEOUT = 8000;

export async function checkSiteHealth(
  domain: string | undefined
): Promise<{ score: number; details: SiteDetails }> {
  if (!domain) {
    return {
      score: 12,
      details: emptyDetails(),
    };
  }

  const detail: SiteDetails = emptyDetails();
  const baseUrl = `https://${domain.replace(/^https?:\/\//, "")}`;
  let homepageHtml = "";

  try {
    const start = Date.now();
    const res = await fetchWithFallback(baseUrl);
    detail.responseTimeMs = Date.now() - start;
    detail.dnsResolves = true;
    detail.https = res.url.startsWith("https://");
    homepageHtml = await res.text();
  } catch {
    return { score: 5, details: detail };
  }

  analyzeHomepage(homepageHtml, detail);
  detail.homepageSummary = extractHomepageSummary(homepageHtml);

  const internalLinks = extractInternalLinks(homepageHtml, baseUrl);

  const [robotsOk, sitemapOk, llmsTxtOk] = await Promise.all([
    checkResource(`${baseUrl}/robots.txt`),
    checkResource(`${baseUrl}/sitemap.xml`),
    checkResource(`${baseUrl}/llms.txt`),
  ]);
  detail.hasRobotsTxt = robotsOk;
  detail.hasSitemap = sitemapOk;
  detail.hasLlmsTxt = llmsTxtOk;

  const homePage = analyzePage(baseUrl, homepageHtml);
  const pages: PageAnalysis[] = [homePage];

  const pagesToCrawl = internalLinks.slice(0, MAX_PAGES - 1);
  const crawlResults = await Promise.allSettled(
    pagesToCrawl.map((url) => crawlAndAnalyze(url))
  );

  for (const result of crawlResults) {
    if (result.status === "fulfilled" && result.value) {
      pages.push(result.value);
    }
  }

  detail.pages = pages;
  detail.totalPagesFound = internalLinks.length + 1;

  if (pages.length > 0) {
    detail.avgWordCount = Math.round(pages.reduce((s, p) => s + p.wordCount, 0) / pages.length);
    detail.avgHeadingCount = Math.round(pages.reduce((s, p) => s + p.headingCount, 0) / pages.length);
    detail.avgInternalLinks = Math.round(pages.reduce((s, p) => s + p.internalLinkCount, 0) / pages.length);

    const totalImages = pages.reduce((s, p) => s + p.imageCount, 0);
    const totalAlts = pages.reduce((s, p) => s + p.imagesWithAlt, 0);
    detail.imageAltCoverage = totalImages > 0 ? Math.round((totalAlts / totalImages) * 100) : 100;
  }

  detail.hasBlog = detectBlog(internalLinks, homepageHtml);

  const score = computeSiteScore(detail);
  return { score, details: detail };
}

function emptyDetails(): SiteDetails {
  return {
    dnsResolves: false,
    https: false,
    responseTimeMs: 0,
    hasTitle: false,
    hasDescription: false,
    hasOgTags: false,
    hasRobotsTxt: false,
    hasSitemap: false,
    hasStructuredData: false,
    hasLlmsTxt: false,
    hasBlog: false,
    hasCanonical: false,
    hasMobileViewport: false,
    totalPagesFound: 0,
    avgWordCount: 0,
    avgHeadingCount: 0,
    avgInternalLinks: 0,
    imageAltCoverage: 0,
    pages: [],
    homepageSummary: "",
  };
}

function extractHomepageSummary(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const ogDescMatch = html.match(/meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);

  const textContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const parts: string[] = [];
  if (titleMatch?.[1]) parts.push(`Title: ${titleMatch[1].trim()}`);
  const description = descMatch?.[1] || ogDescMatch?.[1];
  if (description) parts.push(`Description: ${description.trim()}`);
  if (textContent) parts.push(`Page text excerpt: ${textContent.slice(0, 1000)}`);

  return parts.join("\n");
}

async function fetchWithFallback(url: string): Promise<Response> {
  try {
    return await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  } catch {
    const httpUrl = url.replace("https://", "http://");
    return await fetch(httpUrl, { redirect: "follow", signal: AbortSignal.timeout(FETCH_TIMEOUT) });
  }
}

function analyzeHomepage(html: string, detail: SiteDetails): void {
  detail.hasTitle = /<title[^>]*>.+<\/title>/i.test(html);
  detail.hasDescription = /meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html);
  detail.hasOgTags = /meta[^>]+property=["']og:/i.test(html);
  detail.hasCanonical = /link[^>]+rel=["']canonical["']/i.test(html);
  detail.hasMobileViewport = /meta[^>]+name=["']viewport["']/i.test(html);
  const lower = html.toLowerCase();
  detail.hasStructuredData = lower.includes('"@context"') || lower.includes("application/ld+json");
}

function analyzePage(url: string, html: string): PageAnalysis {
  const textContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const wordCount = textContent.split(/\s+/).filter((w) => w.length > 1).length;
  const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length;

  const allLinks = html.match(/<a[^>]+href=["'][^"']+["']/gi) || [];
  let internalLinkCount = 0;
  let externalLinkCount = 0;
  const origin = new URL(url).origin;
  for (const link of allLinks) {
    const href = link.match(/href=["']([^"']+)["']/i)?.[1] || "";
    if (href.startsWith("/") || href.startsWith(origin)) {
      internalLinkCount++;
    } else if (href.startsWith("http")) {
      externalLinkCount++;
    }
  }

  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = images.filter((img) => /alt=["'][^"']+["']/i.test(img)).length;

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const lower = html.toLowerCase();

  return {
    url,
    title: titleMatch?.[1]?.trim() || "",
    wordCount,
    headingCount,
    internalLinkCount,
    externalLinkCount,
    hasStructuredData: lower.includes('"@context"') || lower.includes("application/ld+json"),
    imageCount: images.length,
    imagesWithAlt,
  };
}

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const origin = new URL(baseUrl).origin;
  const linkRegex = /<a[^>]+href=["']([^"'#]+)["']/gi;
  const seen = new Set<string>();
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1];
    if (href.startsWith("/")) {
      href = origin + href;
    }
    if (!href.startsWith(origin)) continue;
    if (/\.(jpg|jpeg|png|gif|svg|pdf|css|js|zip|ico|woff|woff2|ttf)$/i.test(href)) continue;
    if (href === baseUrl || href === baseUrl + "/") continue;

    const normalized = href.replace(/\/+$/, "");
    if (!seen.has(normalized)) {
      seen.add(normalized);
      links.push(normalized);
    }
  }

  return links;
}

function detectBlog(links: string[], html: string): boolean {
  const blogPatterns = /\/(blog|articles|news|insights|resources|posts|journal|stories)(\/|$)/i;
  if (links.some((l) => blogPatterns.test(l))) return true;
  if (blogPatterns.test(html)) return true;
  return false;
}

async function crawlAndAnalyze(url: string): Promise<PageAnalysis | null> {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;
    const html = await res.text();
    return analyzePage(url, html);
  } catch {
    return null;
  }
}

async function checkResource(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

function computeSiteScore(d: SiteDetails): number {
  let score = 0;

  // Foundation (30 pts)
  if (d.dnsResolves) score += 8;
  if (d.https) score += 8;
  if (d.responseTimeMs > 0 && d.responseTimeMs < 1000) score += 8;
  else if (d.responseTimeMs > 0 && d.responseTimeMs < 2500) score += 4;
  if (d.hasMobileViewport) score += 3;
  if (d.hasCanonical) score += 3;

  // Metadata (15 pts)
  if (d.hasTitle) score += 5;
  if (d.hasDescription) score += 5;
  if (d.hasOgTags) score += 5;

  // Crawlability (15 pts)
  if (d.hasRobotsTxt) score += 5;
  if (d.hasSitemap) score += 5;
  if (d.hasStructuredData) score += 5;

  // AI readiness (10 pts)
  if (d.hasLlmsTxt) score += 5;
  if (d.imageAltCoverage >= 80) score += 5;
  else if (d.imageAltCoverage >= 50) score += 2;

  // Content depth (20 pts)
  if (d.avgWordCount >= 800) score += 8;
  else if (d.avgWordCount >= 400) score += 4;
  else if (d.avgWordCount >= 150) score += 2;

  if (d.hasBlog) score += 6;

  if (d.avgHeadingCount >= 5) score += 6;
  else if (d.avgHeadingCount >= 3) score += 3;

  // Content structure (10 pts)
  if (d.totalPagesFound >= 20) score += 5;
  else if (d.totalPagesFound >= 10) score += 3;
  else if (d.totalPagesFound >= 5) score += 1;

  if (d.avgInternalLinks >= 10) score += 5;
  else if (d.avgInternalLinks >= 5) score += 3;
  else if (d.avgInternalLinks >= 2) score += 1;

  return Math.min(100, score);
}
