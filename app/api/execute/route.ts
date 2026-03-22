import { NextResponse } from "next/server";
import { z } from "zod";
import { executeCommand } from "@/lib/executionEngine";
import { buildMathProof, validatePrincipalIntent } from "@/lib/guardrails/fiduciary";
import { createPendingDecree } from "@/lib/security/decreeStore";
import { logSovereignAction } from "@/lib/security/auditTrail";

interface ExecutePayload {
  principalId: string;
  decisionId: string;
  title: string;
  amount: number;
  type: "hysa_transfer" | "investment" | "debt_payment" | "generic";
  tier?: number;
  mathProof: string;
  attestation: unknown;
}

interface ExecuteResult {
  success: boolean;
  decreeId: string;
  shadowLedger: {
    syncState: "SYNCING";
    optimisticDelta: number;
  };
  receipt: {
    id: string;
    title: string;
    amount: number;
    compoundedYearly: number;
    executedAt: string;
    status: "completed" | "pending";
    message: string;
  };
}

const ExecutePayloadSchema = z.object({
  principalId: z.string().min(3),
  decisionId: z.string().min(3),
  title: z.string().min(3),
  amount: z.number().positive(),
  type: z.enum(["hysa_transfer", "investment", "debt_payment", "generic"]),
  tier: z.number().int().min(1).optional(),
  mathProof: z.string().min(16),
  attestation: z.unknown(),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const raw = (await req.json()) as ExecutePayload | { command?: { amount?: number } };

    // Compatibility mode for simple local execution payloads.
    if (raw && typeof raw === "object" && "command" in raw && raw.command) {
      return NextResponse.json(executeCommand(raw.command));
    }

    const parsed = ExecutePayloadSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid execute payload", detail: parsed.error.flatten() }, { status: 400 });
    }

    const body = parsed.data;
    const { principalId, decisionId, title, amount, type, mathProof } = body;
    const tier = body.tier ?? 4;

    const intentCheck = validatePrincipalIntent(body.attestation, {
      principalId,
      actionId: decisionId,
      minimumTier: 4,
    });

    if (!intentCheck.ok) {
      return NextResponse.json({ error: "Principal intent validation failed", reason: intentCheck.reason }, { status: 403 });
    }

    const expectedMathProof = buildMathProof({
      principalAmount: amount,
      annualRate: type === "hysa_transfer" ? 0.046 : type === "investment" ? 0.1 : 0.05,
      years: 1,
      projectedGain: Math.round(amount * (type === "hysa_transfer" ? 0.046 : type === "investment" ? 0.1 : 0.05)),
    });

    if (!mathProof.trim() || mathProof.trim().length < 16) {
      return NextResponse.json({ error: "Math proof is required for fiduciary execution" }, { status: 400 });
    }

    // ─── Plaid Transfer stub ───────────────────────────────────────────────
    // When you have a real Plaid access token + Transfer agreement:
    //
    // const plaidClient = new PlaidApi(plaidConfig);
    // const transfer = await plaidClient.transferCreate({
    //   access_token: userAccessToken,
    //   account_id: userAccountId,
    //   authorization_id: authId,
    //   amount: amount.toFixed(2),
    //   description: title,
    //   network: "ach",
    //   type: "debit",
    //   user: { legal_name: userName },
    // });
    // ──────────────────────────────────────────────────────────────────────

    const compoundedYearly = Math.round(amount * (type === "hysa_transfer" ? 0.046 : type === "investment" ? 0.10 : 0.05));
    const decreeId = `decree_${Date.now()}`;

    await createPendingDecree({
      decreeId,
      principalId,
      actionId: decisionId,
      amount,
    });

    await logSovereignAction(principalId, `execute:${decisionId}:tier-${tier}`);

    const result: ExecuteResult = {
      success: true,
      decreeId,
      shadowLedger: {
        syncState: "SYNCING",
        optimisticDelta: amount,
      },
      receipt: {
        id: `exec_${Date.now()}`,
        title,
        amount,
        compoundedYearly,
        executedAt: new Date().toISOString(),
        status: "pending",
        message: `Decree sealed. Syncing with bank rails now. Expected annual expansion: +$${compoundedYearly.toLocaleString()}.`,
      },
    };

    return NextResponse.json({
      ...result,
      fiduciaryGuardrail: {
        intentVerified: true,
        providedMathProof: mathProof,
        referenceMathProof: expectedMathProof,
      },
      cancelDecree: {
        endpoint: "/api/cancel-decree",
        decreeId,
        oneTap: true,
      },
      settlementWebhook: {
        endpoint: "/api/bank-confirmation",
        header: "x-settlement-key",
        expectedPayload: {
          decreeId,
          status: "settled | failed | reversed | canceled | pending",
        },
      },
    });
  } catch (error) {
    console.error("Execute error:", error);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}
