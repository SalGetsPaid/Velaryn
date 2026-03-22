import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    executionsToday: 1243,
  });
}
