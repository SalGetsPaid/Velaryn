export type ForgeEventType =
  | "STRIKE"
  | "SHIELD"
  | "UPGRADE"
  | "INCOME_BOOST"
  | "TAX_SHIELD"
  | "ASSET_TRACK"
  | "GROK_STRIKE"
  | "ON_CHAIN"
  | "MEME_MULTIPLIER"
  | "MICRO_STRIKE";

export type ForgeEvent = {
  id: number;
  type: ForgeEventType;
  title: string;
  amount: number;
  impact: string;
  date: string;
  roundUpAmount?: number;
  originalTransaction?: string;
  txHash?: string;
  grokInsight?: string;
  syncStatus?: "pending" | "synced" | "failed";
};

export type NextBestAction = {
  title: string;
  detail: string;
  cta: string;
  priority: "high" | "medium" | "low";
};

export type WeeklySummary = {
  message: string;
  deployed: number;
  strikeCount: number;
  shieldCount: number;
};

export type CoachInsight = {
  message: string;
  priority: "high" | "medium" | "low";
};

export type Plan = "free" | "pro" | "elite";

export type CommandPriority = "high" | "medium" | "low";

export type LoopCommand = {
  title: string;
  reason: string;
  amount: number;
  impact: number;
  priority: CommandPriority;
};

export type Command = LoopCommand;

export type LinkedAccount = {
  id: string;
  name: string;
  balance: number;
  type: "checking" | "savings" | "investment";
  subtype: string;
};

export type PlaidAccount = LinkedAccount;

export type AdaptiveContext = {
  eventCount: number;
  recent7dCount: number;
  recentStrikeCount: number;
  recentIdleDays: number;
  totalBuilt: number;
  liquidBalance?: number;
  primaryAccountName?: string;
};

type SimplifiedProfile = {
  useSimplifiedMode: boolean;
  completedModules: string[];
  monthlySurplus: number;
  forgeScore?: number;
};

export type LedgerModuleName =
  | "AlphaPulse"
  | "ArbitragePulse"
  | "TelemetryLedger"
  | "GrokHorizon"
  | "ForgeDuel"
  | "SquadBoost";

export interface LedgerSyncResponse {
  netCashFlow: number;
  autoStrikeAmount: number;
  suggestion: string;
  projectedForge: Array<{ label: string; projected: number }>;
  autoStrikeEvent: ForgeEvent | null;
  incomeBoostEvent?: ForgeEvent | null;
  alphaPulse?: string;
  memeMultiplierActive: boolean;
  arbitragePulse?: {
    rail: "FedNow/RTP";
    captureRateBps: number;
    annualizedYieldCapture: number;
    status: "active" | "warming";
    spreadCapturedToday: number;
    nextSettlementWindow: string;
  };
  sovereignEfficiency?: {
    score: number;
    label: "Dormant" | "Tactical" | "Elite";
    efficiencyDragPct: number;
    idleCash: number;
    workingCapitalRatio: number;
  };
  oracleInsights?: {
    selectedAssets: string[];
    currentMomentum: number;
    projected30YWithSelection: number;
    riskAdjustedYield: number;
  };
}

export type LabelKey =
  | "strike"
  | "shield"
  | "yieldArbitrage"
  | "autoStrikeRouting"
  | "projectedForge30Y"
  | "alphaPulse";

export const simplifiedLabels: Record<LabelKey, { label: string; helper: string }> = {
  strike: {
    label: "Capital Deployment",
    helper: "Moving money into growth assets like stocks or crypto.",
  },
  shield: {
    label: "Risk Protection",
    helper: "Steps that reduce downside risk, such as defensive allocation.",
  },
  yieldArbitrage: {
    label: "Smart Yield Opportunity",
    helper: "Ways to earn extra return with controlled incremental risk.",
  },
  autoStrikeRouting: {
    label: "Automatic Monthly Investment",
    helper: "A recurring monthly deployment from surplus into growth lanes.",
  },
  projectedForge30Y: {
    label: "30-Year Growth Projection",
    helper: "Estimated growth trajectory at a 7% long-term base case.",
  },
  alphaPulse: {
    label: "Market Insight Snapshot",
    helper: "Real-time Grok context for current market regime and posture.",
  },
};

const sovereignLabels: Record<LabelKey, { label: string; helper: string }> = {
  strike: {
    label: "Strike",
    helper: "Deploy sovereign capital into conviction-weighted growth lanes.",
  },
  shield: {
    label: "Shield",
    helper: "Defensive layer used to preserve downside resilience.",
  },
  yieldArbitrage: {
    label: "Yield Arbitrage",
    helper: "Capture excess yield by routing surplus with tactical precision.",
  },
  autoStrikeRouting: {
    label: "Auto-Strike Routing",
    helper: "Rule-bound recurring deployment synchronized to cash velocity.",
  },
  projectedForge30Y: {
    label: "Projected 30-Year Forge",
    helper: "Compounding trajectory under fiduciary deployment assumptions.",
  },
  alphaPulse: {
    label: "Alpha Pulse",
    helper: "Oracle snapshot of current momentum, volatility, and regime shift.",
  },
};

export function getLabel(key: LabelKey, useSimplifiedMode: boolean) {
  return (useSimplifiedMode ? simplifiedLabels : sovereignLabels)[key];
}

export const BIOMETRIC_LOCK_KEY = "velaryn_biometric_vault";

export const baseEvents: ForgeEvent[] = [
  { id: 1, type: "STRIKE", title: "Capital Deployment", amount: 1420, impact: "+ $12,402 (30Y)", date: "MAR 21, 2026" },
  { id: 2, type: "SHIELD", title: "Exit Strategy: Gold", amount: 5000, impact: "Risk Neutralized", date: "MAR 15, 2026" },
  { id: 3, type: "UPGRADE", title: "Obsidian Initiation", amount: 19.99, impact: "Full Oracle Access", date: "MAR 01, 2026" },
];

export function formatLedgerDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).toUpperCase();
}

export function futureImpact(amount: number, years = 30, annualRate = 0.07) {
  return Math.round(amount * Math.pow(1 + annualRate, years));
}

export function formatLedgerAmount(amount: number, locale: string, currency: string) {
  const hasCents = !Number.isInteger(amount);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: hasCents ? 2 : 0,
    minimumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
}

export function ascensionTitle(score: number) {
  if (score < 25) return "Debt Slayer";
  if (score < 50) return "Velocity Knight";
  if (score < 75) return "Sovereign";
  if (score < 90) return "Legacy Builder";
  return "Meme Sovereign";
}

export function parseLedgerDate(value: string) {
  if (value === "SYSTEM GENERATED") {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildAlphaYieldSeries(monthToDateValue: number) {
  const checkpoints = ["01", "05", "10", "15", "20", "25", "30"];
  const ratios = [0.12, 0.19, 0.31, 0.48, 0.64, 0.82, 1];

  return checkpoints.map((day, index) => ({
    day,
    yield: Math.round(monthToDateValue * ratios[index]),
  }));
}

export function buildAuditHash(totalForged: number, forgeScore: number) {
  const seed = Math.abs(Math.round(totalForged * 17 + forgeScore * 97));
  return `0x${seed.toString(16).padStart(4, "0")}...${(seed * 13).toString(16).slice(-4).padStart(4, "0")}`;
}

function isRecentEvent(event: ForgeEvent, days: number) {
  const parsed = parseLedgerDate(event.date);
  if (!parsed) return false;

  const windowMs = days * 24 * 60 * 60 * 1000;
  return Date.now() - parsed.getTime() <= windowMs;
}

export function getNextBestAction(
  profile: Pick<SimplifiedProfile, "monthlySurplus" | "completedModules" | "useSimplifiedMode">,
  events: ForgeEvent[]
): NextBestAction {
  const recentStrikes = events.filter((event) => {
    if (!isRecentEvent(event, 7)) return false;
    return event.type === "STRIKE" || event.type === "GROK_STRIKE" || event.type === "MICRO_STRIKE";
  });

  if ((profile.monthlySurplus ?? 0) <= 0) {
    return {
      title: "Repair Monthly Cash Flow",
      detail: "Your next gain comes from restoring positive surplus before new capital deployment.",
      cta: "Trim one fixed expense today",
      priority: "high",
    };
  }

  if (recentStrikes.length === 0) {
    return {
      title: "Forge Your First Weekly Strike",
      detail: "No capital deployment detected in the past 7 days. One strike restores compounding momentum.",
      cta: "Run a manual strike",
      priority: "high",
    };
  }

  if ((profile.completedModules?.length ?? 0) < 2) {
    return {
      title: "Unlock The Next Core Module",
      detail: "Progressive unlocks reduce overwhelm and keep decisions focused on the highest-return path.",
      cta: "Complete a quick-win challenge",
      priority: "medium",
    };
  }

  return {
    title: "Optimize Auto-Strike Precision",
    detail: "Your rhythm is active. Fine-tune monthly routing and keep consistency high.",
    cta: "Review this week's summary",
    priority: "low",
  };
}

export function generateWeeklySummary(events: ForgeEvent[]): WeeklySummary {
  const weeklyEvents = events.filter((event) => isRecentEvent(event, 7));
  const deployed = weeklyEvents.reduce((sum, event) => sum + Math.max(event.amount, 0), 0);
  const strikeCount = weeklyEvents.filter((event) => event.type === "STRIKE" || event.type === "GROK_STRIKE" || event.type === "MICRO_STRIKE").length;
  const shieldCount = weeklyEvents.filter((event) => event.type === "SHIELD" || event.type === "TAX_SHIELD").length;

  if (weeklyEvents.length === 0) {
    return {
      message: "No actions logged this week yet. One strike today restarts compounding.",
      deployed: 0,
      strikeCount: 0,
      shieldCount: 0,
    };
  }

  if (strikeCount === 0) {
    return {
      message: `You logged ${weeklyEvents.length} updates this week, but no deployment strikes. Prioritize one strike to restore momentum.`,
      deployed,
      strikeCount,
      shieldCount,
    };
  }

  return {
    message: `This week you executed ${strikeCount} strike${strikeCount > 1 ? "s" : ""}, protected ${shieldCount} risk lane${shieldCount === 1 ? "" : "s"}, and deployed $${Math.round(deployed).toLocaleString()}.`,
    deployed,
    strikeCount,
    shieldCount,
  };
}

export function shouldRenderModule(moduleName: LedgerModuleName, profile: SimplifiedProfile) {
  if (!profile.useSimplifiedMode) {
    return true;
  }

  const score = profile.forgeScore ?? 0;
  const completed = new Set(profile.completedModules ?? []);

  if (moduleName === "AlphaPulse") {
    return score >= 25 || completed.has("market-literacy");
  }

  if (moduleName === "ArbitragePulse") {
    return score >= 40 || completed.has("cashflow-oracle");
  }

  if (moduleName === "TelemetryLedger") {
    return score >= 55 || completed.has("compliance-ops");
  }

  if (moduleName === "GrokHorizon" || moduleName === "ForgeDuel" || moduleName === "SquadBoost") {
    return score >= 30 || completed.has("social-forge");
  }

  return true;
}

export function generateCoachInsight(
  profile: Pick<SimplifiedProfile, "monthlySurplus" | "useSimplifiedMode">,
  events: ForgeEvent[]
): CoachInsight {
  const total = events.reduce((sum, event) => sum + Math.max(event.amount, 0), 0);

  if (total <= 0 || profile.monthlySurplus <= 0) {
    return {
      message: "Your system is idle. Make your first move to begin compounding.",
      priority: "high",
    };
  }

  if (total < 1000) {
    return {
      message: "You are in the build phase. Focus on consistency over size.",
      priority: "medium",
    };
  }

  return {
    message: "You are gaining momentum. Consider increasing automation.",
    priority: "low",
  };
}

export function getPlanFeatures(plan: Plan) {
  switch (plan) {
    case "free":
      return ["Basic tracking", "Manual actions"];
    case "pro":
      return ["AI Coach", "Advanced insights", "Streak tracking"];
    case "elite":
      return ["Everything in Pro", "Automation", "Priority insights"];
  }
}

export function getCommand(
  profile: Pick<SimplifiedProfile, "monthlySurplus">,
  events: ForgeEvent[]
): LoopCommand {
  const total = events.reduce((sum, event) => sum + Math.max(event.amount, 0), 0);
  const baseAmount = Math.max(50, Math.round(Math.max(profile.monthlySurplus, 0) * 0.12));

  if (total <= 0) {
    return {
      title: "Prime Your First Strike",
      reason: "No deployment history yet. One small action starts compounding.",
      amount: Math.min(250, baseAmount),
      impact: Math.round(Math.min(250, baseAmount) * 1.35),
      priority: "high",
    };
  }

  if (total < 1000) {
    return {
      title: "Build Consistency",
      reason: "Early stage detected. Keep cadence stable before sizing up.",
      amount: Math.min(400, Math.max(100, baseAmount)),
      impact: Math.round(Math.min(400, Math.max(100, baseAmount)) * 1.42),
      priority: "medium",
    };
  }

  return {
    title: "Increase Automation",
    reason: "Momentum is active. Raise recurring deployment to accelerate trajectory.",
    amount: Math.min(800, Math.max(180, Math.round(baseAmount * 1.4))),
    impact: Math.round(Math.min(800, Math.max(180, Math.round(baseAmount * 1.4))) * 1.5),
    priority: "low",
  };
}

export function buildAdaptiveContext(events: ForgeEvent[]): AdaptiveContext {
  const totalBuilt = events.reduce((sum, event) => sum + Math.max(event.amount, 0), 0);
  const recentEvents = events.filter((event) => isRecentEvent(event, 7));
  const recentStrikeCount = recentEvents.filter((event) => event.type === "STRIKE" || event.type === "GROK_STRIKE" || event.type === "MICRO_STRIKE").length;
  const latest = events[0];
  const latestDate = latest ? parseLedgerDate(latest.date) : null;
  const recentIdleDays = latestDate ? Math.max(0, Math.floor((Date.now() - latestDate.getTime()) / (24 * 60 * 60 * 1000))) : 99;

  return {
    eventCount: events.length,
    recent7dCount: recentEvents.length,
    recentStrikeCount,
    recentIdleDays,
    totalBuilt,
  };
}

export function buildRealContext(events: ForgeEvent[], accounts: PlaidAccount[]): AdaptiveContext {
  const base = buildAdaptiveContext(events);
  const primary = selectFundingAccount(accounts);

  return {
    ...base,
    liquidBalance: primary?.balance ?? 0,
    primaryAccountName: primary?.name,
  };
}

export function getAdaptiveCommand(
  profile: Pick<SimplifiedProfile, "monthlySurplus">,
  events: ForgeEvent[],
  context: AdaptiveContext
): LoopCommand {
  const baseAmount = Math.max(50, Math.round(Math.max(profile.monthlySurplus, 0) * 0.12));

  if (context.totalBuilt <= 0 || context.eventCount === 0) {
    return {
      title: "Prime Your First Strike",
      reason: "No deployment history yet. One small action starts compounding.",
      amount: Math.min(250, baseAmount),
      impact: Math.round(Math.min(250, baseAmount) * 1.35),
      priority: "high",
    };
  }

  if (context.recentIdleDays >= 4 || context.recentStrikeCount === 0) {
    return {
      title: "Restart Daily Momentum",
      reason: "Your cadence slowed down. A quick strike today restores velocity.",
      amount: Math.min(300, Math.max(75, baseAmount)),
      impact: Math.round(Math.min(300, Math.max(75, baseAmount)) * 1.38),
      priority: "high",
    };
  }

  if (context.totalBuilt < 1000 || context.recent7dCount < 3) {
    return {
      title: "Build Consistency",
      reason: "Early stage detected. Keep cadence stable before sizing up.",
      amount: Math.min(400, Math.max(100, baseAmount)),
      impact: Math.round(Math.min(400, Math.max(100, baseAmount)) * 1.42),
      priority: "medium",
    };
  }

  return {
    title: "Increase Automation",
    reason: "Momentum is active. Raise recurring deployment to accelerate trajectory.",
    amount: Math.min(900, Math.max(180, Math.round(baseAmount * 1.45))),
    impact: Math.round(Math.min(900, Math.max(180, Math.round(baseAmount * 1.45))) * 1.5),
    priority: "low",
  };
}

export function getRealAdaptiveCommand(
  profile: Pick<SimplifiedProfile, "monthlySurplus">,
  events: ForgeEvent[],
  context: AdaptiveContext,
  accounts: PlaidAccount[]
): Command {
  const baseCommand = getAdaptiveCommand(profile, events, context);
  const checking = accounts.find((account) => account.subtype === "checking") ?? accounts.find((account) => account.type === "checking");

  if (!checking) {
    return baseCommand;
  }

  const safeAmount = Math.min(baseCommand.amount, Math.round(checking.balance * 0.15));

  return {
    ...baseCommand,
    amount: Math.max(10, safeAmount),
    reason: `Based on your real balance in ${checking.name}`,
  };
}

export function selectFundingAccount(accounts: LinkedAccount[]): LinkedAccount | null {
  return (
    accounts.find((account) => account.subtype === "checking") ||
    accounts.find((account) => account.type === "checking") ||
    accounts.find((account) => account.subtype === "savings") ||
    accounts.find((account) => account.type === "savings") ||
    null
  );
}

export async function executeRealTransfer(command: Command, account: LinkedAccount) {
  return fetch("/api/execute-transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountId: account.id,
      amount: command.amount,
    }),
  });
}
