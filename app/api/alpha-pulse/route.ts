import { NextResponse } from "next/server";

function fallbackPulse() {
  return {
    sentiment:
      "Risk appetite is constructive on large-cap tech and selective meme-beta. Maintain core index velocity while capping speculative sleeve exposure.",
  };
}

export async function GET() {
  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallbackPulse());
    }

    const prompt = "Summarize current market sentiment for a disciplined wealth app user in one concise sentence. Mention risk regime and practical allocation posture. Return JSON only: {sentiment}.";

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-0709",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.25,
        max_tokens: 180,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(fallbackPulse());
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(fallbackPulse());
    }

    const parsed = JSON.parse(content) as { sentiment?: string };
    return NextResponse.json({ sentiment: parsed.sentiment || fallbackPulse().sentiment });
  } catch (error) {
    console.error("Alpha pulse failed", error);
    return NextResponse.json(fallbackPulse());
  }
}
