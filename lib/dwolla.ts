import dwolla from "dwolla-v2";

export const dwollaClient = new dwolla.Client({
  key: process.env.DWOLLA_KEY!,
  secret: process.env.DWOLLA_SECRET!,
  environment: "sandbox",
});
