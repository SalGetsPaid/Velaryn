export interface ScoreInput {
  income: number;
  spending: number;
  savings: number;
  cash: number;
}

export function calculateScore(data: ScoreInput): number {
  const { income, spending, savings, cash } = data;

  if (income === 0) {
    return 0;
  }

  const savingsRate = savings / income;
  const spendingRatio = spending / income;
  const cashEfficiency = cash > 0 ? Math.min(cash / 10000, 1) : 0;

  let score = 0;

  score += Math.min(savingsRate * 200, 40);
  score += Math.max(0, 30 - spendingRatio * 30);
  score += cashEfficiency * 20;

  if (savingsRate > 0.2) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}