export interface WealthAction {
  title: string;
  description: string;
}

export function getWealthActions(): WealthAction[] {
  return [
    {
      title: "Open High-Yield Savings",
      description: "Earn 4–5% instead of near 0%",
    },
    {
      title: "Max Employer 401(k) Match",
      description: "Instant 100% return on contributions",
    },
    {
      title: "Invest in Index Funds",
      description: "Low-cost long-term compounding",
    },
    {
      title: "Reduce High-Interest Debt",
      description: "Guaranteed return by eliminating interest",
    },
    {
      title: "Automate Monthly Investing",
      description: "Consistency beats timing",
    },
  ];
}
