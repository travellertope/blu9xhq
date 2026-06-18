export interface ScanInput {
  domain?: string;
  brand?: string;
  niche?: string;
  noSite: boolean;
}

export interface ScanScores {
  ai: number;
  site: number;
  comp: number;
  overall: number;
}

export interface ScanVerdict {
  weakest: "ai" | "site" | "comp";
  message: string;
  recommendation: string;
  serviceUrl: string;
}

export interface ScanSummary {
  pagesChecked: number;
  competitorsSurveyed: number;
  aiPromptsRun: number;
}

export interface AiCheckResult {
  prompt: string;
  category: "informational" | "transactional" | "comparison" | "reputation";
  intent: string;
  mentioned: boolean;
  position: "top" | "middle" | "bottom" | "absent";
  sentiment: "positive" | "neutral" | "negative" | "absent";
  hasCitation: boolean;
  snippet: string;
}

export interface PageAnalysis {
  url: string;
  title: string;
  wordCount: number;
  headingCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  hasStructuredData: boolean;
  imageCount: number;
  imagesWithAlt: number;
}

export interface SiteDetails {
  dnsResolves: boolean;
  https: boolean;
  responseTimeMs: number;
  hasTitle: boolean;
  hasDescription: boolean;
  hasOgTags: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  hasStructuredData: boolean;
  hasLlmsTxt: boolean;
  hasBlog: boolean;
  hasCanonical: boolean;
  hasMobileViewport: boolean;
  totalPagesFound: number;
  avgWordCount: number;
  avgHeadingCount: number;
  avgInternalLinks: number;
  imageAltCoverage: number;
  pages: PageAnalysis[];
  homepageSummary: string;
}

export interface CompetitorProfile {
  name: string;
  domain: string | null;
  hasStructuredData: boolean;
  hasBlog: boolean;
  estimatedContentDepth: "thin" | "moderate" | "deep";
  wordCount: number;
}

export interface CompDetails {
  competitors: CompetitorProfile[];
  brandMentionedMoreThanCompetitors: boolean;
  relativePosition: "ahead" | "even" | "behind";
  gaps: string[];
}

export interface ScanResult {
  id: string;
  status: "processing" | "complete" | "failed";
  progress: number;
  currentStep: string;
  input: ScanInput;
  scores: ScanScores;
  verdict: ScanVerdict | null;
  summary: ScanSummary;
  aiDetails: AiCheckResult[] | null;
  compDetails: CompDetails | null;
  siteDetails: SiteDetails | null;
  strategicAnalysis: string | null;
  createdAt: string;
  completedAt: string | null;
  email: string | null;
  error: string | null;
}
