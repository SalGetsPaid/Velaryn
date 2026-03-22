export function getNextCommand(profile: any, recovery: any) {
  if (recovery) {
    return {
      type: "recovery",
      amount: recovery.recoveryPerDay,
      label: `Recover $${recovery.recoveryPerDay} today`,
    };
  }

  const base = Math.max(profile.monthlySurplus / 30, 10);

  return {
    type: "standard",
    amount: Math.round(base),
    label: `Save $${Math.round(base)} now`,
  };
}
