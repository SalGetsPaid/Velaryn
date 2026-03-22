export async function track(event: string, data?: Record<string, unknown>) {
  try {
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...data }),
    });
  } catch {
    // fire-and-forget
  }
}
