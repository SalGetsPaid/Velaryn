import { NextResponse } from "next/server";
import { Products, CountryCode } from "plaid";
import { client } from "./client";
import { toProxyPrincipalId } from "@/lib/guardrails/fiduciary";

export async function GET() {
  try {
    const proxyPrincipalId = toProxyPrincipalId("velaryn-user");
    const response = await client.linkTokenCreate({
      user: { client_user_id: proxyPrincipalId },
      client_name: "Velaryn",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Plaid failed" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const proxyPrincipalId = toProxyPrincipalId("velaryn-user");
    const response = await client.linkTokenCreate({
      user: { client_user_id: proxyPrincipalId },
      client_name: "Velaryn",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Plaid failed" }, { status: 500 });
  }
}
