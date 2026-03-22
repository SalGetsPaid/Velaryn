import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

type MetricEvent = "app_open" | "command_shown" | "command_executed";

type MetricsPayload = {
  userId: string;
  event: MetricEvent;
  amount?: number;
  timestamp: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const METRICS_LOG_PATH = path.join(DATA_DIR, "metrics.jsonl");

function isMetricEvent(value: string): value is MetricEvent {
  return value === "app_open" || value === "command_shown" || value === "command_executed";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<MetricsPayload>;

    if (!body?.userId || typeof body.userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (!body?.event || typeof body.event !== "string" || !isMetricEvent(body.event)) {
      return NextResponse.json({ error: "event must be app_open, command_shown, or command_executed" }, { status: 400 });
    }

    const timestamp =
      typeof body.timestamp === "string" && !Number.isNaN(new Date(body.timestamp).getTime())
        ? body.timestamp
        : new Date().toISOString();

    const record: MetricsPayload = {
      userId: body.userId,
      event: body.event,
      amount: Number.isFinite(body.amount) ? Number(body.amount) : undefined,
      timestamp,
    };

    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(METRICS_LOG_PATH, `${JSON.stringify(record)}\n`, "utf8");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
}
