import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_URL;

    if (!appUrl) {
      return NextResponse.json({ error: "Stripe portal is not configured" }, { status: 503 });
    }

    const stripe = getStripe();

    if (typeof customerId !== "string" || !customerId.startsWith("cus_")) {
      return NextResponse.json({ error: "Invalid customerId" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/ledger`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
