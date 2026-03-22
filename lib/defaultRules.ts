import type { Rule } from "./rules";

export const defaultRules: Rule[] = [
  {
    id: "save_excess_cash",
    name: "Auto-save excess cash",
    condition: (state) => state.cash > 5000,
    action: (state) => ({
      type: "TRANSFER",
      amount: Math.floor(state.cash * 0.2),
    }),
  },
  {
    id: "overspend_recovery",
    name: "Spending recovery",
    condition: (state) => state.spending > state.income * 0.8,
    action: () => ({
      type: "RESTRICT",
      message: "Reduce discretionary spend this week",
    }),
  },
];
