"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/lib/wealthEngine";

type GrokHorizonCardProps = {
  profile: UserProfile;
};

type HorizonResponse = {
  horizon: string;
};

export default function GrokHorizonCard({ profile }: GrokHorizonCardProps) {
  const { data } = useQuery({
    queryKey: ["grok-horizon", profile.oracleWatchlist.join("|"), profile.currentStage],
    queryFn: async () => {
      const response = await fetch("/api/grok-strike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalForged: profile.totalForged,
          forgeScore: profile.forgeScore,
          profile: {
            stage: profile.currentStage,
            monthlySurplus: profile.monthlySurplus,
          },
          watchlist: profile.oracleWatchlist,
        }),
      });

      if (!response.ok) {
        throw new Error("Grok horizon unavailable");
      }

      const payload = (await response.json()) as { grokInsight?: string; title?: string };
      return {
        horizon: payload.grokInsight || payload.title || "Focus core surplus deployment while preserving liquidity shield.",
      } satisfies HorizonResponse;
    },
    staleTime: 1000 * 60 * 60 * 12,
    refetchOnWindowFocus: false,
  });

  return (
    <section className="rounded-[1.6rem] border border-sky-400/20 bg-sky-500/5 p-4" aria-labelledby="horizon-heading">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-300">Predictive Co-Pilot</p>
      <h3 id="horizon-heading" className="mt-1 text-lg font-light text-white">Grok Horizon</h3>
      <p className="mt-2 text-sm text-zinc-200">{data?.horizon ?? "Scanning watchlist regime for next edge..."}</p>
    </section>
  );
}
