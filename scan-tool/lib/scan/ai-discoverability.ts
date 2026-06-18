import { GoogleGenerativeAI } from "@google/generative-ai";
import { generatePrompts, extractBrandVariants } from "./prompts";
import type { AiCheckResult } from "./types";

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ googleSearch: {} } as never],
  });
}

export async function checkAiDiscoverability(
  domain: string | undefined,
  brand: string | undefined,
  niche: string | undefined
): Promise<{ score: number; details: AiCheckResult[] }> {
  const prompts = generatePrompts(domain, brand, niche);
  const variants = extractBrandVariants(domain, brand);

  const results: AiCheckResult[] = [];

  for (const prompt of prompts) {
    const result = await runSingleCheck(prompt, variants);
    results.push(result);
  }

  const score = calculateScore(results);
  return { score, details: results };
}

async function runSingleCheck(
  prompt: string,
  brandVariants: string[]
): Promise<AiCheckResult> {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const fullText = result.response.text();
    const lower = fullText.toLowerCase();

    const mentioned = brandVariants.some((v) => lower.includes(v));

    let position: AiCheckResult["position"] = "absent";
    if (mentioned) {
      const firstIndex = Math.min(
        ...brandVariants
          .map((v) => lower.indexOf(v))
          .filter((i) => i >= 0)
      );
      const relativePos = firstIndex / lower.length;
      if (relativePos < 0.33) position = "top";
      else if (relativePos < 0.66) position = "middle";
      else position = "bottom";
    }

    let sentiment: AiCheckResult["sentiment"] = "absent";
    if (mentioned) {
      sentiment = classifySentiment(fullText, brandVariants);
    }

    const hasCitation = brandVariants.some((v) => {
      const urlPattern = new RegExp(`https?://[^\\s]*${v.replace(/\s/g, "")}`, "i");
      return urlPattern.test(fullText);
    });

    const snippet = mentioned
      ? extractSnippet(fullText, brandVariants)
      : "";

    return { prompt, mentioned, position, sentiment, hasCitation, snippet };
  } catch {
    return {
      prompt,
      mentioned: false,
      position: "absent",
      sentiment: "absent",
      hasCitation: false,
      snippet: "",
    };
  }
}

function classifySentiment(
  text: string,
  variants: string[]
): AiCheckResult["sentiment"] {
  const lower = text.toLowerCase();
  for (const v of variants) {
    const idx = lower.indexOf(v);
    if (idx < 0) continue;
    const window = lower.slice(Math.max(0, idx - 100), idx + v.length + 100);
    const positive = /\b(great|excellent|best|top|leading|popular|reliable|trusted|recommend|strong|standout)\b/.test(window);
    const negative = /\b(poor|bad|worst|avoid|unreliable|outdated|weak|lacking|disappointing)\b/.test(window);
    if (positive && !negative) return "positive";
    if (negative && !positive) return "negative";
  }
  return "neutral";
}

function extractSnippet(text: string, variants: string[]): string {
  const lower = text.toLowerCase();
  for (const v of variants) {
    const idx = lower.indexOf(v);
    if (idx < 0) continue;
    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + v.length + 100);
    return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
  }
  return "";
}

function calculateScore(results: AiCheckResult[]): number {
  const total = results.length;
  if (total === 0) return 0;

  const mentioned = results.filter((r) => r.mentioned);
  const mentionRate = mentioned.length / total;
  const mentionPoints = Math.round(mentionRate * 40);

  let positionPoints = 0;
  for (const r of mentioned) {
    if (r.position === "top") positionPoints += 20 / total;
    else if (r.position === "middle") positionPoints += 12 / total;
    else if (r.position === "bottom") positionPoints += 5 / total;
  }
  positionPoints = Math.round(positionPoints);

  let sentimentPoints = 0;
  for (const r of mentioned) {
    if (r.sentiment === "positive") sentimentPoints += 15 / total;
    else if (r.sentiment === "neutral") sentimentPoints += 8 / total;
  }
  sentimentPoints = Math.round(sentimentPoints);

  const citationCount = mentioned.filter((r) => r.hasCitation).length;
  const citationPoints = Math.round((citationCount / total) * 15);

  const consistencyPoints =
    mentionRate >= 0.6 ? 10 : mentionRate >= 0.4 ? 6 : mentionRate >= 0.2 ? 3 : 0;

  return Math.min(100, mentionPoints + positionPoints + sentimentPoints + citationPoints + consistencyPoints);
}
