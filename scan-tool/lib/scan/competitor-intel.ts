import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface CompetitorResult {
  competitors: string[];
  brandMentionedMoreThanCompetitors: boolean;
  relativePosition: "ahead" | "even" | "behind";
}

export async function checkCompetitorIntel(
  domain: string | undefined,
  brand: string | undefined,
  niche: string | undefined
): Promise<{ score: number; details: CompetitorResult }> {
  const nicheLabel = niche || "their industry";
  const brandName = brand || domainToName(domain || "");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `List the top 5 companies or tools in the ${nicheLabel} space. For each, give just the company name. Then state whether "${brandName}" is among the most visible brands in this space. Reply in this exact JSON format: {"competitors": ["Name1","Name2","Name3","Name4","Name5"], "brandVisible": true/false}`,
        },
      ],
    });

    const textBlocks = response.content.filter((b) => b.type === "text");
    const fullText = textBlocks.map((b) => b.text).join("\n");

    let competitors: string[] = [];
    let brandVisible = false;

    const jsonMatch = fullText.match(/\{[\s\S]*"competitors"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        competitors = parsed.competitors || [];
        brandVisible = parsed.brandVisible === true;
      } catch {
        competitors = extractCompetitorNames(fullText);
        brandVisible = fullText.toLowerCase().includes(brandName.toLowerCase());
      }
    } else {
      competitors = extractCompetitorNames(fullText);
      brandVisible = fullText.toLowerCase().includes(brandName.toLowerCase());
    }

    const relativePosition: CompetitorResult["relativePosition"] = brandVisible
      ? "even"
      : "behind";

    const score = calculateCompScore(brandVisible, competitors.length > 0);

    return {
      score,
      details: {
        competitors: competitors.slice(0, 5),
        brandMentionedMoreThanCompetitors: brandVisible,
        relativePosition,
      },
    };
  } catch {
    return {
      score: 50,
      details: {
        competitors: [],
        brandMentionedMoreThanCompetitors: false,
        relativePosition: "even",
      },
    };
  }
}

function domainToName(domain: string): string {
  return domain
    .replace(/^(www\.)?/, "")
    .replace(/\.(com|io|co|net|org|ai|dev|app)$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractCompetitorNames(text: string): string[] {
  const lines = text.split("\n").filter((l) => /^\s*\d+[\.\)]\s/.test(l));
  return lines
    .map((l) => l.replace(/^\s*\d+[\.\)]\s*/, "").replace(/[*_`]/g, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

function calculateCompScore(brandVisible: boolean, hasCompetitors: boolean): number {
  if (!hasCompetitors) return 50;
  if (brandVisible) return 72;
  return 35;
}
