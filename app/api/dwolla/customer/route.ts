import { NextResponse } from "next/server";
import { getDwollaClient } from "@/lib/dwolla";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email } = await req.json();
    const dwollaClient = getDwollaClient();

    const res = await dwollaClient.post("customers", {
      firstName,
      lastName,
      email,
      type: "receive-only",
    });

    return NextResponse.json({ url: res.headers.get("location") });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "dwolla customer failed" }, { status: 500 });
  }
}
