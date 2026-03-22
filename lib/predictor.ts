type PredictorInput = {
  spending: number;
  income: number;
  cash: number;
};

export function predictMistakes(data: PredictorInput) {
  const risks: string[] = [];

  if (data.spending > data.income) {
    risks.push("Overspending detected - likely debt growth");
  }

  if (data.cash < 1000) {
    risks.push("Low cash buffer - risk of liquidity issues");
  }

  return risks;
}
