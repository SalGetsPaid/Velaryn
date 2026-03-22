import { NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { getStoredToken } from "@/lib/tokenStore";
import {
  analyzeSurplus,
  buildIncomeForgeOraclePrompt,
  TOP_INCOME_STRIKES_2026,
  type PlaidTransactionLike,
} from "@/lib/surplusBridge";
import {
  buildWealthLeakDossier,
  detectWealthLeaks,
  detectWealthLeaksFromRecurringStreams,
  type RecurringOutflowStream,
} from "@/lib/oracle/leakDetector";

const config = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
    },
  },
});

const client = new PlaidApi(config);

export async function POST(req: Request) {
  try {
    const { userId = "velaryn-user" } = await req.json();
    const token = getStoredToken(userId);

    if (!token) {
      // Return mock data for demo purposes when no token available
      const demoTransactions: PlaidTransactionLike[] = [
        {
          amount: 24,
          name: "Streaming Plus",
          personal_finance_category: { primary: "BILL_PAYMENT" },
          recurring_indicator: true,
        },
        {
          amount: 19,
          name: "Cloud Storage",
          personal_finance_category: { primary: "BILL_PAYMENT" },
          recurring_indicator: true,
        },
        {
          amount: 39,
          name: "Gym Membership",
          personal_finance_category: { primary: "BILL_PAYMENT" },
          recurring_indicator: true,
        },
      ];

      const demoRecurringStreams: RecurringOutflowStream[] = [
        {
          merchant_name: "Adobe Premiere",
          description: "Adobe Premiere Pro",
          frequency: "monthly",
          status: "mature",
          is_user_modified: false,
          average_amount: { amount: 29.99 },
          last_amount: { amount: 54.99 },
          personal_finance_category: {
            primary: "ENTERTAINMENT",
            detailed: "DIGITAL_SUBSCRIPTION",
          },
        },
        {
          merchant_name: "Monthly Account Maintenance Fee",
          description: "Account Service Fee",
          frequency: "monthly",
          status: "mature",
          is_user_modified: false,
          average_amount: { amount: 15 },
          last_amount: { amount: 15 },
          personal_finance_category: {
            primary: "BANK_FEES",
            detailed: "MONTHLY_MAINTENANCE_FEE",
          },
        },
        {
          merchant_name: "Premium Streaming Bundle",
          description: "Streaming Bundle",
          frequency: "monthly",
          status: "mature",
          is_user_modified: false,
          average_amount: { amount: 72.51 },
          last_amount: { amount: 72.51 },
          personal_finance_category: {
            primary: "ENTERTAINMENT",
            detailed: "STREAMING_SUBSCRIPTION",
          },
        },
      ];

      const wealthLeaks = detectWealthLeaksFromRecurringStreams(demoRecurringStreams);
      const leakDossier = buildWealthLeakDossier(wealthLeaks);

      return NextResponse.json({
        transactions: demoTransactions,
        defensiveStrike: analyzeSurplus(demoTransactions),
        incomeForgeTargets: TOP_INCOME_STRIKES_2026,
        oraclePrompt: buildIncomeForgeOraclePrompt(140),
        wealthLeaks,
        leakDossier,
      });
    }

    const response = await client.transactionsGet({
      access_token: token,
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    });

    const transactions = (response.data.transactions ?? []) as unknown as PlaidTransactionLike[];
    const incomeEstimate = Math.max(
      1,
      Math.round(
        transactions
          .filter((t) => (t.personal_finance_category?.primary ?? "") === "INCOME")
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      )
    );

    const defensiveStrike = analyzeSurplus(transactions, incomeEstimate);
    const currentSurplus = Math.max(0, Math.round((incomeEstimate / 12) - defensiveStrike.totalLeak));
    const wealthLeaks = await detectWealthLeaks(token);
    const leakDossier = buildWealthLeakDossier(wealthLeaks);

    return NextResponse.json({
      ...response.data,
      defensiveStrike,
      incomeForgeTargets: TOP_INCOME_STRIKES_2026,
      oraclePrompt: buildIncomeForgeOraclePrompt(currentSurplus),
      wealthLeaks,
      leakDossier,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Transaction fetch failed" }, { status: 500 });
  }
}
