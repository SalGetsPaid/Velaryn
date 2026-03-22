import { NextResponse } from "next/server";
import { z } from "zod";

const GrokStrikeSchema = z.object({
  totalForged: z.number().nonnegative(),
  forgeScore: z.number().min(0).max(100),
  profile: z.unknown().optional(),
  watchlist: z.array(z.string()).optional(),
  oracleInsights: z
    .object({
      selectedAssets: z.array(z.string()),
      currentMomentum: z.number(),
      projected30YWithSelection: z.number(),
      riskAdjustedYield: z.number(),
    })
    .optional(),
});

type GrokStrikeResponse = {
  title: string;
  amount: number;
  impact: string;
  grokInsight: string;
};

function fallbackStrike(totalForged: number, forgeScore: number): GrokStrikeResponse {
  const amount = Math.max(250, Math.round(Math.max(totalForged * 0.015, 450)));
  return {
    title: "Grok Strike: Base Core Index Sweep",
    amount,
    impact: `+ $${Math.round(amount * 12 * 1.07).toLocaleString()} (1Y velocity projection)`,
    grokInsight: `At Forge Score ${forgeScore}, prioritize disciplined recurring index deployment before higher-volatility sleeves.`,
  };
}

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = GrokStrikeSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid Grok strike payload", detail: parsed.error.flatten() }, { status: 400 });
    }

    const { totalForged, forgeScore, profile, watchlist = [], oracleInsights } = parsed.data;
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(fallbackStrike(totalForged, forgeScore));
    }

    const prompt = `You are Grok, financial sovereign advisor. User has forged $${totalForged} with score ${forgeScore}. Profile: ${JSON.stringify(profile)}. Selected watchlist assets: ${watchlist.join(", ") || "TSLA, DOGE, SPX"}. Oracle metrics: ${JSON.stringify(oracleInsights ?? {})}. Suggest ONE optimal "Strike" (amount, asset, rationale, 30Y projected impact at 7% + alpha). Return ONLY JSON: {title, amount, impact, grokInsight}`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-0709",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(fallbackStrike(totalForged, forgeScore));
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(fallbackStrike(totalForged, forgeScore));
    }

    const suggestion = JSON.parse(content) as Partial<GrokStrikeResponse>;
    return NextResponse.json({
      title: suggestion.title || fallbackStrike(totalForged, forgeScore).title,
      amount: Number.isFinite(suggestion.amount) ? Number(suggestion.amount) : fallbackStrike(totalForged, forgeScore).amount,
      impact: suggestion.impact || fallbackStrike(totalForged, forgeScore).impact,
      grokInsight: suggestion.grokInsight || fallbackStrike(totalForged, forgeScore).grokInsight,
    });
  } catch (error) {
    console.error("Grok strike failed", error);
    return NextResponse.json({ error: "Grok strike failed" }, { status: 500 });
  }
}
