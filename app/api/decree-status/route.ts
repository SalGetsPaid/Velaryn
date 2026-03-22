import { NextResponse } from "next/server";
import { getDecree } from "@/lib/security/decreeStore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const decreeId = url.searchParams.get("decreeId");

  if (!decreeId) {
    return NextResponse.json({ error: "decreeId query param is required" }, { status: 400 });
  }

  const decree = await getDecree(decreeId);
  if (!decree) {
    return NextResponse.json({ error: "Decree not found" }, { status: 404 });
  }

  return NextResponse.json({ decree });
}
