import { createHmac, createHash } from "node:crypto";
import { z } from "zod";

export const PrincipalIntentSchema = z.object({
  principalId: z.string().min(3),
  actionId: z.string().min(3),
  tier: z.number().int().min(1),
  consentedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  biometricVerified: z.boolean(),
  intentSignature: z.string().min(32),
  mathProof: z.string().min(16),
});

export type PrincipalIntent = z.infer<typeof PrincipalIntentSchema>;

const DEFAULT_SIGNATURE_SECRET = "velaryn-intent-fallback";

function getIntentSecret() {
  return process.env.INTENT_SIGNING_SECRET || process.env.AUDIT_SECRET || process.env.PLAID_SECRET || DEFAULT_SIGNATURE_SECRET;
}

function intentSignaturePayload(intent: Pick<PrincipalIntent, "principalId" | "actionId" | "tier" | "consentedAt" | "expiresAt">) {
  return `${intent.principalId}:${intent.actionId}:${intent.tier}:${intent.consentedAt}:${intent.expiresAt}`;
}

export function signPrincipalIntent(intent: Pick<PrincipalIntent, "principalId" | "actionId" | "tier" | "consentedAt" | "expiresAt">) {
  return createHmac("sha256", getIntentSecret())
    .update(intentSignaturePayload(intent))
    .digest("hex");
}

export function validatePrincipalIntent(
  rawIntent: unknown,
  expected: { principalId: string; actionId: string; minimumTier: number }
) {
  const parsed = PrincipalIntentSchema.safeParse(rawIntent);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "Malformed principal intent attestation",
    };
  }

  const intent = parsed.data;
  const now = Date.now();

  if (intent.principalId !== expected.principalId) {
    return { ok: false, reason: "Principal mismatch" };
  }

  if (intent.actionId !== expected.actionId) {
    return { ok: false, reason: "Action mismatch" };
  }

  if (intent.tier < expected.minimumTier) {
    return { ok: false, reason: "Tier does not satisfy fiduciary requirement" };
  }

  if (!intent.biometricVerified) {
    return { ok: false, reason: "Biometric attestation required" };
  }

  const expiresAt = new Date(intent.expiresAt).getTime();
  const consentedAt = new Date(intent.consentedAt).getTime();

  if (!Number.isFinite(expiresAt) || !Number.isFinite(consentedAt)) {
    return { ok: false, reason: "Invalid attestation timestamps" };
  }

  if (expiresAt <= now) {
    return { ok: false, reason: "Attestation expired" };
  }

  if (consentedAt > now + 60_000) {
    return { ok: false, reason: "Attestation time is invalid" };
  }

  const expectedSignature = signPrincipalIntent(intent);
  if (expectedSignature !== intent.intentSignature) {
    return { ok: false, reason: "Intent signature verification failed" };
  }

  return {
    ok: true,
    intent,
  };
}

export function buildMathProof(params: {
  principalAmount: number;
  annualRate: number;
  years: number;
  projectedGain: number;
}) {
  const { principalAmount, annualRate, years, projectedGain } = params;
  const gross = Math.round(principalAmount * Math.pow(1 + annualRate, years));
  return `Proof: FV = ${principalAmount} * (1 + ${annualRate.toFixed(4)})^${years} = ${gross}; gain ~= ${projectedGain}.`;
}

export function toProxyPrincipalId(rawPrincipalId: string) {
  const digest = createHash("sha256").update(rawPrincipalId).digest("hex");
  return `pv_${digest.slice(0, 20)}`;
}