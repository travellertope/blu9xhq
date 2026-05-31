import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import type { MoodAnalysis, MoodSentiment, ChurnRisk } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL = "gemini-1.5-flash";

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Analyse the mood and churn risk of a client communication.
 * Returns a structured MoodAnalysis object.
 */
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

  // Strip markdown code fences if present
  const clean = text.replace(/^```json?\s*/i, "").replace(/\s*```$/, "");

  let parsed: Omit<MoodAnalysis, "analysedAt" | "model">;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${clean.slice(0, 200)}`);
  }

  return {
    ...parsed,
    analysedAt: new Date().toISOString(),
    model: MODEL,
  };
}

/**
 * Generate a draft follow-up email based on communication history.
 */
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
