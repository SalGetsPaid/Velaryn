import { NextResponse } from "next/server";
import { client } from "../client";
import { setStoredToken } from "@/lib/tokenStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { public_token, userId = "velaryn-user" } = body;

    // Validate — public tokens are always a non-empty string
    if (typeof public_token !== "string" || public_token.trim() === "") {
      return NextResponse.json({ error: "Invalid public_token" }, { status: 400 });
    }

    // 1. Swap public token for permanent access token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: public_token.trim(),
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // 2. Fetch real balances immediately
    const balanceResponse = await client.accountsBalanceGet({
      access_token: accessToken,
    });

    // 3. Store the access token server-side — NEVER send it to the client.
    //    TODO: replace this file-based store with a proper DB (Prisma/Supabase)
    //    keyed to the authenticated user's session.
    setStoredToken(userId, accessToken);

    // Return accounts data only — the access token stays on the server
    return NextResponse.json({
      success: true,
      itemId,
      accounts: balanceResponse.data.accounts,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Exchange failed";
    console.error("PLAID EXCHANGE ERROR:", msg);
    return NextResponse.json({ error: "Exchange failed" }, { status: 500 });
  }
}
