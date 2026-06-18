export interface SiteHealthDetail {
  dnsResolves: boolean;
  https: boolean;
  responseTimeMs: number;
  hasTitle: boolean;
  hasDescription: boolean;
  hasOgTags: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  hasStructuredData: boolean;
}

export async function checkSiteHealth(
  domain: string | undefined
): Promise<{ score: number; details: SiteHealthDetail }> {
  if (!domain) {
    return {
      score: 12,
      details: {
        dnsResolves: false,
        https: false,
        responseTimeMs: 0,
        hasTitle: false,
        hasDescription: false,
        hasOgTags: false,
        hasRobotsTxt: false,
        hasSitemap: false,
        hasStructuredData: false,
      },
    };
  }

  const detail: SiteHealthDetail = {
    dnsResolves: false,
    https: false,
    responseTimeMs: 0,
    hasTitle: false,
    hasDescription: false,
    hasOgTags: false,
    hasRobotsTxt: false,
    hasSitemap: false,
    hasStructuredData: false,
  };

  const url = `https://${domain.replace(/^https?:\/\//, "")}`;
  let html = "";

  try {
    const start = Date.now();
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    detail.responseTimeMs = Date.now() - start;
    detail.dnsResolves = true;
    detail.https = res.url.startsWith("https://");
    html = await res.text();
  } catch {
    try {
      const httpUrl = url.replace("https://", "http://");
      const start = Date.now();
      const res = await fetch(httpUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });
      detail.responseTimeMs = Date.now() - start;
      detail.dnsResolves = true;
      detail.https = res.url.startsWith("https://");
      html = await res.text();
    } catch {
      return { score: 5, details: detail };
    }
  }

  const lower = html.toLowerCase();
  detail.hasTitle = /<title[^>]*>.+<\/title>/i.test(html);
  detail.hasDescription = /meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html);
  detail.hasOgTags = /meta[^>]+property=["']og:/i.test(html);
  detail.hasStructuredData = lower.includes('"@context"') || lower.includes("application/ld+json");

  const [robotsOk, sitemapOk] = await Promise.all([
    checkResource(`${url}/robots.txt`),
    checkResource(`${url}/sitemap.xml`),
  ]);
  detail.hasRobotsTxt = robotsOk;
  detail.hasSitemap = sitemapOk;

  const score = computeSiteScore(detail);
  return { score, details: detail };
}

async function checkResource(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function computeSiteScore(d: SiteHealthDetail): number {
  let score = 0;
  if (d.dnsResolves) score += 15;
  if (d.https) score += 15;
  if (d.responseTimeMs > 0 && d.responseTimeMs < 1000) score += 15;
  else if (d.responseTimeMs > 0 && d.responseTimeMs < 2500) score += 8;
  if (d.hasTitle) score += 10;
  if (d.hasDescription) score += 10;
  if (d.hasOgTags) score += 10;
  if (d.hasRobotsTxt) score += 8;
  if (d.hasSitemap) score += 8;
  if (d.hasStructuredData) score += 9;
  return Math.min(100, score);
}
