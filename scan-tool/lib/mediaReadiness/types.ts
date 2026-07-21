export interface MediaReadinessInput {
  name: string;
  brand: string;
  website?: string;
}

export interface CategoryFinding {
  pr: number;
  wiki: number;
  summary: string;
  sources: string[];
}

export interface MediaReadinessFindings {
  coverage: CategoryFinding;
  depth: CategoryFinding;
  independence: CategoryFinding;
  awards: CategoryFinding;
  references: CategoryFinding;
  history: CategoryFinding;
}

export interface MediaReadinessResult {
  id: string;
  status: "processing" | "complete" | "failed";
  progress: number;
  currentStep: string;
  input: MediaReadinessInput;
  findings: MediaReadinessFindings | null;
  createdAt: string;
  completedAt: string | null;
  error: string | null;
}
