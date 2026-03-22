import { useMemo } from "react";

export function useCommandCenter(events: any[], decision: any) {
  return useMemo(() => {
    const total = events.reduce((s: number, e: any) => s + e.amount, 0);

    const daily = total / Math.max(events.length, 1);

    const projected = Math.round(daily * 365 * 30);
    const baseline = 50000;

    const deficit = Math.max(0, 50 - daily);

    const recovery =
      deficit > 0
        ? {
            deficit,
            recoveryPerDay: Math.ceil(deficit),
          }
        : null;

    const command = recovery
      ? {
          label: `Recover $${recovery.recoveryPerDay} today`,
          amount: recovery.recoveryPerDay,
        }
      : {
          label: decision?.title || "Save $20",
          amount: decision?.urgencyDaily || 20,
        };

    return {
      command,
      recovery,
      proof: {
        total,
        projected,
        delta: projected - baseline,
      },
    };
  }, [events, decision]);
}
