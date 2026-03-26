import { NextResponse } from "next/server";
import { z } from "zod";
import { recordLegalShieldReceipt } from "@/lib/security/legalShield";

const LegalShieldPayloadSchema = z.object({
  principalId: z.string().min(3),
  acceptedAt: z.string().datetime(),
  actionScope: z.enum(["manifesto", "vault-init"]).default("manifesto"),
  biometricVerified: z.boolean().default(false),
  biometricMethod: z.string().min(2).default("none"),
  policyVersion: z.string().min(3),
  termsVersion: z.string().min(3),
  privacyVersion: z.string().min(3),
  disclosureVersion: z.string().min(3).optional(),
  clickwrapAccepted: z.boolean().default(false),
  solvencyVerified: z.boolean().default(false),
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

    if (payload.actionScope === "manifesto" && !payload.biometricVerified) {
      return NextResponse.json({ error: "Biometric seal required for manifesto acceptance" }, { status: 403 });
    }

    if (payload.actionScope === "vault-init") {
      if (!payload.clickwrapAccepted) {
        return NextResponse.json({ error: "Clickwrap acceptance required for vault initialization" }, { status: 403 });
      }

      if (!payload.solvencyVerified) {
        return NextResponse.json({ error: "Self-directed solvency verification required for vault initialization" }, { status: 403 });
      }

      if (!payload.disclosureVersion) {
        return NextResponse.json({ error: "Disclosure version is required for vault initialization" }, { status: 400 });
      }
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
      actionScope: receipt.actionScope,
      disclosureVersion: receipt.disclosureVersion ?? null,
      clickwrapAccepted: receipt.clickwrapAccepted ?? false,
      solvencyVerified: receipt.solvencyVerified ?? false,
    });
  } catch (error) {
    console.error("Legal shield receipt creation failed", error);
    return NextResponse.json({ error: "Legal shield failed" }, { status: 500 });
  }
}