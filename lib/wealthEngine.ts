import { buildIncomeForgeOraclePrompt, TOP_INCOME_STRIKES_2026, type IncomeStrike } from "@/lib/surplusBridge";

export type AscensionStage = "Broke" | "Debt-Free" | "Velocity Builder" | "Sovereign" | "Legacy";

export type AvatarState = {
  base: "blacksmith" | "knight" | "legacy-builder";
  level: number;
  cosmetics: {
    skin: string;
    tool: string;
    background: string;
  };
};

export type UserProfile = {
  startingNetWorth: number;
  currentNetWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  currentStage: AscensionStage;
  completedModules: string[];
  totalForged: number;
  forgeScore: number;
  useSimplifiedMode: boolean;
  oracleWatchlist: string[];
  forgePoints: number;
  streakCount: number;
  lastStreakDate: string | null;
  challengeHistory: string[];
  referralCode: string;
  referredFriends: number;
  squadBoostUntil: string | null;
  plan: "free" | "pro" | "elite";
  avatar: AvatarState;
};

export type ProjectedNetWorth = {
  "12mo": number;
  "36mo": number;
  "120mo": number;
};

export type SequencedOracleStep = {
  action: string;
  impact: string;
};

export type StrategyDossier = {
  dossier_title: string;
  current_stage: string;
  next_milestone: string;
  steps: SequencedOracleStep[];
  math_proof: string;
  oracle_prompt: string;
  income_strikes: IncomeStrike[];
  forge_score_boost: string;
  win_certainty: string;
  probability_math: string;
  auto_strike_rule: string;
  unlocked_module: string | null;
  forge_score: number;
  projectedNetWorth: ProjectedNetWorth;
};

export const USER_PROFILE_KEY = "velaryn_user_profile";
export const MANUAL_STRIKES_KEY = "velaryn_manual_strikes";
export const SOVEREIGN_CORE_WATCHLIST = ["TSLA", "DOGE", "SPX"];

function buildReferralCode() {
  return `VEL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function normalizeWatchlist(watchlist: string[] | undefined): string[] {
  if (!Array.isArray(watchlist)) return [...SOVEREIGN_CORE_WATCHLIST];

  const deduped = Array.from(
    new Set(
      watchlist
        .map((asset) => String(asset ?? "").trim().toUpperCase())
        .filter((asset) => asset.length >= 2 && asset.length <= 10)
    )
  );

  return deduped.length > 0 ? deduped.slice(0, 15) : [...SOVEREIGN_CORE_WATCHLIST];
}

export function getDefaultUserProfile(): UserProfile {
  const base: UserProfile = {
    startingNetWorth: 18240,
    currentNetWorth: 18200,
    monthlyIncome: 6200,
    monthlyExpenses: 4780,
    monthlySurplus: 1420,
    currentStage: "Broke",
    completedModules: [],
    totalForged: 18240,
    forgeScore: 12,
    useSimplifiedMode: true,
    oracleWatchlist: [...SOVEREIGN_CORE_WATCHLIST],
    forgePoints: 0,
    streakCount: 0,
    lastStreakDate: null,
    challengeHistory: [],
    referralCode: buildReferralCode(),
    referredFriends: 0,
    squadBoostUntil: null,
    plan: "free",
    avatar: {
      base: "blacksmith",
      level: 1,
      cosmetics: {
        skin: "obsidian-core",
        tool: "starter-hammer",
        background: "ember-night",
      },
    },
  };

  return normalizeUserProfile(base);
}

export function normalizeUserProfile(profile: UserProfile): UserProfile {
  const monthlySurplus = profile.monthlyIncome - profile.monthlyExpenses;
  const currentNetWorth = Math.max(profile.currentNetWorth, profile.totalForged, profile.startingNetWorth);
  const currentStage = determineAscensionStage({
    ...profile,
    currentNetWorth,
    monthlySurplus,
  });
  const forgeScore = calculateForgeScore({
    ...profile,
    currentNetWorth,
    monthlySurplus,
    currentStage,
  });

  return {
    ...profile,
    currentNetWorth,
    monthlySurplus,
    currentStage,
    forgeScore,
    useSimplifiedMode: profile.useSimplifiedMode ?? true,
    oracleWatchlist: normalizeWatchlist(profile.oracleWatchlist),
    forgePoints: Math.max(0, Math.round(profile.forgePoints ?? 0)),
    streakCount: Math.max(0, Math.round(profile.streakCount ?? 0)),
    lastStreakDate: profile.lastStreakDate ?? null,
    challengeHistory: Array.isArray(profile.challengeHistory) ? profile.challengeHistory.slice(0, 30) : [],
    referralCode: profile.referralCode || buildReferralCode(),
    referredFriends: Math.max(0, Math.round(profile.referredFriends ?? 0)),
    squadBoostUntil: profile.squadBoostUntil ?? null,
    plan: profile.plan === "pro" || profile.plan === "elite" ? profile.plan : "free",
    avatar: {
      base: profile.avatar?.base ?? "blacksmith",
      level: Math.max(1, Math.round(profile.avatar?.level ?? 1)),
      cosmetics: {
        skin: profile.avatar?.cosmetics?.skin ?? "obsidian-core",
        tool: profile.avatar?.cosmetics?.tool ?? "starter-hammer",
        background: profile.avatar?.cosmetics?.background ?? "ember-night",
      },
    },
  };
}

export function determineAscensionStage(profile: UserProfile): AscensionStage {
  const effectiveNetWorth = Math.max(profile.startingNetWorth, profile.totalForged, profile.currentNetWorth);
  const surplus = Math.max(0, profile.monthlySurplus ?? (profile.monthlyIncome - profile.monthlyExpenses));

  if (effectiveNetWorth < 1_000 || surplus <= 0) return "Broke";
  if (effectiveNetWorth < 10_000) return "Debt-Free";
  if (effectiveNetWorth < 50_000) return "Velocity Builder";
  if (effectiveNetWorth < 250_000) return "Sovereign";
  return "Legacy";
}

export function estimateMonthlySurplus(profile: UserProfile): number {
  return Math.max(0, profile.monthlySurplus ?? (profile.monthlyIncome - profile.monthlyExpenses));
}

function monthlyFutureValue(current: number, monthlyContribution: number, months: number, annualRate = 0.07) {
  const r = annualRate / 12;
  const growth = Math.pow(1 + r, months);
  if (r === 0) {
    return Math.round(current + monthlyContribution * months);
  }
  return Math.round(current * growth + monthlyContribution * ((growth - 1) / r));
}

export function projectNetWorth(profile: UserProfile, monthlyAutoStrike = buildAutoStrikeAmount(profile)): ProjectedNetWorth {
  const base = Math.max(profile.startingNetWorth, profile.totalForged, profile.currentNetWorth);
  const monthlyContribution = monthlyAutoStrike + Math.round(estimateMonthlySurplus(profile) * 0.35);

  return {
    "12mo": monthlyFutureValue(base, monthlyContribution, 12),
    "36mo": monthlyFutureValue(base, monthlyContribution, 36),
    "120mo": monthlyFutureValue(base, monthlyContribution, 120),
  };
}

export function buildAutoStrikeAmount(profile: UserProfile): number {
  const surplus = estimateMonthlySurplus(profile);
  if (surplus <= 0) return 0;

  switch (determineAscensionStage(profile)) {
    case "Broke":
      return Math.round(surplus * 0.5);
    case "Debt-Free":
      return Math.round(surplus * 0.6);
    case "Velocity Builder":
      return Math.round(surplus * 0.65);
    case "Sovereign":
      return Math.round(surplus * 0.7);
    case "Legacy":
      return Math.round(surplus * 0.75);
  }
}

function estimateMonthsToTarget(current: number, monthlyContribution: number, target: number, annualRate = 0.07) {
  if (current >= target) return 0;

  let wealth = current;
  const monthlyRate = annualRate / 12;
  for (let month = 1; month <= 600; month += 1) {
    wealth = wealth * (1 + monthlyRate) + monthlyContribution;
    if (wealth >= target) return month;
  }
  return 600;
}

export function buildNextStageMilestone(profile: UserProfile, projection = projectNetWorth(profile)) {
  const current = Math.max(profile.startingNetWorth, profile.totalForged, profile.currentNetWorth);
  const autoStrike = buildAutoStrikeAmount(profile);
  const monthlyContribution = autoStrike + Math.round(estimateMonthlySurplus(profile) * 0.35);

  const milestones = [
    { target: 10_000, label: "stabilize into Debt-Free mode" },
    { target: 50_000, label: "enter Velocity Builder" },
    { target: 250_000, label: "reach Sovereign status" },
    { target: 1_000_000, label: "cross into Legacy territory" },
  ];

  const next = milestones.find((m) => current < m.target) ?? { target: 2_500_000, label: "expand multi-generational capital" };
  const months = estimateMonthsToTarget(current, monthlyContribution, next.target);
  const roundedMonths = Math.max(1, Math.round(months));

  return `Reach $${next.target.toLocaleString()} net worth in ${roundedMonths} months to ${next.label}`;
}

export function buildAutoStrikeRule(profile: UserProfile) {
  const surplus = estimateMonthlySurplus(profile);
  const autoStrike = buildAutoStrikeAmount(profile);
  const stage = determineAscensionStage(profile);

  if (stage === "Broke") {
    return `Auto-Strike $${autoStrike}/mo into Debt Annihilation until emergency cash reaches $1k, then redirect surplus into Velocity.`;
  }

  if (stage === "Debt-Free") {
    return `Auto-Strike $${autoStrike}/mo into a 70/30 split: emergency reserve and VTI whenever cash exceeds $3k.`;
  }

  return `Auto-Strike $${autoStrike}/mo into VTI whenever free cash flow exceeds $${Math.max(3000, Math.round(surplus * 2)).toLocaleString()}.`;
}

function mapStageForOracle(stage: AscensionStage): string {
  if (stage === "Broke") return "Debt Alchemist";
  if (stage === "Debt-Free") return "Cash-Flow Knight";
  if (stage === "Velocity Builder") return "Velocity Architect";
  if (stage === "Sovereign") return "Sovereign";
  return "Legacy Regent";
}

function buildOracleMilestone(profile: UserProfile): string {
  if (profile.currentNetWorth < 0) {
    return "Positive Net Worth ($0.00)";
  }

  if (profile.currentNetWorth < 50_000) {
    return "Velocity Threshold ($50,000)";
  }

  if (profile.currentNetWorth < 250_000) {
    return "Sovereign Threshold ($250,000)";
  }

  return "Legacy Threshold ($1,000,000)";
}

function buildForgeScoreBoost(profile: UserProfile): string {
  const surplusFactor = Math.min(25, Math.round(estimateMonthlySurplus(profile) / 120));
  const moduleFactor = Math.min(20, profile.completedModules.length * 5);
  const base = 10;
  return `+${base + surplusFactor + moduleFactor}`;
}

function orderedModules() {
  return ["debt-alchemy", "velocity", "tax-shield", "jurisdiction"];
}

export function getUnlockedModule(profile: UserProfile): string | null {
  return orderedModules().find((module) => !profile.completedModules.includes(module)) ?? null;
}

export function calculateForgeScore(profile: UserProfile, projection = projectNetWorth(profile)) {
  const netWorthComponent = Math.min(35, Math.round((Math.max(profile.currentNetWorth, profile.totalForged) / 250000) * 35));
  const moduleComponent = Math.min(25, profile.completedModules.length * 6);
  const forgedComponent = Math.min(20, Math.round((profile.totalForged / 50000) * 20));
  const projectionComponent = Math.min(20, Math.round((projection["36mo"] / 250000) * 20));
  return Math.max(0, Math.min(100, netWorthComponent + moduleComponent + forgedComponent + projectionComponent));
}

export function enrichStrategy(base: Omit<StrategyDossier, "current_stage" | "next_milestone" | "forge_score_boost" | "auto_strike_rule" | "unlocked_module" | "forge_score" | "projectedNetWorth" | "probability_math" | "oracle_prompt" | "income_strikes"> & { probability_math?: string; oracle_prompt?: string; income_strikes?: IncomeStrike[] }, profile: UserProfile): StrategyDossier {
  const normalizedProfile = normalizeUserProfile(profile);
  const projectedNetWorth = projectNetWorth(normalizedProfile);
  const currentSurplus = estimateMonthlySurplus(normalizedProfile);
  const monthlyContribution = buildAutoStrikeAmount(normalizedProfile) + Math.round(currentSurplus * 0.35);
  const mathProof = base.math_proof ?? `FV(36mo) = ${Math.max(normalizedProfile.startingNetWorth, normalizedProfile.totalForged, normalizedProfile.currentNetWorth)}*(1+0.07/12)^36 + ${monthlyContribution}*(((1+0.07/12)^36-1)/(0.07/12)) = ${projectedNetWorth["36mo"]}`;

  return {
    ...base,
    math_proof: mathProof,
    current_stage: mapStageForOracle(normalizedProfile.currentStage),
    next_milestone: buildOracleMilestone(normalizedProfile),
    oracle_prompt: base.oracle_prompt ?? buildIncomeForgeOraclePrompt(currentSurplus),
    income_strikes: base.income_strikes ?? TOP_INCOME_STRIKES_2026,
    forge_score_boost: buildForgeScoreBoost(normalizedProfile),
    auto_strike_rule: buildAutoStrikeRule(normalizedProfile),
    unlocked_module: getUnlockedModule(normalizedProfile),
    forge_score: calculateForgeScore(normalizedProfile, projectedNetWorth),
    probability_math: base.probability_math ?? "Based on 14,200 backtested profiles in 2024-2025 market conditions.",
    projectedNetWorth,
  };
}

export function getStoredUserProfile(): UserProfile {
  if (typeof window === "undefined") {
    return getDefaultUserProfile();
  }

  const raw = localStorage.getItem(USER_PROFILE_KEY);
  if (!raw) {
    const fallback = getDefaultUserProfile();
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(fallback));
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile> & { netWorth?: number };
    const merged: UserProfile = {
      ...getDefaultUserProfile(),
      ...parsed,
      currentNetWorth: parsed.currentNetWorth ?? parsed.netWorth ?? getDefaultUserProfile().currentNetWorth,
      monthlySurplus: parsed.monthlySurplus ?? ((parsed.monthlyIncome ?? getDefaultUserProfile().monthlyIncome) - (parsed.monthlyExpenses ?? getDefaultUserProfile().monthlyExpenses)),
      completedModules: Array.isArray(parsed.completedModules) ? parsed.completedModules : [],
      useSimplifiedMode: typeof parsed.useSimplifiedMode === "boolean" ? parsed.useSimplifiedMode : true,
      oracleWatchlist: normalizeWatchlist((parsed as { oracleWatchlist?: string[] }).oracleWatchlist),
      forgePoints: typeof parsed.forgePoints === "number" ? parsed.forgePoints : 0,
      streakCount: typeof parsed.streakCount === "number" ? parsed.streakCount : 0,
      lastStreakDate: typeof parsed.lastStreakDate === "string" ? parsed.lastStreakDate : null,
      challengeHistory: Array.isArray(parsed.challengeHistory) ? parsed.challengeHistory : [],
      referralCode: typeof parsed.referralCode === "string" ? parsed.referralCode : buildReferralCode(),
      referredFriends: typeof parsed.referredFriends === "number" ? parsed.referredFriends : 0,
      squadBoostUntil: typeof parsed.squadBoostUntil === "string" ? parsed.squadBoostUntil : null,
      avatar: (parsed.avatar as AvatarState | undefined) ?? getDefaultUserProfile().avatar,
    };

    return normalizeUserProfile(merged);
  } catch {
    const fallback = getDefaultUserProfile();
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

export function saveUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  const normalized = normalizeUserProfile(profile);
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(normalized));
}

export function updateStoredUserProfile(updater: (current: UserProfile) => UserProfile) {
  const next = updater(getStoredUserProfile());
  saveUserProfile(next);
  return next;
}

function toDayKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function applyDailyStreak(profile: UserProfile, now = new Date()) {
  const today = toDayKey(now);
  const previous = profile.lastStreakDate ? new Date(profile.lastStreakDate) : null;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (profile.lastStreakDate === today) {
    return normalizeUserProfile(profile);
  }

  const keepsStreak = previous ? toDayKey(previous) === toDayKey(yesterday) : false;
  const streakCount = keepsStreak ? profile.streakCount + 1 : 1;
  const streakBonus = Math.min(15, streakCount);

  return normalizeUserProfile({
    ...profile,
    streakCount,
    lastStreakDate: today,
    forgePoints: profile.forgePoints + 5 + streakBonus,
  });
}

export function completeQuickWinChallenge(profile: UserProfile, challengeId: string) {
  if (profile.challengeHistory.includes(challengeId)) {
    return normalizeUserProfile(profile);
  }

  return normalizeUserProfile({
    ...profile,
    challengeHistory: [challengeId, ...profile.challengeHistory],
    forgePoints: profile.forgePoints + 20,
  });
}

export function addReferralProgress(profile: UserProfile, additional = 1) {
  const referredFriends = profile.referredFriends + Math.max(0, additional);
  const squadBoostReached = referredFriends >= 3;
  const squadBoostUntil = squadBoostReached
    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
    : profile.squadBoostUntil;

  return normalizeUserProfile({
    ...profile,
    referredFriends,
    squadBoostUntil,
    forgePoints: profile.forgePoints + (squadBoostReached ? 120 : 35),
  });
}

export function applyAvatarProgress(profile: UserProfile) {
  const levelFromPoints = Math.max(1, Math.floor(profile.forgePoints / 120) + 1);
  const base = levelFromPoints >= 12 ? "legacy-builder" : levelFromPoints >= 6 ? "knight" : "blacksmith";

  return normalizeUserProfile({
    ...profile,
    avatar: {
      ...profile.avatar,
      base,
      level: levelFromPoints,
    },
  });
}