import { nanoid } from "nanoid";
import { saveScan, updateScan } from "../redis";
import { checkAiDiscoverability } from "./ai-discoverability";
import { checkSiteHealth } from "./site-health";
import { checkCompetitorIntel } from "./competitor-intel";
import type { ScanInput, ScanResult, ScanScores, ScanVerdict } from "./types";

export function createScanId(): string {
  return `scan_${nanoid(12)}`;
}

export async function initScan(id: string, input: ScanInput): Promise<void> {
  const record: ScanResult = {
    id,
    status: "processing",
    progress: 0,
    currentStep: "Starting scan…",
    input,
    scores: { ai: 0, site: 0, comp: 0, overall: 0 },
    verdict: null,
    summary: { pagesChecked: 0, competitorsSurveyed: 0, aiPromptsRun: 0 },
    aiDetails: null,
    compDetails: null,
    siteDetails: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    email: null,
    error: null,
  };
  await saveScan(id, record as unknown as Record<string, unknown>);
}

export async function runScan(id: string, input: ScanInput): Promise<void> {
  try {
    await updateScan(id, {
      progress: 10,
      currentStep: "Checking AI discoverability…",
    });

    const aiResult = await checkAiDiscoverability(
      input.domain,
      input.brand,
      input.niche
    );

    await updateScan(id, {
      progress: 45,
      currentStep: input.noSite
        ? "No site to check — skipping site health."
        : "Checking site health…",
    });

    const siteResult = await checkSiteHealth(
      input.noSite ? undefined : input.domain
    );

    await updateScan(id, {
      progress: 70,
      currentStep: "Analyzing competitor landscape…",
    });

    const compResult = await checkCompetitorIntel(
      input.domain,
      input.brand,
      input.niche
    );

    await updateScan(id, {
      progress: 90,
      currentStep: "Generating your report…",
    });

    const scores: ScanScores = {
      ai: aiResult.score,
      site: siteResult.score,
      comp: compResult.score,
      overall: Math.round(
        (aiResult.score + siteResult.score + compResult.score) / 3
      ),
    };

    const verdict = buildVerdict(scores, input);

    await updateScan(id, {
      status: "complete",
      progress: 100,
      currentStep: "Scan complete.",
      scores,
      verdict,
      summary: {
        pagesChecked: siteResult.details.dnsResolves ? 1 : 0,
        competitorsSurveyed: compResult.details.competitors.length,
        aiPromptsRun: aiResult.details.length,
      },
      aiDetails: aiResult.details,
      compDetails: compResult.details,
      siteDetails: siteResult.details,
      completedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await updateScan(id, {
      status: "failed",
      progress: 100,
      currentStep: "Scan failed.",
      error: message,
    });
  }
}

function buildVerdict(scores: ScanScores, input: ScanInput): ScanVerdict {
  const { ai, site, comp } = scores;
  const entries = { ai, site, comp } as const;
  const weakest = (Object.keys(entries) as Array<keyof typeof entries>).reduce(
    (a, b) => (entries[a] <= entries[b] ? a : b)
  );

  if (input.noSite) {
    return {
      weakest: "site",
      message:
        "You don't have a website yet — you need one before AI tools can surface your brand.",
      recommendation: "Get a site built first, then optimize for AI visibility.",
      serviceUrl: "https://bluuhq.com/services/web-mobile-dev",
    };
  }

  switch (weakest) {
    case "ai":
      return {
        weakest: "ai",
        message:
          "Most AI tools can't find your brand yet. Content strategy is where to start.",
        recommendation:
          "Build topical authority with structured, search-friendly content.",
        serviceUrl: "https://bluuhq.com/content-ops",
      };
    case "site":
      if (site < 30) {
        return {
          weakest: "site",
          message: "Your site's technical foundation needs rebuilding.",
          recommendation:
            "Fix core infrastructure — speed, security, and structure.",
          serviceUrl: "https://bluuhq.com/services/web-mobile-dev",
        };
      }
      return {
        weakest: "site",
        message:
          "Your site has gaps in health and structure that hold back visibility.",
        recommendation:
          "Ongoing site management will close the technical gaps.",
        serviceUrl: "https://bluuhq.com/services/web-manage",
      };
    case "comp":
      return {
        weakest: "comp",
        message:
          "Competitors are outpublishing you — they show up in AI results more often.",
        recommendation:
          "A content ops retainer closes the gap with consistent output.",
        serviceUrl: "https://bluuhq.com/content-ops",
      };
  }
}
