export interface CategorizedPrompt {
  prompt: string;
  category: "informational" | "transactional" | "comparison" | "reputation";
  intent: string;
}

export function generatePrompts(
  domain: string | undefined,
  brand: string | undefined,
  niche: string | undefined,
  siteIdentity?: SiteIdentity
): CategorizedPrompt[] {
  const detectedName = siteIdentity?.siteTitle
    ? siteIdentity.siteTitle.replace(/\s*[-–—|:•].+$/, "").replace(/\s*(home|official|website|page|welcome to)\s*/gi, "").trim()
    : "";
  const brandName = brand || (detectedName.length > 2 && detectedName.length < 40 ? detectedName : "") || domainToBrand(domain || "");

  if (!niche) {
    return [
      { prompt: `What does ${brandName} do and is it worth using?`, category: "informational", intent: "Brand awareness" },
      { prompt: `What are the best alternatives to ${brandName}?`, category: "comparison", intent: "Alternative search" },
      { prompt: `Is ${brandName} legit? What do customers say about it?`, category: "reputation", intent: "Trust evaluation" },
      { prompt: `Compare ${brandName} to its main competitors — which is better?`, category: "comparison", intent: "Head-to-head comparison" },
      { prompt: `Should a small business use ${brandName}? Pros and cons?`, category: "transactional", intent: "Purchase decision" },
      { prompt: `What companies are similar to ${brandName}?`, category: "informational", intent: "Market mapping" },
      { prompt: `${brandName} review — is it good for beginners?`, category: "reputation", intent: "User experience" },
      { prompt: `What problem does ${brandName} solve and who is it for?`, category: "informational", intent: "Value proposition" },
      { prompt: `I'm looking for a service like ${brandName} but better. What do you recommend?`, category: "transactional", intent: "Switching intent" },
      { prompt: `What is ${brandName} known for in its industry?`, category: "reputation", intent: "Industry authority" },
      { prompt: `How does ${brandName} pricing compare to competitors?`, category: "transactional", intent: "Price comparison" },
      { prompt: `Who are the market leaders in ${brandName}'s space?`, category: "comparison", intent: "Market leadership" },
    ];
  }

  return [
    { prompt: `What are the best ${niche} companies or tools right now?`, category: "informational", intent: "Category discovery" },
    { prompt: `Can you recommend a good ${niche} provider for a growing business?`, category: "transactional", intent: "Purchase decision" },
    { prompt: `What do people say about ${brandName}? Is it any good for ${niche}?`, category: "reputation", intent: "Trust evaluation" },
    { prompt: `Compare the top ${niche} options available today — which stands out?`, category: "comparison", intent: "Head-to-head comparison" },
    { prompt: `What ${niche} solution would you recommend for a small business and why?`, category: "transactional", intent: "SMB recommendation" },
    { prompt: `Who are the market leaders in ${niche} right now?`, category: "informational", intent: "Market leadership" },
    { prompt: `I need a ${niche} solution. What should I look for and who offers it?`, category: "transactional", intent: "Buying criteria" },
    { prompt: `What are the pros and cons of using ${brandName} for ${niche}?`, category: "reputation", intent: "Product evaluation" },
    { prompt: `Is ${brandName} a good choice for ${niche} compared to alternatives?`, category: "comparison", intent: "Alternative search" },
    { prompt: `What ${niche} trends should businesses pay attention to in 2025?`, category: "informational", intent: "Thought leadership" },
    { prompt: `Which ${niche} companies are growing fastest right now?`, category: "comparison", intent: "Market momentum" },
    { prompt: `What's missing from most ${niche} providers that ${brandName} does differently?`, category: "reputation", intent: "Differentiation" },
  ];
}

function domainToBrand(domain: string): string {
  return domain
    .replace(/^(www\.)?/, "")
    .replace(/\.(com|io|co|net|org|ai|dev|app)$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface SiteIdentity {
  siteTitle: string;
  tagline: string;
}

export function extractSiteIdentity(homepageSummary: string): SiteIdentity {
  const titleMatch = homepageSummary.match(/^Title:\s*(.+)$/m);
  const descMatch = homepageSummary.match(/^Description:\s*(.+)$/m);

  return {
    siteTitle: titleMatch?.[1]?.trim() || "",
    tagline: descMatch?.[1]?.trim() || "",
  };
}

export function extractBrandVariants(
  domain: string | undefined,
  brand: string | undefined,
  siteIdentity?: SiteIdentity
): string[] {
  const variants: string[] = [];

  if (brand) {
    variants.push(brand.toLowerCase());
  }

  if (domain) {
    const clean = domain.replace(/^(www\.)?/, "").toLowerCase();
    variants.push(clean);
    const name = clean.replace(/\.(com|io|co|net|org|ai|dev|app|co\.uk|ng|com\.ng)$/, "");
    variants.push(name);
    variants.push(name.replace(/[-_]/g, " "));

    if (/^the[a-z]/.test(name)) {
      const withoutThe = name.replace(/^the/, "");
      variants.push(withoutThe);
      variants.push(withoutThe.replace(/[-_]/g, " "));
    }
  }

  if (brand) {
    const lowerBrand = brand.toLowerCase();
    if (/^the\s+/.test(lowerBrand)) {
      variants.push(lowerBrand.replace(/^the\s+/, ""));
    }
  }

  if (siteIdentity?.siteTitle) {
    const title = siteIdentity.siteTitle;
    const cleanTitle = title
      .replace(/\s*[-–—|:•].+$/, "")
      .replace(/\s*(home|official|website|page|welcome to)\s*/gi, "")
      .trim();

    if (cleanTitle.length > 2 && cleanTitle.length < 60) {
      variants.push(cleanTitle.toLowerCase());
      const words = cleanTitle.split(/\s+/);
      if (words.length <= 3 && words[0].length > 2) {
        variants.push(words[0].toLowerCase());
      }
    }
  }

  return Array.from(new Set(variants.filter((v) => v && v.length > 2)));
}
