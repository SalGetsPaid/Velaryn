import { NextResponse } from "next/server";

type ExecuteTransferPayload = {
  accountId?: string;
  amount?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ExecuteTransferPayload;
    const amount = Number(body.amount ?? 0);
    const accountId = String(body.accountId ?? "").trim();

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be positive" }, { status: 400 });
    }

    // Transfer rail integration placeholder.
    // Swap this section with a real processor (Plaid Transfer / RTP / bank API).
    return NextResponse.json({
      ok: true,
      executionId: `exec_${Date.now()}`,
      accountId,
      amount,
      status: "queued",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Transfer execution failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}