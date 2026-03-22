import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { maskTransaction } from "@/lib/security/masking";

type LeakType = "GHOST_SUBSCRIPTION" | "VELOCITY_DRAG" | "SHADOW_FEE" | "OPTIMIZATION";
type Urgency = "LOW" | "HIGH" | "CRITICAL";

type Frequency =
  | "weekly"
  | "biweekly"
  | "semimonthly"
  | "monthly"
  | "annually"
  | "unknown";

export type RecurringOutflowStream = {
  stream_id?: string;
  merchant_name?: string | null;
  description?: string;
  frequency?: Frequency;
  status?: string;
  is_user_modified?: boolean;
  average_amount?: {
    amount?: number;
  };
  last_amount?: {
    amount?: number;
  };
  personal_finance_category?: {
    primary?: string;
    detailed?: string;
  };
};

export type WealthLeak = {
  name: string;
  amount: number;
  frequency: Frequency;
  category: string;
  leakType: LeakType;
  urgency: Urgency;
  annualImpact: number;
};

export type LeakCommand = {
  action: "Strike";
  target: string;
  saving: number;
};

export type WealthLeakDossier = {
  title: string;
  leaks_found: number;
  immediate_recovery: number;
  "30_year_ledger_impact": number;
  commands: LeakCommand[];
};

const env = process.env.PLAID_ENV ?? "sandbox";
const plaidClient = new PlaidApi(
  new Configuration({
    basePath:
      PlaidEnvironments[env as keyof typeof PlaidEnvironments] ??
      PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  })
);

function annualMultiplier(frequency: Frequency): number {
  if (frequency === "weekly") return 52;
  if (frequency === "biweekly") return 26;
  if (frequency === "semimonthly") return 24;
  if (frequency === "monthly") return 12;
  if (frequency === "annually") return 1;
  return 12;
}

function monthlyEquivalent(amount: number, frequency: Frequency): number {
  return (amount * annualMultiplier(frequency)) / 12;
}

function classifyLeak(stream: RecurringOutflowStream): {
  leakType: LeakType;
  urgency: Urgency;
} {
  const primary = stream.personal_finance_category?.primary ?? "";
  const detailed = stream.personal_finance_category?.detailed ?? "";
  const amount = Math.max(0, stream.last_amount?.amount ?? 0);
  const avgAmount = Math.max(0, stream.average_amount?.amount ?? amount);
  const volatility = avgAmount > 0 ? Math.abs(amount - avgAmount) / avgAmount : 0;

  if (primary === "BANK_FEES" || /fee|maintenance|overdraft|service/i.test(detailed)) {
    return { leakType: "SHADOW_FEE", urgency: "CRITICAL" };
  }

  if (stream.status === "mature" && stream.is_user_modified === false && (volatility >= 0.35 || amount >= 10)) {
    return { leakType: "GHOST_SUBSCRIPTION", urgency: "HIGH" };
  }

  const likelyConvenienceCategory =
    primary === "FOOD_AND_DRINK" ||
    primary === "TRANSPORTATION" ||
    primary === "GENERAL_MERCHANDISE" ||
    primary === "ENTERTAINMENT";

  if (likelyConvenienceCategory && monthlyEquivalent(amount, stream.frequency ?? "monthly") >= 60) {
    return { leakType: "VELOCITY_DRAG", urgency: "HIGH" };
  }

  return { leakType: "OPTIMIZATION", urgency: "LOW" };
}

export function detectWealthLeaksFromRecurringStreams(
  streams: RecurringOutflowStream[]
): WealthLeak[] {
  return streams
    .map((stream) => {
      const { leakType, urgency } = classifyLeak(stream);
      const amount = Math.max(0, stream.last_amount?.amount ?? 0);
      const frequency = stream.frequency ?? "monthly";
      const rawName = stream.merchant_name || stream.description || "Unknown recurring charge";
      const safeName = maskTransaction(rawName);

      return {
        name: safeName,
        amount,
        frequency,
        category: stream.personal_finance_category?.detailed || "Uncategorized",
        leakType,
        urgency,
        annualImpact: Math.round(amount * annualMultiplier(frequency) * 100) / 100,
      } satisfies WealthLeak;
    })
    .filter((leak) => leak.urgency !== "LOW")
    .sort((a, b) => b.annualImpact - a.annualImpact);
}

export async function detectWealthLeaks(accessToken: string): Promise<WealthLeak[]> {
  try {
    const response = await plaidClient.transactionsRecurringGet({
      access_token: accessToken,
    });

    const streams = (response.data.outflow_streams ?? []) as unknown as RecurringOutflowStream[];
    return detectWealthLeaksFromRecurringStreams(streams);
  } catch (error) {
    console.error("Forge Error: Leak Detection Failed", error);
    return [];
  }
}

function futureValueMonthlyContribution(
  monthlyContribution: number,
  annualRate = 0.07,
  years = 30
): number {
  if (monthlyContribution <= 0) return 0;

  const months = years * 12;
  const monthlyRate = annualRate / 12;
  const growth = Math.pow(1 + monthlyRate, months);

  if (monthlyRate === 0) {
    return monthlyContribution * months;
  }

  return monthlyContribution * ((growth - 1) / monthlyRate);
}

export function buildWealthLeakDossier(leaks: WealthLeak[]): WealthLeakDossier {
  const monthlyRecovery = leaks.reduce(
    (sum, leak) => sum + monthlyEquivalent(leak.amount, leak.frequency),
    0
  );

  const severityTitle = leaks.some((leak) => leak.urgency === "CRITICAL")
    ? "Operation: Shadow Fee Purge"
    : leaks.some((leak) => leak.leakType === "GHOST_SUBSCRIPTION")
    ? "Operation: Ghost Sweep"
    : "Operation: Velocity Drag Strike";

  return {
    title: severityTitle,
    leaks_found: leaks.length,
    immediate_recovery: Math.round(monthlyRecovery * 100) / 100,
    "30_year_ledger_impact":
      Math.round(futureValueMonthlyContribution(monthlyRecovery, 0.07, 30) * 100) / 100,
    commands: leaks.slice(0, 6).map((leak) => ({
      action: "Strike",
      target: leak.name,
      saving: Math.round(monthlyEquivalent(leak.amount, leak.frequency) * 100) / 100,
    })),
  };
}
