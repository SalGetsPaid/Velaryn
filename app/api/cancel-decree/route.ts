import { NextResponse } from "next/server";
import { z } from "zod";
import { cancelDecree, getDecree } from "@/lib/security/decreeStore";
import { getStoredToken } from "@/lib/tokenStore";
import { logSovereignAction } from "@/lib/security/auditTrail";
import { client as plaidClient } from "@/app/api/plaid/client";

const CancelDecreeSchema = z.object({
  decreeId: z.string().min(8),
  principalId: z.string().min(3).default("velaryn-user"),
  reason: z.string().max(240).optional(),
});

async function severBankBridge(principalId: string) {
  try {
    const token = getStoredToken(principalId);
    if (!token) return false;
    await plaidClient.itemRemove({ access_token: token });
    return true;
  } catch (error) {
    console.error("Cancel decree bank-bridge sever failed", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CancelDecreeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid cancel decree payload", detail: parsed.error.flatten() }, { status: 400 });
    }

    const { decreeId, principalId, reason } = parsed.data;
    const existing = await getDecree(decreeId);
    if (!existing) {
      return NextResponse.json({ error: "Decree not found" }, { status: 404 });
    }
    if (existing.state !== "SYNCING") {
      return NextResponse.json({ error: `Decree is already ${existing.state.toLowerCase()}` }, { status: 409 });
    }

    const canceled = await cancelDecree(decreeId);
    if (!canceled) {
      return NextResponse.json({ error: "Unable to cancel decree" }, { status: 409 });
    }

    const bridgeSevered = await severBankBridge(principalId);
    const audit = await logSovereignAction(principalId, `cancel-decree:${decreeId}`);

    return NextResponse.json({
      success: true,
      decree: canceled,
      bridgeSevered,
      reason: reason || "Principal canceled decree",
      audit,
    });
  } catch (error) {
    console.error("Cancel decree failed", error);
    return NextResponse.json({ error: "Cancel decree failed" }, { status: 500 });
  }
}