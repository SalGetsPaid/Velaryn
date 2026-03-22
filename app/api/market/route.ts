import { NextResponse } from "next/server";
import { getMarketSignals } from "@/lib/marketData";

export async function GET() {
  try {
    const signals = await getMarketSignals();
    return NextResponse.json({ signals });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Market feed unavailable" }, { status: 500 });
  }
}
