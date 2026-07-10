export type TenantPlan = "free" | "starter" | "pro" | "agency" | "white_label";

export interface PlanLimits {
  maxClients: number;       // Infinity = unlimited
  maxTeamMembers: number;   // Infinity = unlimited
  fileStorageMB: number;    // Infinity = unlimited
  sequences: boolean;
  aiMoodAnalysis: boolean;
  clientPortal: boolean;
  whiteLabel: boolean;
}

export const PLAN_LIMITS = {
  free: {
    maxClients:       5,
    maxTeamMembers:   2,
    fileStorageMB:    100,
    sequences:        false,
    aiMoodAnalysis:   false,
    clientPortal:     true,
    whiteLabel:       false,
  },
  starter: {
    maxClients:       25,
    maxTeamMembers:   5,
    fileStorageMB:    1_000,
    sequences:        true,
    aiMoodAnalysis:   false,
    clientPortal:     true,
    whiteLabel:       false,
  },
  pro: {
    maxClients:       100,
    maxTeamMembers:   15,
    fileStorageMB:    10_000,
    sequences:        true,
    aiMoodAnalysis:   true,
    clientPortal:     true,
    whiteLabel:       false,
  },
  agency: {
    maxClients:       Infinity,
    maxTeamMembers:   Infinity,
    fileStorageMB:    Infinity,
    sequences:        true,
    aiMoodAnalysis:   true,
    clientPortal:     true,
    whiteLabel:       false,
  },
  white_label: {
    maxClients:       Infinity,
    maxTeamMembers:   Infinity,
    fileStorageMB:    Infinity,
    sequences:        true,
    aiMoodAnalysis:   true,
    clientPortal:     true,
    whiteLabel:       true,
  },
} as const satisfies Record<TenantPlan, PlanLimits>;

export function getPlanLimits(plan: TenantPlan | undefined): PlanLimits {
  return PLAN_LIMITS[plan ?? "free"];
}

export function planAllows(
  plan: TenantPlan | undefined,
  feature: keyof Pick<PlanLimits, "sequences" | "aiMoodAnalysis" | "clientPortal" | "whiteLabel">
): boolean {
  return getPlanLimits(plan)[feature];
}
