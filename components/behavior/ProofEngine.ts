export function calculateProof(events: any[], profile: any) {
  const total = events.reduce((s: number, e: any) => s + Math.max(e.amount, 0), 0);

  const daily = total / Math.max(events.length, 1);

  const projected = Math.round(daily * 365 * 30);
  const baseline = Math.round(profile.monthlySurplus * 12 * 30 * 0.4);

  return {
    total,
    projected,
    delta: projected - baseline,
    weekly: Math.round(daily * 7),
  };
}
