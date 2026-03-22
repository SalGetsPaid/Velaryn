import { NextResponse } from "next/server";
import { client } from "../client";
import { getStoredToken } from "@/lib/tokenStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId: string = body.userId ?? "velaryn-user";

    // Read token from the server-side store — never accept it from the client
    const accessToken = getStoredToken(userId);
    if (!accessToken) {
      return NextResponse.json({ error: "No linked account" }, { status: 401 });
    }

    const response = await client.accountsGet({ access_token: accessToken });
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Accounts fetch failed";
    console.error("PLAID ACCOUNTS ERROR:", msg);
    return NextResponse.json({ error: "Accounts fetch failed" }, { status: 500 });
  }
}
