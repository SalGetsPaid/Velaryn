import { NextResponse } from "next/server";
import { dwollaClient } from "@/lib/dwolla";

export async function POST(req: Request) {
  try {
    const { source, destination, amount } = await req.json();

    await dwollaClient.post("transfers", {
      _links: {
        source: { href: source },
        destination: { href: destination },
      },
      amount: {
        currency: "USD",
        value: amount.toString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "dwolla transfer failed" }, { status: 500 });
  }
}
