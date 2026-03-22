export type PlaidTransactionLike = {
  amount: number;
  name?: string;
  merchant_name?: string | null;
  recurring_indicator?: boolean;
  personal_finance_category?: {
    primary?: string;
    detailed?: string;
  } | null;
};

export type DefensiveStrikeResult = {
  type: "DEFENSIVE_STRIKE";
  severity: "CRITICAL" | "OPTIMIZATION";
  message: string;
  action: "ONE_CLICK_CANCEL_SUGGESTION";
  totalLeak: number;
  recurringLeakCount: number;
  ghostSubscriptions: Array<{ name: string; amount: number }>;
};

export type IncomeStrike = {
  id: "ai-localization" | "faceless-tiktok" | "low-code-automation";
  title: string;
  description: string;
  target: string;
};

export const TOP_INCOME_STRIKES_2026: IncomeStrike[] = [
  {
    id: "ai-localization",
    title: "AI Voiceover Localization",
    description: "Use ElevenLabs or Murf to localize 5-minute YouTube clips for Spanish/Hindi demand pockets.",
    target: "$150/video",
  },
  {
    id: "faceless-tiktok",
    title: "Faceless App-Growth TikToks",
    description: "Generate faceless viral clips with Sora 2 or Veo to promote productivity tools via creator monetization.",
    target: "$500-$1k/week",
  },
  {
    id: "low-code-automation",
    title: "Low-Code AI Automation",
    description: "Deploy support agents for local businesses using Zapier plus GPT-4o with done-for-you onboarding.",
    target: "$2,000 setup fee",
  },
];

export function analyzeSurplus(transactions: PlaidTransactionLike[], monthlyIncome = 4800): DefensiveStrikeResult {
  const leaks = transactions.filter((t) =>
    t.personal_finance_category?.primary === "BILL_PAYMENT" &&
    t.recurring_indicator === true
  );

  const totalLeak = leaks.reduce((sum, t) => sum + Math.max(0, t.amount), 0);
  const recoveredVelocityPct = monthlyIncome > 0 ? ((totalLeak / monthlyIncome) * 100).toFixed(1) : "4.2";

  return {
    type: "DEFENSIVE_STRIKE",
    severity: totalLeak > 200 ? "CRITICAL" : "OPTIMIZATION",
    message: `Architect, I've identified $${Math.round(totalLeak).toLocaleString()} in Ghost Subscriptions. Striking these recovers ${recoveredVelocityPct}% of your monthly velocity.`,
    action: "ONE_CLICK_CANCEL_SUGGESTION",
    totalLeak: Math.round(totalLeak),
    recurringLeakCount: leaks.length,
    ghostSubscriptions: leaks.slice(0, 8).map((t) => ({
      name: t.merchant_name || t.name || "Unknown Subscription",
      amount: Math.round(t.amount),
    })),
  };
}

export function buildIncomeForgeOraclePrompt(currentSurplus: number): string {
  const neededBoost = 850;

  return `Architect, your current surplus is $${Math.round(currentSurplus)}/mo. To reach Velocity Stage in 12 months, you need +$${neededBoost}/mo. I recommend the AI Localization Strike. Would you like the step-by-step dossier?`;
}
