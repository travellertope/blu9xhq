export function generatePrompts(
  domain: string | undefined,
  brand: string | undefined,
  niche: string | undefined
): string[] {
  const brandName = brand || domainToBrand(domain || "");
  const nicheLabel = niche || "their industry";

  return [
    `What are the best ${nicheLabel} companies or tools right now?`,
    `Can you recommend a good ${nicheLabel} provider?`,
    `What do people say about ${brandName}? Is it any good?`,
    `Compare the top ${nicheLabel} options available today.`,
    `What ${nicheLabel} solution would you recommend for a small business?`,
  ];
}

function domainToBrand(domain: string): string {
  return domain
    .replace(/^(www\.)?/, "")
    .replace(/\.(com|io|co|net|org|ai|dev|app)$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function extractBrandVariants(
  domain: string | undefined,
  brand: string | undefined
): string[] {
  const variants: string[] = [];

  if (brand) {
    variants.push(brand.toLowerCase());
  }

  if (domain) {
    const clean = domain.replace(/^(www\.)?/, "").toLowerCase();
    variants.push(clean);
    const name = clean.replace(/\.(com|io|co|net|org|ai|dev|app)$/, "");
    variants.push(name);
    variants.push(name.replace(/[-_]/g, " "));
  }

  return Array.from(new Set(variants.filter(Boolean)));
}
