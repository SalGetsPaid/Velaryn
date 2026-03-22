export function getRecovery(events: any[], target = 20) {
  const last3 = events.slice(0, 3);
  const actual = last3.reduce((s: number, e: any) => s + e.amount, 0);

  const expected = target * 3;
  const deficit = expected - actual;

  if (deficit <= 0) return null;

  return {
    deficit,
    recoveryPerDay: Math.ceil(deficit / 3),
  };
}
