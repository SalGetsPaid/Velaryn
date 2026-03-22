import { NextResponse } from "next/server";
import { logSovereignAction } from "@/lib/security/auditTrail";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { userId?: string; actionId?: string };
    const userId = (body.userId || "velaryn-user").trim();
    const actionId = (body.actionId || "anvil-strike").trim();

    if (!userId || !actionId) {
      return NextResponse.json({ error: "userId and actionId are required" }, { status: 400 });
    }

    const audit = await logSovereignAction(userId, actionId);
    return NextResponse.json({ success: true, audit });
  } catch (error) {
    console.error("Strike audit logging failed", error);
    return NextResponse.json({ error: "Strike audit failed" }, { status: 500 });
  }
}
