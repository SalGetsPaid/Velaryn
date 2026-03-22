import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe only if secret key is provided
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export async function GET(req: Request) {
  try {
    if (!stripe || !stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      );
    }

    // TODO: In production, save tier to your database
    // const userId = session.client_reference_id; // Set this in checkout creation
    // await db.user.update({ where: { id: userId }, data: { tier: session.metadata?.tier } });

    return NextResponse.json({
      success: true,
      tier: session.metadata?.tier || "obsidian",
      amount: session.amount_total ? session.amount_total / 100 : 0,
      email: session.customer_details?.email,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Verification failed";
    console.error("VERIFY PAYMENT ERROR:", msg);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
