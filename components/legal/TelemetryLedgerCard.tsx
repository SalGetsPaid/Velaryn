"use client";

import { useQuery } from "@tanstack/react-query";

type TelemetryEntry = {
  id: string;
  route: string;
  objective: string;
  timestamp: string;
  complianceBasis: string[];
};

export default function TelemetryLedgerCard() {
  const { data } = useQuery({
    queryKey: ["process-ledger"],
    queryFn: async () => {
      const res = await fetch("/api/telemetry/process-ledger?limit=4", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch telemetry ledger");
      return (await res.json()) as { entries: TelemetryEntry[]; count: number };
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const entries = data?.entries ?? [];

  return (
    <section className="rounded-[1.6rem] border border-amber-300/20 bg-amber-300/5 p-4">
      <p className="smallcaps-label text-amber-200">Process Reconstruction Ledger</p>
      <p className="mt-1 text-xs text-zinc-400">Colorado AI Act traceability: reasoning paths + signed outcomes.</p>

      <div className="mt-4 space-y-2">
        {entries.length === 0 ? (
          <p className="text-xs text-zinc-500">No decisions logged yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-[11px] font-semibold text-white">{entry.route}</p>
              <p className="mt-1 text-[11px] text-zinc-400">{entry.objective}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                {new Date(entry.timestamp).toLocaleString()} • {entry.complianceBasis.join(" / ")}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
