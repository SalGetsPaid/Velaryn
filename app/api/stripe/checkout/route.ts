import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const customerId = typeof body.customerId === "string" ? body.customerId : undefined;
    const priceId = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_URL;

    if (!priceId || !appUrl) {
      return NextResponse.json({ error: "Stripe checkout is not configured" }, { status: 503 });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ...(customerId ? { customer: customerId } : {}),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/ledger?upgraded=true`,
      cancel_url: `${appUrl}/ledger`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "stripe error" }, { status: 500 });
  }
}
