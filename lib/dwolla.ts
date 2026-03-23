import dwolla from "dwolla-v2";

export function getDwollaClient() {
  const key = process.env.DWOLLA_KEY;
  const secret = process.env.DWOLLA_SECRET;

  if (!key || !secret) {
    throw new Error("Dwolla is not configured. Missing DWOLLA_KEY or DWOLLA_SECRET.");
  }

  return new dwolla.Client({
    key,
    secret,
    environment: "sandbox",
  });
}
