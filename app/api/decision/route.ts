import { NextResponse } from "next/server";
import { generateDecisions } from "@/lib/decisionEngine";

export async function GET() {
  try {
    const demoData = {
      cash: 18200,
      income: 6200,
      categoryMap: { Dining: 1240, Shopping: 890, Housing: 2100 },
    };

    const decisions = generateDecisions(demoData);

    return NextResponse.json({
      decision: decisions[0] || null,
      decisions,
      netCashFlow: 1420,
      score: 78,
      projectedGain: decisions[0]?.impactYearly ?? 0,
      hiddenValue: decisions[0]?.impactYearly ?? 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Decision engine failed" }, { status: 500 });
  }
}