import { NextResponse } from "next/server";
import { z } from "zod";
import { buildMathProof, signPrincipalIntent } from "@/lib/guardrails/fiduciary";

const AttestIntentSchema = z.object({
  principalId: z.string().min(3),
  actionId: z.string().min(3),
  tier: z.number().int().min(1).default(4),
  amount: z.number().positive(),
  annualRate: z.number().positive().max(1).default(0.1),
  years: z.number().int().positive().default(1),
  biometricVerified: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AttestIntentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid attestation request", detail: parsed.error.flatten() }, { status: 400 });
    }

    const { principalId, actionId, tier, amount, annualRate, years, biometricVerified } = parsed.data;
    if (!biometricVerified) {
      return NextResponse.json({ error: "Biometric verification required" }, { status: 403 });
    }

    const consentedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const mathProof = buildMathProof({
      principalAmount: amount,
      annualRate,
      years,
      projectedGain: Math.round(amount * annualRate),
    });

    const intentSignature = signPrincipalIntent({
      principalId,
      actionId,
      tier,
      consentedAt,
      expiresAt,
    });

    return NextResponse.json({
      principalId,
      actionId,
      tier,
      consentedAt,
      expiresAt,
      biometricVerified,
      intentSignature,
      mathProof,
    });
  } catch (error) {
    console.error("Attest intent failed", error);
    return NextResponse.json({ error: "Failed to attest intent" }, { status: 500 });
  }
}
