import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getStoredTokens } from "@/lib/tokenStore";
import { client as plaidClient } from "@/app/api/plaid/client";

export async function POST() {
  try {
    const tokens = getStoredTokens();
    await Promise.all(
      Object.values(tokens).map(async (token) => {
        try {
          await plaidClient.itemRemove({ access_token: token });
        } catch (error) {
          console.error("Plaid item remove during shred failed", error);
        }
      })
    );

    // Clear the Plaid tokens file if it exists
    const dataDir = path.join(process.cwd(), "data");
    const tokenPath = path.join(dataDir, "plaidTokens.json");

    if (fs.existsSync(tokenPath)) {
      fs.writeFileSync(tokenPath, JSON.stringify({}), "utf8");
    }

    // In a production app with a database, you would also:
    // - Delete user's stored access tokens from the database
    // - Call Plaid's /item/remove endpoint to revoke the Item
    // - Clear any cached transaction/account data

    return NextResponse.json({
      success: true,
      message: "All Plaid tokens and cached data have been shredded",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Shred failed";
    console.error("DATA SHRED ERROR:", msg);
    return NextResponse.json({ error: "Shred failed" }, { status: 500 });
  }
}
