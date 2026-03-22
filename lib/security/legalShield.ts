import { createHash, createHmac, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type LegalShieldReceiptInput = {
  principalId: string;
  acceptedAt: string;
  biometricVerified: boolean;
  biometricMethod: string;
  policyVersion: string;
  termsVersion: string;
  privacyVersion: string;
  userAgent?: string;
  forwardedFor?: string;
};

export type LegalShieldReceipt = LegalShieldReceiptInput & {
  receiptId: string;
  signature: string;
  createdAt: string;
  ipHash: string;
};

const dataDir = path.join(process.cwd(), "data");
const receiptLogPath = path.join(dataDir, "legal_shield_receipts.jsonl");

function getLegalShieldSecret() {
  return process.env.LEGAL_SHIELD_SECRET || process.env.AUDIT_SECRET || process.env.PLAID_SECRET || "velaryn-legal-shield-fallback";
}

function hashIp(rawIp: string) {
  return createHash("sha256").update(rawIp).digest("hex").slice(0, 24);
}

function signReceipt(input: Omit<LegalShieldReceipt, "signature">) {
  const payload = [
    input.principalId,
    input.acceptedAt,
    input.biometricVerified,
    input.biometricMethod,
    input.policyVersion,
    input.termsVersion,
    input.privacyVersion,
    input.receiptId,
    input.createdAt,
    input.ipHash,
  ].join(":");

  return createHmac("sha256", getLegalShieldSecret()).update(payload).digest("hex");
}

export async function recordLegalShieldReceipt(input: LegalShieldReceiptInput) {
  await fs.mkdir(dataDir, { recursive: true });

  const createdAt = new Date().toISOString();
  const rawForwardedFor = (input.forwardedFor || "unknown").split(",")[0]?.trim() || "unknown";
  const base: Omit<LegalShieldReceipt, "signature"> = {
    ...input,
    receiptId: `ls_${Date.now()}_${randomUUID().slice(0, 8)}`,
    createdAt,
    ipHash: hashIp(rawForwardedFor),
  };

  const signature = signReceipt(base);
  const receipt: LegalShieldReceipt = {
    ...base,
    signature,
  };

  await fs.appendFile(receiptLogPath, `${JSON.stringify(receipt)}\n`, "utf8");
  return receipt;
}