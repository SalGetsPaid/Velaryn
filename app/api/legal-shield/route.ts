import { NextResponse } from "next/server";
import { z } from "zod";
import { recordLegalShieldReceipt } from "@/lib/security/legalShield";

const LegalShieldPayloadSchema = z.object({
  principalId: z.string().min(3),
  acceptedAt: z.string().datetime(),
  biometricVerified: z.boolean(),
  biometricMethod: z.string().min(2),
  policyVersion: z.string().min(3),
  termsVersion: z.string().min(3),
  privacyVersion: z.string().min(3),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LegalShieldPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid legal shield payload", detail: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const acceptedAtMs = new Date(payload.acceptedAt).getTime();
    if (!Number.isFinite(acceptedAtMs)) {
      return NextResponse.json({ error: "Invalid acceptedAt" }, { status: 400 });
    }

    const now = Date.now();
    if (acceptedAtMs > now + 60_000 || acceptedAtMs < now - 10 * 60_000) {
      return NextResponse.json({ error: "Acceptance timestamp is out of compliance window" }, { status: 400 });
    }

    if (!payload.biometricVerified) {
      return NextResponse.json({ error: "Biometric seal required for manifesto acceptance" }, { status: 403 });
    }

    const receipt = await recordLegalShieldReceipt({
      ...payload,
      userAgent: req.headers.get("user-agent") ?? "unknown",
      forwardedFor: req.headers.get("x-forwarded-for") ?? "unknown",
    });

    return NextResponse.json({
      success: true,
      receiptId: receipt.receiptId,
      signature: receipt.signature,
      acceptedAt: receipt.acceptedAt,
    });
  } catch (error) {
    console.error("Legal shield receipt creation failed", error);
    return NextResponse.json({ error: "Legal shield failed" }, { status: 500 });
  }
}