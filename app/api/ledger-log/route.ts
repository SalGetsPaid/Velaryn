import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      type?: "STRIKE" | "SHIELD" | "UPGRADE" | "INCOME_BOOST" | "TAX_SHIELD";
      title?: string;
      amount?: number;
      impact?: string;
      date?: string;
    };

    if (!body.title || typeof body.amount !== "number" || !body.impact) {
      return NextResponse.json({ error: "Invalid ledger event" }, { status: 400 });
    }

    return NextResponse.json({
      id: Date.now(),
      type: body.type ?? "STRIKE",
      title: body.title,
      amount: body.amount,
      impact: body.impact,
      date:
        body.date ??
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }).toUpperCase(),
    });
  } catch (error) {
    console.error("Ledger log failed", error);
    return NextResponse.json({ error: "Ledger log failed" }, { status: 500 });
  }
}