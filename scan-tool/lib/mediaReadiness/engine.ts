import { nanoid } from "nanoid";
import { GoogleGenAI } from "@google/genai";
import { saveScan, getScan, updateScan } from "../redis";
import type { CategoryFinding, MediaReadinessFindings, MediaReadinessInput, MediaReadinessResult } from "./types";

export function createVerificationId(): string {
  return `mrq_${nanoid(12)}`;
}

export async function initVerification(id: string, input: MediaReadinessInput): Promise<void> {
  const record: MediaReadinessResult = {
    id,
    status: "processing",
    progress: 0,
    currentStep: "Starting research…",
    input,
    findings: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    error: null,
  };
  await saveScan(id, record as unknown as Record<string, unknown>);
}

export async function getVerification(id: string): Promise<MediaReadinessResult | null> {
  return (await getScan(id)) as MediaReadinessResult | null;
}

function getClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
}

// Point scales mirror the original self-report quiz options exactly, so an
// AI-verified finding merges into the same scoring math (prGrade/wikiGrade/
// catPr/catWiki/getGaps) with zero changes to that logic — only the source
// of truth for these 6 categories moves from self-report to search evidence.
const COVERAGE_SCALE: Record<string, { pr: number; wiki: number }> = {
  none: { pr: 0, wiki: 0 },
  "1-2": { pr: 4, wiki: 6 },
  "3-4": { pr: 8, wiki: 15 },
  "5+": { pr: 12, wiki: 25 },
};
const DEPTH_SCALE: Record<string, { pr: number; wiki: number }> = {
  unclear: { pr: 1, wiki: 1 },
  brief: { pr: 2, wiki: 3 },
  mixed: { pr: 5, wiki: 9 },
  "in-depth": { pr: 8, wiki: 15 },
};
const INDEPENDENCE_SCALE: Record<string, { pr: number; wiki: number }> = {
  unclear: { pr: 1, wiki: 1 },
  "mostly-paid": { pr: 2, wiki: 2 },
  mixed: { pr: 5, wiki: 8 },
  "mostly-independent": { pr: 8, wiki: 15 },
};
const AWARDS_SCALE: Record<string, { pr: number; wiki: number }> = {
  none: { pr: 0, wiki: 0 },
  nominated: { pr: 2, wiki: 4 },
  "one-or-two": { pr: 4, wiki: 7 },
  multiple: { pr: 6, wiki: 12 },
};
const REFERENCES_SCALE: Record<string, { pr: number; wiki: number }> = {
  none: { pr: 0, wiki: 0 },
  "own-site-only": { pr: 1, wiki: 1 },
  "few-entries": { pr: 2, wiki: 5 },
  "multiple-databases": { pr: 4, wiki: 10 },
};
const HISTORY_SCALE: Record<string, { pr: number; wiki: number }> = {
  unknown: { pr: 1, wiki: 1 },
  "2-5": { pr: 2, wiki: 4 },
  "5-10": { pr: 3, wiki: 7 },
  "10+": { pr: 4, wiki: 10 },
};

function parseSection(text: string, tag: string): Record<string, string> {
  const match = text.match(new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?=\\n\\[|$)`, "i"));
  const body = match?.[1] ?? "";
  const fields: Record<string, string> = {};
  for (const line of body.split("\n")) {
    const m = line.match(/^\s*([a-z_]+)\s*:\s*(.+?)\s*$/i);
    if (m) fields[m[1].toLowerCase()] = m[2].trim();
  }
  return fields;
}

function splitList(raw: string | undefined): string[] {
  if (!raw) return [];
  const lower = raw.trim().toLowerCase();
  if (!raw.trim() || lower === "none" || lower === "n/a") return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function pick<T extends Record<string, { pr: number; wiki: number }>>(
  scale: T,
  key: string | undefined,
  fallbackKey: keyof T
): { pr: number; wiki: number } {
  if (key && scale[key.toLowerCase()]) return scale[key.toLowerCase()];
  return scale[fallbackKey];
}

export async function runVerification(id: string, input: MediaReadinessInput): Promise<void> {
  try {
    await updateScan(id, { progress: 15, currentStep: "Searching for independent media coverage…" });

    const subject = input.brand?.trim() || input.name.trim();
    const websiteLine = input.website ? `Their website/handle: ${input.website}.` : "";

    const prompt = `You are a meticulous research assistant verifying a media/PR readiness assessment for "${subject}"${input.brand && input.brand !== input.name ? ` (contact: ${input.name})` : ""}. ${websiteLine}

Use web search to find real, verifiable evidence. Do not guess or invent sources — if you find nothing, say so honestly. Then respond in EXACTLY this plain-text format, filling in each field. Use only the allowed values shown for each "level"/"count" field.

[COVERAGE]
count: <none | 1-2 | 3-4 | 5+>
outlets: <comma-separated publication names you found covering them, or "none">

[DEPTH]
level: <unclear | brief | mixed | in-depth>

[INDEPENDENCE]
level: <unclear | mostly-paid | mixed | mostly-independent>

[AWARDS]
level: <none | nominated | one-or-two | multiple>
names: <comma-separated award/honour names found, or "none">

[REFERENCES]
level: <none | own-site-only | few-entries | multiple-databases>
databases: <comma-separated third-party databases/directories/archives found (e.g. IMDb, Discogs, industry registries), or "none">

[HISTORY]
years_active: <unknown | 2-5 | 5-10 | 10+>

[SUMMARY]
<2-3 sentence plain-English summary of what your search actually found, written for the subject to read>`;

    const ai = getClient();
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = result.text || "";

    await updateScan(id, { progress: 70, currentStep: "Scoring findings…" });

    const coverageFields = parseSection(text, "COVERAGE");
    const depthFields = parseSection(text, "DEPTH");
    const independenceFields = parseSection(text, "INDEPENDENCE");
    const awardsFields = parseSection(text, "AWARDS");
    const referencesFields = parseSection(text, "REFERENCES");
    const historyFields = parseSection(text, "HISTORY");
    const summaryMatch = text.match(/\[SUMMARY\]([\s\S]*)$/i);
    const summary = (summaryMatch?.[1] ?? "").trim() || "Search completed, but no clear summary was returned.";

    const coverageScore = pick(COVERAGE_SCALE, coverageFields.count, "none");
    const depthScore = pick(DEPTH_SCALE, depthFields.level, "unclear");
    const independenceScore = pick(INDEPENDENCE_SCALE, independenceFields.level, "unclear");
    const awardsScore = pick(AWARDS_SCALE, awardsFields.level, "none");
    const referencesScore = pick(REFERENCES_SCALE, referencesFields.level, "none");
    const historyScore = pick(HISTORY_SCALE, historyFields.years_active, "unknown");

    const findings: MediaReadinessFindings = {
      coverage: { ...coverageScore, summary, sources: splitList(coverageFields.outlets) },
      depth: { ...depthScore, summary: "", sources: [] },
      independence: { ...independenceScore, summary: "", sources: [] },
      awards: { ...awardsScore, summary: "", sources: splitList(awardsFields.names) },
      references: { ...referencesScore, summary: "", sources: splitList(referencesFields.databases) },
      history: { ...historyScore, summary: "", sources: [] },
    };

    await updateScan(id, {
      status: "complete",
      progress: 100,
      currentStep: "Research complete.",
      findings,
      completedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[media-readiness] runVerification failed:", message);

    // Fail open with the lowest-tier score for each category (mirroring the
    // quiz's own "haven't looked / not sure" options) rather than blocking
    // the person's report entirely — they still get a result, just without
    // the credit unverifiable claims would have earned.
    const fallback: MediaReadinessFindings = {
      coverage: { ...COVERAGE_SCALE.none, summary: "Couldn't complete the search for this section.", sources: [] },
      depth: { ...DEPTH_SCALE.unclear, summary: "", sources: [] },
      independence: { ...INDEPENDENCE_SCALE.unclear, summary: "", sources: [] },
      awards: { ...AWARDS_SCALE.none, summary: "", sources: [] },
      references: { ...REFERENCES_SCALE.none, summary: "", sources: [] },
      history: { ...HISTORY_SCALE.unknown, summary: "", sources: [] },
    };

    await updateScan(id, {
      status: "failed",
      progress: 100,
      currentStep: "Research failed — used minimum scores.",
      findings: fallback,
      error: message,
    });
  }
}

export function findingToAnswerEntries(
  qId: string,
  finding: CategoryFinding
): Record<string, number> {
  return { [`${qId}_pr`]: finding.pr, [`${qId}_wiki`]: finding.wiki };
}
