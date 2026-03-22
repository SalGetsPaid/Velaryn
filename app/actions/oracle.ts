'use server';

import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const StrategyDossierSchema = z.object({
  title: z.string(),
  tier: z.enum(["Free", "Velocity", "Sovereign", "Legacy"]),
  steps: z.array(z.string()).length(3),
  win_certainty: z.string(),
  projected_net_worth: z.object({
    m12: z.number(),
    m36: z.number(),
    m120: z.number(),
  }),
  forge_score_impact: z.number(),
});

export type StrategyDossier = z.infer<typeof StrategyDossierSchema>;

function fallbackDossier(command: string): StrategyDossier {
  return {
    title: command.toLowerCase().includes("tax") ? "Tax Shield Sprint" : "Seven-Year Sovereign Path",
    tier: "Velocity",
    steps: [
      "Cut recurring leak stack and redirect to surplus engine",
      "Launch AI Localization strike to add +$850 monthly surplus",
      "Auto-deploy 22% of monthly surplus into Roth + Index shield",
    ],
    win_certainty: "92%",
    projected_net_worth: {
      m12: 42000,
      m36: 118000,
      m120: 610000,
    },
    forge_score_impact: 45,
  };
}

export async function generateStrategy(command: string, userProfile: unknown): Promise<StrategyDossier> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackDossier(command);
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are the Velaryn Oracle. Return only structured JSON. Use this exact schema: {title:string, tier:Free|Velocity|Sovereign|Legacy, steps:string[3], win_certainty:string, projected_net_worth:{m12:number,m36:number,m120:number}, forge_score_impact:number}",
      },
      { role: "user", content: `Command: ${command}. Profile: ${JSON.stringify(userProfile)}` },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return fallbackDossier(command);
  }

  return StrategyDossierSchema.parse(JSON.parse(content));
}
