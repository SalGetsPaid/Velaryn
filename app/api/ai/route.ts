import { NextResponse } from "next/server";

interface AICoachPayload {
  score: number;
  netWorth: number;
  decision?: { title?: string } | null;
  spending: number;
  savings: number;
}

export async function generateAiCoachMessage(body: AICoachPayload): Promise<string> {
  const { score, netWorth, decision, spending, savings } = body;

  if (!process.env.OPENAI_API_KEY) {
    return `Score: ${score}. Net worth $${netWorth.toLocaleString()}. Your top move "${decision?.title ?? 'optimize cash'}" could add $${Math.round(savings * 0.15)}/year. Act today.`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 120,
        messages: [
          { role: "system", content: "You are Velaryn's elite AI wealth coach. Be concise, numeric, and motivational." },
          {
            role: "user",
            content: `Score: ${score} | Net Worth: $${netWorth} | Spending: $${spending} | Savings: $${savings} | Top decision: ${decision?.title ?? 'None'}\nGive 2-sentence actionable insight.`,
          },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "Focus on your top decision today.";
  } catch {
    return "AI insight temporarily unavailable \u2014 check back soon.";
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AICoachPayload;
    const message = await generateAiCoachMessage(body);
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ message: "AI service error" }, { status: 500 });
  }
}
