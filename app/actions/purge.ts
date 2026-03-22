'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function severPlaidConnections(accessToken: string | null) {
  if (!accessToken) return;

  await fetch("https://api.plaid.com/item/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET,
      access_token: accessToken,
    }),
  });
}

async function logAnonymizedDeletion() {
  try {
    await prisma.$executeRawUnsafe(
      "CREATE TABLE IF NOT EXISTS purge_audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, event TEXT, timestamp TEXT)"
    );
    await prisma.$executeRawUnsafe(
      "INSERT INTO purge_audit_log (event, timestamp) VALUES (?, ?)",
      "USER_PURGE_REQUEST",
      new Date().toISOString()
    );
  } catch (error) {
    console.error("Purge audit logging failed", error);
  }
}

export async function executeBlackout() {
  const cookieStore = await cookies();
  const plaidToken = cookieStore.get("plaid_access_token")?.value ?? null;

  try {
    await severPlaidConnections(plaidToken);
  } catch (error) {
    console.error("Plaid item remove failed", error);
  }

  cookieStore.getAll().forEach((cookie) => cookieStore.delete(cookie.name));

  await logAnonymizedDeletion();

  redirect("/blackout-complete");
}
