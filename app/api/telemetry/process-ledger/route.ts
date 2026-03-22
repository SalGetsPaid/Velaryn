import { NextResponse } from "next/server";
import { readProcessReconstruction } from "@/lib/security/processReconstructionLedger";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get("limit") ?? 20);
  const limit = Number.isFinite(rawLimit) ? rawLimit : 20;

  const entries = await readProcessReconstruction(limit);
  return NextResponse.json({ entries, count: entries.length });
}
