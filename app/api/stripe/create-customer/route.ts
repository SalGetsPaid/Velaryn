import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const customer = await stripe.customers.create({ email });

    return NextResponse.json({ customerId: customer.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
