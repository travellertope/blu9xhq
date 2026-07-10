import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { z } from "zod";
import type { MoodAnalysis } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL = "gemini-1.5-flash";

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function analyseClientMood(params: {
  communicationText: string;
  clientName: string;
  channel: string;
  historicalContext?: string;
}): Promise<MoodAnalysis> {
  const model = genAI.getGenerativeModel({ model: MODEL, safetySettings });

  const prompt = `You are a client sentiment analyst for a creative agency. Analyse the following client communication and return a JSON object only — no markdown, no explanation.

CLIENT: ${params.clientName}
CHANNEL: ${params.channel}
${params.historicalContext ? `CONTEXT: ${params.historicalContext}\n` : ""}
COMMUNICATION:
${params.communicationText}

Return exactly this JSON structure:
{
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "score": <number between -1.0 and 1.0>,
  "churnRisk": "low" | "medium" | "high" | "critical",
  "summary": "<one sentence summary>",
  "keyThemes": ["<theme1>", "<theme2>"],
  "suggestedActions": ["<action1>", "<action2>"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/^```json?\s*/i, "").replace(/\s*```$/, "");

  let parsed: Omit<MoodAnalysis, "analysedAt" | "model">;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${clean.slice(0, 200)}`);
  }

  return { ...parsed, analysedAt: new Date().toISOString(), model: MODEL };
}

export async function generateFollowUpDraft(params: {
  clientName: string;
  companyName: string;
  lastCommunicationSummary: string;
  tone: "professional" | "friendly" | "urgent";
}): Promise<{ subject: string; body: string }> {
  const model = genAI.getGenerativeModel({ model: MODEL, safetySettings });

  const prompt = `Write a follow-up email from a creative agency to a client. Return JSON only with "subject" and "body" fields.

CLIENT: ${params.clientName} at ${params.companyName}
LAST INTERACTION: ${params.lastCommunicationSummary}
TONE: ${params.tone}

JSON format: { "subject": "...", "body": "..." }`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/^```json?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(clean);
}

// ─── Batch 4: direct-fetch mood analysis ──────────────────────────────────────

const moodSchema = z.object({
  sentiment:  z.enum(["positive", "neutral", "mixed", "concerned", "at_risk"]),
  reasoning:  z.string(),
  red_flags:  z.array(z.string()),
});

export type CommMoodAnalysis = z.infer<typeof moodSchema>;

const MOOD_PROMPT = (content: string) =>
  `You are a client relationship analyst for a creative agency. Analyse the following client communication and return a JSON object with exactly these fields:
- 'sentiment': one of exactly ['positive', 'neutral', 'mixed', 'concerned', 'at_risk']
- 'reasoning': a single sentence explaining the sentiment (max 20 words, plain language)
- 'red_flags': an array of short phrases from the text that signal risk or dissatisfaction (empty array if none)

Return ONLY the JSON object. No preamble, no markdown, no extra text.

Communication to analyse:
${content}`;

export async function analyseMood(content: string): Promise<CommMoodAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: MOOD_PROMPT(content) }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini API ${res.status}: ${text}`);
  }

  const data = await res.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    return moodSchema.parse(JSON.parse(raw));
  } catch {
    return { sentiment: "neutral", reasoning: "Could not analyse", red_flags: [] };
  }
}
