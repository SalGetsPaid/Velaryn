import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ⚠️ Replace with real Plaid accounts/transactions fetch later
    return NextResponse.json({
      accounts: [
        { name: "Checking", balance: 4200 },
        { name: "Savings", balance: 14000 },
      ],
      transactions: [
        { category: "Dining", amount: 320 },
        { category: "Shopping", amount: 210 },
      ],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "plaid data failed" }, { status: 500 });
  }
}
