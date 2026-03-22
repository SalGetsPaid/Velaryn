import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { plaidPublicToken, email } = await req.json();

    const baseUrl = new URL(req.url).origin;

    // 1. Exchange Plaid token
    const plaidRes = await fetch(`${baseUrl}/api/plaid/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_token: plaidPublicToken }),
    });
    const { access_token } = await plaidRes.json();

    // 2. Create Dwolla customer
    const dwollaRes = await fetch(`${baseUrl}/api/dwolla/customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "User", lastName: "Velaryn", email }),
    });
    const dwollaCustomer = await dwollaRes.json();

    // 3. Create Stripe customer
    const stripeRes = await fetch(`${baseUrl}/api/stripe/create-customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const stripeCustomer = await stripeRes.json();

    return NextResponse.json({
      success: true,
      access_token,
      dwollaCustomer,
      stripeCustomer,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "onboarding failed" }, { status: 500 });
  }
}
