"use client";

export type ClientMetricEvent = "app_open" | "command_shown" | "command_executed";

type TrackMetricInput = {
  userId: string;
  event: ClientMetricEvent;
  amount?: number;
  timestamp?: string;
};

export async function trackMetric(input: TrackMetricInput) {
  try {
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: input.userId,
        event: input.event,
        amount: input.amount,
        timestamp: input.timestamp ?? new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    // Metrics should never block UX.
  }
}
