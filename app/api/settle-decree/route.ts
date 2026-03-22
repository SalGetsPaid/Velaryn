import { NextResponse } from "next/server";
import { z } from "zod";
import { getDecree, settleDecree } from "@/lib/security/decreeStore";
import { logSovereignAction } from "@/lib/security/auditTrail";

const SettleDecreeSchema = z.object({
  decreeId: z.string().min(8),
  settlementRef: z.string().min(4).optional(),
});

function isAuthorized(req: Request) {
  const requiredKey = process.env.SETTLEMENT_WEBHOOK_SECRET;
  if (!requiredKey) {
    return true;
  }

  const provided = req.headers.get("x-settlement-key");
  return Boolean(provided && provided === requiredKey);
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized settlement request" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SettleDecreeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settle decree payload", detail: parsed.error.flatten() }, { status: 400 });
    }

    const { decreeId, settlementRef } = parsed.data;
    const existing = await getDecree(decreeId);

    if (!existing) {
      return NextResponse.json({ error: "Decree not found" }, { status: 404 });
    }

    if (existing.state !== "SYNCING") {
      return NextResponse.json({ error: `Decree is already ${existing.state.toLowerCase()}` }, { status: 409 });
    }

    const settled = await settleDecree(decreeId);
    if (!settled) {
      return NextResponse.json({ error: "Unable to settle decree" }, { status: 409 });
    }

    await logSovereignAction(existing.principalId, `settle-decree:${decreeId}:${settlementRef ?? "bank-confirmed"}`);

    return NextResponse.json({ success: true, decree: settled, settlementRef: settlementRef ?? null });
  } catch (error) {
    console.error("Settle decree failed", error);
    return NextResponse.json({ error: "Settle decree failed" }, { status: 500 });
  }
}
