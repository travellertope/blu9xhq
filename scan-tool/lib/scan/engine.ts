import { nanoid } from "nanoid";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
    strategicAnalysis: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    email: null,
    error: null,
  };
  await saveScan(id, record as unknown as Record<string, unknown>);
}

export async function runScan(id: string, input: ScanInput): Promise<void> {
  try {
    // Phase 1: AI discoverability + site health run in parallel
    await updateScan(id, {
      progress: 5,
      currentStep: "Analyzing AI visibility across 12 real-world queries…",
    });

    const [aiResult, siteResult] = await Promise.all([
      checkAiDiscoverability(input.domain, input.brand, input.niche),
      checkSiteHealth(input.noSite ? undefined : input.domain),
    ]);

    await updateScan(id, {
      progress: 55,
      currentStep: "Researching competitors and comparing signals…",
    });

    // Phase 2: competitor intel (needs siteResult for gap analysis)
    const compResult = await checkCompetitorIntel(
      input.domain,
      input.brand,
      input.niche,
      siteResult.details
    );

    await updateScan(id, {
      progress: 80,
      currentStep: "Writing your strategic analysis…",
    });

    const scores: ScanScores = {
      ai: aiResult.score,
      site: siteResult.score,
      comp: compResult.score,
      overall: Math.round(
        aiResult.score * 0.45 + siteResult.score * 0.30 + compResult.score * 0.25
      ),
    };

    const verdict = buildVerdict(scores, input);

    // Phase 3: Gemini synthesis — write a professional analysis paragraph
    const strategicAnalysis = await generateStrategicAnalysis(input, scores, aiResult, siteResult, compResult);

    await updateScan(id, {
      status: "complete",
      progress: 100,
      currentStep: "Scan complete.",
      scores,
      verdict,
      summary: {
        pagesChecked: siteResult.details.pages?.length || 0,
        competitorsSurveyed: compResult.details.competitors.length,
        aiPromptsRun: aiResult.details.length,
      },
      aiDetails: aiResult.details,
      compDetails: compResult.details,
      siteDetails: siteResult.details,
      strategicAnalysis,
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

async function generateStrategicAnalysis(
  input: ScanInput,
  scores: ScanScores,
  aiResult: { score: number; details: { mentioned: boolean }[] },
  siteResult: { score: number },
  compResult: { score: number; details: { competitors: unknown[]; gaps: string[] } }
): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const brandName = input.brand || input.domain || "this brand";
    const prompt = `You are a senior digital strategist writing a brief AI visibility assessment for a client named "${brandName}".

Here are the scan results:

- AI Visibility Score: ${scores.ai}/100 (the brand was mentioned in ${aiResult.details.filter((d) => d.mentioned).length} of ${aiResult.details.length} AI-generated responses to real buyer queries)
- Site Health Score: ${scores.site}/100 ${input.noSite ? "(no website)" : ""}
- Competitive Position Score: ${scores.comp}/100 (${compResult.details.competitors.length} competitors analyzed)
- Overall Score: ${scores.overall}/100

${compResult.details.gaps.length > 0 ? `Key competitive gaps found:\n${compResult.details.gaps.map((g) => `- ${g}`).join("\n")}` : ""}

Write a 3-4 paragraph strategic assessment. Be specific and direct — no filler, no generic advice. Reference the actual scores and findings. End with one clear, prioritized recommendation. Write in second person ("you", "your"). Do not use bullet points or headers — write in flowing prose. Do not mention that this is an AI-generated assessment.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return "";
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
