import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe only if secret key is provided
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export async function POST(req: Request) {
  try {
    if (!stripe || !stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { tier = "obsidian" } = body;

    // Define tier pricing
    const tiers: Record<string, { amount: number; name: string; description: string }> = {
      obsidian: {
        amount: 1900, // $19.00
        name: "Velaryn: Obsidian Tier",
        description: "Unlock Advanced Wealth Velocity & Real-time AI Coaching",
      },
      diamond: {
        amount: 4900, // $49.00
        name: "Velaryn: Diamond Tier",
        description: "Lifetime Premium Access + Wealth Automation Suite",
      },
    };

    const tierInfo = tiers[tier] || tiers.obsidian;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: tierInfo.name,
              description: tierInfo.description,
            },
            unit_amount: tierInfo.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      metadata: {
        tier,
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Checkout failed";
    console.error("STRIPE CHECKOUT ERROR:", msg);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
