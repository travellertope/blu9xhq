export interface AiNarrativeDetail {
  prompt: string;
  mentioned: boolean;
  position: string;
  sentiment: string;
  hasCitation: boolean;
}

export interface AiNarrative {
  headline: string;
  bullets: string[];
}

export function buildAiNarrative(
  details: AiNarrativeDetail[],
  brandName: string
): AiNarrative {
  const total = details.length;
  if (total === 0) {
    return { headline: "No AI discoverability data is available for this scan.", bullets: [] };
  }

  const mentioned = details.filter((d) => d.mentioned);
  const mentionRate = Math.round((mentioned.length / total) * 100);

  const headline =
    mentioned.length === 0
      ? `${brandName} was not referenced in any of the ${total} real-world queries we put to AI tools — competitors are filling that space instead.`
      : `${brandName} appeared in ${mentioned.length} of ${total} AI-generated answers (${mentionRate}%) across the queries real buyers ask tools like ChatGPT and Perplexity.`;

  const bullets: string[] = [];

  if (mentioned.length > 0) {
    const positionCounts = { top: 0, middle: 0, bottom: 0 } as Record<string, number>;
    for (const d of mentioned) {
      if (d.position === "top" || d.position === "middle" || d.position === "bottom") {
        positionCounts[d.position]++;
      }
    }
    const dominantPosition = (Object.keys(positionCounts) as Array<keyof typeof positionCounts>).reduce(
      (a, b) => (positionCounts[a] >= positionCounts[b] ? a : b)
    );
    bullets.push(
      dominantPosition === "top"
        ? "When mentioned, the brand led the response — a strong signal of AI trust."
        : dominantPosition === "middle"
        ? "When mentioned, the brand appeared mid-response, behind at least one other option."
        : "When mentioned, the brand was buried near the end of the response, easy to miss."
    );

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 } as Record<string, number>;
    for (const d of mentioned) {
      if (d.sentiment === "positive" || d.sentiment === "neutral" || d.sentiment === "negative") {
        sentimentCounts[d.sentiment]++;
      }
    }
    const dominantSentiment = (Object.keys(sentimentCounts) as Array<keyof typeof sentimentCounts>).reduce(
      (a, b) => (sentimentCounts[a] >= sentimentCounts[b] ? a : b)
    );
    bullets.push(
      dominantSentiment === "positive"
        ? "Sentiment was largely favorable where the brand did come up."
        : dominantSentiment === "negative"
        ? "Sentiment leaned negative where the brand did come up — worth addressing directly."
        : "Sentiment was neutral — AI tools mention the brand without endorsing it."
    );

    const citedCount = mentioned.filter((d) => d.hasCitation).length;
    bullets.push(
      citedCount === 0
        ? "None of those mentions linked back to the site, so AI traffic isn't converting into visits."
        : `${citedCount} of ${mentioned.length} mentions included a direct link back to the site.`
    );
  } else {
    bullets.push(
      "Across every query tested, AI tools recommended other brands or stayed generic — none surfaced this one."
    );
  }

  return { headline, bullets };
}
