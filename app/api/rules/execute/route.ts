import { NextResponse } from "next/server";
import { evaluateRules } from "@/lib/ruleEngine";

export async function POST(req: Request) {
  try {
    const state = await req.json();
    const results = evaluateRules(state);
    return NextResponse.json({ results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "rules execution failed" }, { status: 500 });
  }
}
