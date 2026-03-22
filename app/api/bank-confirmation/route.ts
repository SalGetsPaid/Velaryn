import { NextResponse } from "next/server";
import { z } from "zod";
import { cancelDecree, getDecree, settleDecree } from "@/lib/security/decreeStore";
import { logSovereignAction } from "@/lib/security/auditTrail";

const BankConfirmationSchema = z.object({
  decreeId: z.string().min(8),
  status: z.enum(["pending", "settled", "failed", "reversed", "canceled"]),
  settlementRef: z.string().min(4).optional(),
  provider: z.string().min(2).default("bank-rail"),
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
      return NextResponse.json({ error: "Unauthorized bank confirmation" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BankConfirmationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid bank confirmation payload", detail: parsed.error.flatten() }, { status: 400 });
    }

    const { decreeId, status, settlementRef, provider } = parsed.data;
    const existing = await getDecree(decreeId);

    if (!existing) {
      return NextResponse.json({ error: "Decree not found" }, { status: 404 });
    }

    if (status === "pending") {
      return NextResponse.json({
        success: true,
        acknowledged: true,
        decree: existing,
        status: existing.state,
      });
    }

    if (existing.state !== "SYNCING") {
      return NextResponse.json({
        success: true,
        idempotent: true,
        decree: existing,
        status: existing.state,
      });
    }

    if (status === "settled") {
      const settled = await settleDecree(decreeId);
      if (!settled) {
        return NextResponse.json({ error: "Unable to settle decree" }, { status: 409 });
      }

      await logSovereignAction(
        existing.principalId,
        `bank-confirm:${provider}:settled:${decreeId}:${settlementRef ?? "confirmed"}`
      );

      return NextResponse.json({
        success: true,
        decree: settled,
        settlementRef: settlementRef ?? null,
      });
    }

    const canceled = await cancelDecree(decreeId);
    if (!canceled) {
      return NextResponse.json({ error: "Unable to cancel decree" }, { status: 409 });
    }

    await logSovereignAction(existing.principalId, `bank-confirm:${provider}:${status}:${decreeId}`);

    return NextResponse.json({
      success: true,
      decree: canceled,
      cancelReason: status,
    });
  } catch (error) {
    console.error("Bank confirmation handling failed", error);
    return NextResponse.json({ error: "Bank confirmation failed" }, { status: 500 });
  }
}