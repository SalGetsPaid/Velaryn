import { NextResponse } from "next/server";
import {
  enrichStrategy,
  getDefaultUserProfile,
  type StrategyDossier,
  type UserProfile,
} from "@/lib/wealthEngine";
import { buildMathProof } from "@/lib/guardrails/fiduciary";
import { logProcessReconstruction } from "@/lib/security/processReconstructionLedger";

interface StrategyRequest {
  query: string;
  profile?: UserProfile;
}

/** Rule-based fallback when no OpenAI key is present */
function generateFallback(query: string, profile: UserProfile): StrategyDossier {
  const q = query.toLowerCase();
  const fallbackProof = buildMathProof({
    principalAmount: Math.max(profile.currentNetWorth, profile.totalForged, 1000),
    annualRate: 0.07,
    years: 3,
    projectedGain: Math.round(Math.max(profile.currentNetWorth, profile.totalForged, 1000) * 0.225),
  });

  if (q.includes("surplus") || q.includes("income forge") || q.includes("side hustle")) {
    return enrichStrategy({
      dossier_title: "Income Forge Velocity Dossier",
      steps: [
        { action: "Launch AI Voiceover Localization sprint for 5-minute clips", impact: "$150/video" },
        { action: "Publish 5 faceless app-growth TikToks weekly", impact: "$500-$1k/week" },
        { action: "Deploy one low-code support agent package for a local SMB", impact: "$2,000 setup fee" },
      ],
      math_proof: fallbackProof,
      win_certainty: "92%",
      oracle_prompt: "Architect, your current surplus is $140/mo. To reach Velocity Stage in 12 months, you need +$850/mo. I recommend the AI Localization Strike. Would you like the step-by-step dossier?",
    }, profile);
  }

  if (q.includes("million") || q.includes("1m") || q.includes("retire")) {
    return enrichStrategy({
      dossier_title: "The Seven-Year Sovereign Path",
      steps: [
        { action: "Execute debt compression on highest APR accounts", impact: "$3,100 interest saved" },
        { action: "Activate Income Forge using AI automation skill stack", impact: "+$1,200/mo surplus" },
        { action: "Auto-Strike 22% of monthly surplus into Roth Shield", impact: "$1.1M at Year 30" },
      ],
      math_proof: fallbackProof,
      win_certainty: "94%",
    }, profile);
  }

  if (q.includes("debt") || q.includes("pay off") || q.includes("loan")) {
    return enrichStrategy({
      dossier_title: "Debt Alchemist Reset Protocol",
      steps: [
        { action: "Execute avalanche sequence on highest APR liabilities", impact: "$2,400 interest saved" },
        { action: "Refinance toxic debt into low-cost secured lane", impact: "+$650/mo free cash flow" },
        { action: "Auto-Strike 18% of recovered cash flow monthly", impact: "$860k at Year 30" },
      ],
      math_proof: fallbackProof,
      win_certainty: "92%",
    }, profile);
  }

  if (q.includes("real estate") || q.includes("property") || q.includes("house")) {
    return enrichStrategy({
      dossier_title: "Property Sovereignty Expansion",
      steps: [
        { action: "Acquire first cash-flow property with DSCR threshold", impact: "+$700/mo net income" },
        { action: "Layer cost-seg shield into annual tax plan", impact: "$9,200 tax reduction" },
        { action: "Cycle equity through refinance into second asset", impact: "$1.4M by Year 30" },
      ],
      math_proof: fallbackProof,
      win_certainty: "87%",
    }, profile);
  }

  return enrichStrategy({
    dossier_title: "Foundational Sovereign Path",
    steps: [
      { action: "Stabilize emergency reserve and remove high-interest drag", impact: "$1,900 annual leak recovery" },
      { action: "Increase monthly surplus through income automation", impact: "+$900/mo surplus" },
      { action: "Auto-Strike recurring surplus into long-horizon tax shield", impact: "$980k at Year 30" },
    ],
    math_proof: fallbackProof,
    win_certainty: "91%",
  }, profile);
}

export async function POST(req: Request) {
  try {
    const { query, profile } = (await req.json()) as StrategyRequest;
    const normalizedProfile = profile ?? getDefaultUserProfile();

    if (!query?.trim()) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      const fallback = generateFallback(query, normalizedProfile);
      logProcessReconstruction({
        route: "/api/strategist",
        principalId: "velaryn-user",
        objective: "Generate actionable wealth strategy with auditable reasoning path.",
        inputs: {
          query,
          monthlySurplus: normalizedProfile.monthlySurplus,
          currentNetWorth: normalizedProfile.currentNetWorth,
        },
        reasoningPath: [
          "Detect strategy intent from user query semantics.",
          "Map profile stage to sovereign playbook templates.",
          "Build deterministic 3-step execution sequence with quantified impacts.",
          "Attach fiduciary math proof and confidence envelope.",
        ],
        outcome: {
          dossierTitle: fallback.dossier_title,
          winCertainty: fallback.win_certainty,
          stage: fallback.current_stage,
          model: "rule-fallback",
        },
        complianceBasis: ["CO_AI_ACT_2026", "PROCESS_RECONSTRUCTION_LEDGER"],
      }).catch((error) => {
        console.error("Strategist process reconstruction log failed", error);
      });

      return NextResponse.json(fallback);
    }

    const systemPrompt = `You are Velaryn's elite AI wealth architect. When given a wealth goal or question, respond ONLY with valid JSON matching this exact shape:
{
  "dossier_title": "The Seven-Year Sovereign Path",
  "steps": [
    {"action": "Specific command", "impact": "specific numeric impact"},
    {"action": "Specific command", "impact": "specific numeric impact"},
    {"action": "Specific command", "impact": "specific numeric impact"}
  ],
  "math_proof": "FV = principal*(1+r)^n + PMT*(((1+r)^n -1)/r)",
  "win_certainty": "92%",
  "oracle_prompt": "Architect, your current surplus is $140/mo. To reach Velocity Stage in 12 months, you need +$850/mo. I recommend the AI Localization Strike. Would you like the step-by-step dossier?",
  "probability_math": "Based on backtested profile data and market conditions."
}
Use exactly 3 steps. Each step must have action and impact fields. Be specific, numeric, and actionable.
If the user's financial state is early-stage, favor a debt-first and emergency-fund-first sequence before velocity investing.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 400,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `User profile: ${JSON.stringify(normalizedProfile)}\nQuestion: ${query}`,
          },
        ],
      }),
    });

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return NextResponse.json(generateFallback(query, normalizedProfile));

    const parsed = JSON.parse(raw) as Omit<StrategyDossier, "current_stage" | "next_milestone" | "forge_score_boost" | "auto_strike_rule" | "unlocked_module" | "forge_score" | "projectedNetWorth" | "oracle_prompt" | "income_strikes">;
    if (!parsed.math_proof || String(parsed.math_proof).trim().length < 16) {
      parsed.math_proof = buildMathProof({
        principalAmount: Math.max(normalizedProfile.currentNetWorth, normalizedProfile.totalForged, 1000),
        annualRate: 0.07,
        years: 3,
        projectedGain: Math.round(Math.max(normalizedProfile.currentNetWorth, normalizedProfile.totalForged, 1000) * 0.225),
      });
    }
    const enriched = enrichStrategy(parsed, normalizedProfile);
    logProcessReconstruction({
      route: "/api/strategist",
      principalId: "velaryn-user",
      objective: "Generate actionable wealth strategy with auditable reasoning path.",
      inputs: {
        query,
        monthlySurplus: normalizedProfile.monthlySurplus,
        currentNetWorth: normalizedProfile.currentNetWorth,
      },
      reasoningPath: [
        "Apply system constraints and strict JSON schema.",
        "Evaluate profile and query against wealth architecture playbooks.",
        "Generate 3-step strategy with deterministic impact language.",
        "Validate math proof and enrich with stage/milestone metadata.",
      ],
      outcome: {
        dossierTitle: enriched.dossier_title,
        winCertainty: enriched.win_certainty,
        stage: enriched.current_stage,
        model: "openai-chat-completions",
      },
      complianceBasis: ["CO_AI_ACT_2026", "PROCESS_RECONSTRUCTION_LEDGER"],
    }).catch((error) => {
      console.error("Strategist process reconstruction log failed", error);
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Strategist route error:", error);
    return NextResponse.json(
      { error: "Strategy generation failed" },
      { status: 500 }
    );
  }
}
