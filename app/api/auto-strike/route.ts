import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { total?: number; source?: string };
    const total = typeof body.total === "number" ? body.total : 0;

    // Placeholder endpoint for round-up aggregation before wiring a broker transfer rail.
    return NextResponse.json({
      ok: true,
      queued: Number(total.toFixed(2)),
      source: body.source ?? "manual",
      routedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
