export interface ScanInput {
  domain?: string;
  brand?: string;
  niche?: string;
  noSite: boolean;
}

export interface PillarScore {
  score: number;
  details: Record<string, unknown>;
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

export interface CompDetails {
  competitors: string[];
  brandMentionedMoreThanCompetitors: boolean;
  relativePosition: "ahead" | "even" | "behind";
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
  createdAt: string;
  completedAt: string | null;
  email: string | null;
  error: string | null;
}

export interface AiCheckResult {
  prompt: string;
  mentioned: boolean;
  position: "top" | "middle" | "bottom" | "absent";
  sentiment: "positive" | "neutral" | "negative" | "absent";
  hasCitation: boolean;
  snippet: string;
}
