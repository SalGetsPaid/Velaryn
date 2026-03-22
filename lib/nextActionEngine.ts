type NextActionState = {
  cash: number;
  spending: number;
  income: number;
};

export function getNextAction(state: NextActionState) {
  if (state.cash > 5000) {
    return {
      label: "Move excess cash",
      action: "TRANSFER",
      amount: Math.floor(state.cash * 0.2),
    };
  }

  if (state.spending > state.income * 0.8) {
    return {
      label: "Reduce spending",
      action: "ALERT",
    };
  }

  return {
    label: "Stay consistent",
    action: "NONE",
  };
}
