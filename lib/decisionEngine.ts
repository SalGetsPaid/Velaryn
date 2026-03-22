export interface Decision {
  title: string;
  explanation: string;
  impactYearly: number;
  urgencyDaily: number;
}

export interface AnalyzerInput {
  cash: number;
  income: number;
  categoryMap: Record<string, number>;
}

export function generateDecisions(data: AnalyzerInput): Decision[] {
  const { cash, income, categoryMap } = data;
  const decisions: Decision[] = [];

  // Priority 1: Cash optimization
  if (cash > 5000) {
    const yearly = Math.round(cash * 0.05);
    decisions.push({
      title: `Move $${Math.round(cash)} into high-yield savings`,
      explanation: "Idle cash is losing value every day.",
      impactYearly: yearly,
      urgencyDaily: Number((yearly / 365).toFixed(2)),
    });
  }

  // Priority 2: Big spending categories
  Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .forEach(([cat, spend]) => {
      if (spend > 300) {
        const savings = Math.round(spend * 0.2 * 12);
        decisions.push({
          title: `Reduce ${cat} spending`,
          explanation: `$${spend} monthly in ${cat} — cut 20% for real impact.`,
          impactYearly: savings,
          urgencyDaily: Number((savings / 365).toFixed(2)),
        });
      }
    });

  // Priority 3: Investing
  if (income > 0) {
    const yearly = Math.round(income * 0.02 * 12);
    decisions.push({
      title: `Increase investments by 2%`,
      explanation: "Small consistent increase creates massive compounding.",
      impactYearly: yearly,
      urgencyDaily: Number((yearly / 365).toFixed(2)),
    });
  }

  return decisions.length > 0 ? decisions : [{
    title: "Your system is optimized",
    explanation: "No major inefficiencies detected right now.",
    impactYearly: 0,
    urgencyDaily: 0,
  }];
}
