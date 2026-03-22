import { NextResponse } from "next/server";

interface NativePurchasePayload {
  tier: "obsidian" | "diamond";
  customerId: string;
  receipts: any;
}

export async function POST(req: Request) {
  try {
    const body: NativePurchasePayload = await req.json();
    const { tier, customerId, receipts } = body;

    // Validate the request
    if (!tier || !customerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: In production:
    // 1. Verify the receipt with RevenueCat's API
    // 2. Save to your database:
    //    - User tier upgrade record
    //    - Timestamp of purchase
    //    - Revenue tracking
    // 3. Trigger any post-purchase workflows (email, etc.)

    console.log(`Native purchase logged: ${customerId} -> ${tier}`, receipts);

    // For now, just acknowledge receipt
    return NextResponse.json({
      success: true,
      message: `${tier} tier unlocked`,
      customerId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Logging failed";
    console.error("NATIVE PURCHASE LOGGING ERROR:", msg);
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }
}
