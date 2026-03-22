export const HIGH_CONFIDENCE_GAIN_MULTIPLIER = 5;
export const MIN_PORTFOLIO_YIELD_DELTA_PCT = 0.5;

export type AlphaStrikeUser = {
  dailySubscriptionCost: number;
  principalLabel?: string;
};

export type AlphaStrikeNotificationPayload = {
  title: string;
  body: string;
  category: "KINETIC_COMMAND";
  haptic: "HEAVY_ANVIL";
  sound: "VELARYN_SHIMMER";
};

export type AlphaStrikeNotifier = {
  send: (payload: AlphaStrikeNotificationPayload) => Promise<unknown> | unknown;
};

export type AlphaStrikeEvaluation = {
  qualifies: boolean;
  gainAmount: number;
  portfolioYieldDeltaPct: number;
  requiredGainAmount: number;
  requiredPortfolioYieldDeltaPct: number;
  reasons: string[];
};

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

export function evaluateAlphaStrike(
  user: AlphaStrikeUser,
  gainAmount: number,
  portfolioYieldDeltaPct: number
): AlphaStrikeEvaluation {
  const normalizedGain = roundCurrency(Math.max(0, gainAmount));
  const normalizedYieldDelta = roundCurrency(Math.max(0, portfolioYieldDeltaPct));
  const requiredGainAmount = roundCurrency(Math.max(0, user.dailySubscriptionCost) * HIGH_CONFIDENCE_GAIN_MULTIPLIER);
  const reasons: string[] = [];

  if (normalizedGain <= requiredGainAmount) {
    reasons.push(`Gain must exceed ${HIGH_CONFIDENCE_GAIN_MULTIPLIER}x the Tier 4 daily subscription cost.`);
  }

  if (normalizedYieldDelta <= MIN_PORTFOLIO_YIELD_DELTA_PCT) {
    reasons.push(`Portfolio yield lift must exceed ${MIN_PORTFOLIO_YIELD_DELTA_PCT}%.`);
  }

  return {
    qualifies: reasons.length === 0,
    gainAmount: normalizedGain,
    portfolioYieldDeltaPct: normalizedYieldDelta,
    requiredGainAmount,
    requiredPortfolioYieldDeltaPct: MIN_PORTFOLIO_YIELD_DELTA_PCT,
    reasons,
  };
}

export function buildAlphaStrikePayload(
  user: AlphaStrikeUser,
  gainAmount: number
): AlphaStrikeNotificationPayload {
  return {
    title: "Alpha Strike Identified",
    body: `${user.principalLabel ?? "Principal"}, we found a $${Math.round(gainAmount).toLocaleString()} annual expansion opportunity.`,
    category: "KINETIC_COMMAND",
    haptic: "HEAVY_ANVIL",
    sound: "VELARYN_SHIMMER",
  };
}

export async function triggerAlphaStrike(
  user: AlphaStrikeUser,
  gainAmount: number,
  portfolioYieldDeltaPct: number,
  notifier: AlphaStrikeNotifier
) {
  const evaluation = evaluateAlphaStrike(user, gainAmount, portfolioYieldDeltaPct);

  if (!evaluation.qualifies) {
    return { triggered: false, evaluation };
  }

  const payload = buildAlphaStrikePayload(user, evaluation.gainAmount);
  const result = await notifier.send(payload);

  return {
    triggered: true,
    payload,
    evaluation,
    result,
  };
}