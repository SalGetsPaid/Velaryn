type NotificationState = {
  spending: number;
  income: number;
  cash: number;
};

export function generateNotifications(state: NotificationState) {
  const alerts: string[] = [];

  if (state.spending > state.income) {
    alerts.push("You're about to overspend this month.");
  }

  if (state.cash > 5000) {
    alerts.push("Move excess cash now to maximize returns.");
  }

  return alerts;
}
