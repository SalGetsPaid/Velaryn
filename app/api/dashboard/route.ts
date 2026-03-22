import { NextResponse } from "next/server";
import { analyzeTransactions, analyzeData } from "@/lib/analyzer";
import { generateDecisions } from "@/lib/decisionEngine";
import { getWealthSignal } from "@/lib/wealthSignals";
import { getWealthActions } from "@/lib/wealthActions";
import { calculateScore } from "@/lib/scoreEngine";
import { generateAiCoachMessage } from "@/app/api/ai/route";

// Simple demo data (replace with real Plaid later)
const DEMO_TRANSACTIONS = [
  { amount: -5000, category: ["Income"] },
  { amount: 1200, category: ["Housing"] },
  { amount: 540, category: ["Dining"] },
  { amount: 320, category: ["Shopping"] },
  { amount: 650, category: ["Savings"] },
];

const DEMO_ACCOUNTS = [
  { type: "depository", balances: { current: 18000 } },
  { type: "investment", balances: { current: 24000 } },
];

function calculateRealTrajectory(netWorth: number, monthlySavings: number, hiddenValue: number) {
  const rate = 0.07; // 7% annualised market return
  const r = rate / 12;
  const optimisedMonthlySavings = monthlySavings + hiddenValue / 12;
  const points = [0, 12, 60, 120]; // months: Now, 1Y, 5Y, 10Y

  return points.map((i) => {
    const label = i === 0 ? "Now" : `${i / 12}Y`;
    // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
    const growth = Math.pow(1 + r, i);
    const current = Math.round(netWorth * growth + (i > 0 ? monthlySavings * ((growth - 1) / r) : 0));
    const optimized = Math.round(netWorth * growth + (i > 0 ? optimisedMonthlySavings * ((growth - 1) / r) : 0));
    return { month: label, current, optimized };
  });
}

export async function GET() {
  try {
    const transactionAnalysis = analyzeTransactions(DEMO_TRANSACTIONS);
    const analysis = analyzeData(DEMO_TRANSACTIONS, DEMO_ACCOUNTS);

    const decisions = generateDecisions({
      cash: transactionAnalysis.cash,
      income: transactionAnalysis.income,
      categoryMap: analysis.categoryMap,
    });

    const score = calculateScore({
      income: transactionAnalysis.income,
      spending: transactionAnalysis.spending,
      savings: transactionAnalysis.savings,
      cash: transactionAnalysis.cash,
    });

    const hiddenValue = decisions[0]?.impactYearly ?? 4812;
    const decision = decisions[0] ?? null;

    const aiInsight = await generateAiCoachMessage({
      score,
      netWorth: analysis.netWorth,
      decision,
      spending: transactionAnalysis.spending,
      savings: transactionAnalysis.savings,
    });

    const trajectory = calculateRealTrajectory(analysis.netWorth, transactionAnalysis.savings, hiddenValue);

    return NextResponse.json({
      netWorth: analysis.netWorth,
      score,
      delta: Math.floor(Math.random() * 8) - 3,
      streak: 7,
      hiddenValue,
      aiInsight,
      decision,
      decisions: decisions.slice(0, 5),
      trajectory,
      dailyMessage: score > 70 ? "You're improving. Stay consistent." : "Small dip. Push for growth tomorrow.",
      signal: getWealthSignal(),
      actions: getWealthActions(),
      largeTransactionAlert: undefined,
      scoreDropAlert: undefined,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to build dashboard" },
      { status: 500 }
    );
  }
}

// Keep POST for future Plaid sync (optional)
export async function POST(req: Request) {
  try {
    await req.json();
    return NextResponse.json({ success: true, message: "Data received (demo mode)" });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

