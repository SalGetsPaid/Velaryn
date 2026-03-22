import { NextRequest, NextResponse } from "next/server";
import { generateDecisions, type AnalyzerInput } from "@/lib/decisionEngine";

const DEMO_DATA: AnalyzerInput = {
  cash: 18200,
  income: 6200,
  categoryMap: { Dining: 1240, Shopping: 890, Housing: 2100 },
};

function buildResponse(data: AnalyzerInput) {
  const decisions = generateDecisions(data);
  return NextResponse.json({
    decision: decisions[0] || null,
    decisions,
    netCashFlow: data.income - Object.values(data.categoryMap).reduce((s, v) => s + v, 0),
    score: 78,
    projectedGain: decisions[0]?.impactYearly ?? 0,
    hiddenValue: decisions[0]?.impactYearly ?? 0,
  });
}

export async function GET() {
  try {
    return buildResponse(DEMO_DATA);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Decision engine failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AnalyzerInput>;
    const data: AnalyzerInput = {
      cash: body.cash ?? DEMO_DATA.cash,
      income: body.income ?? DEMO_DATA.income,
      categoryMap: body.categoryMap ?? DEMO_DATA.categoryMap,
    };
    return buildResponse(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Decision engine failed" }, { status: 500 });
  }
}