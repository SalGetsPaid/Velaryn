"use client";

import { useQuery } from "@tanstack/react-query";

export default function AlphaPulse() {
  const { data } = useQuery({
    queryKey: ["alphaPulse"],
    queryFn: async () => {
      const res = await fetch("/api/alpha-pulse", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Alpha pulse unavailable");
      }
      return (await res.json()) as { sentiment: string };
    },
    refetchInterval: 300_000,
    staleTime: 240_000,
  });

  return (
    <div className="rounded-[1.5rem] border border-sky-400/20 bg-sky-500/5 p-5" role="status" aria-live="polite">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-400">GROK ALPHA PULSE</p>
      <p className="mt-2 text-sm leading-relaxed text-white">{data?.sentiment ?? "Scanning sentiment surface..."}</p>
    </div>
  );
}
