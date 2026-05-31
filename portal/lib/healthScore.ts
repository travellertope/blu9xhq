import type { BluuCommunication, CommMoodSentiment } from "@/types";

export type HealthStatus = "healthy" | "needs_attention" | "at_risk";

const MOOD_SCORES: Record<CommMoodSentiment, number> = {
  positive:  5,
  neutral:   4,
  mixed:     3,
  concerned: 2,
  at_risk:   1,
};

const DAY = 86_400_000;

export function calculateHealthScore(communications: BluuCommunication[]): HealthStatus {
  const now     = Date.now();
  const cut90   = now - 90 * DAY;
  const cut30   = now - 30 * DAY;
  const cut60   = now - 60 * DAY;

  // Entries with mood in last 90 days
  const recent = communications.filter((c) => {
    if (!c.mood) return false;
    return new Date(c.occurredAt || c.date).getTime() >= cut90;
  });

  if (recent.length === 0) return "needs_attention";

  // Must have at least one communication in last 30 days
  const hasRecent30 = communications.some(
    (c) => new Date(c.occurredAt || c.date).getTime() >= cut30
  );
  if (!hasRecent30) return "needs_attention";

  let weightedSum = 0;
  let totalWeight = 0;

  for (const c of recent) {
    const score  = MOOD_SCORES[c.mood as CommMoodSentiment] ?? 3;
    const ts     = new Date(c.occurredAt || c.date).getTime();
    const weight = ts >= cut30 ? 3 : ts >= cut60 ? 2 : 1;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const avg = weightedSum / totalWeight;
  if (avg >= 3.5) return "healthy";
  if (avg >= 2.5) return "needs_attention";
  return "at_risk";
}
