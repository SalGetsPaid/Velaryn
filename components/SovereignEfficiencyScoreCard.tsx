"use client";

type SovereignEfficiency = {
  score: number;
  label: "Dormant" | "Tactical" | "Elite";
  efficiencyDragPct: number;
  idleCash: number;
  workingCapitalRatio: number;
};

type SovereignEfficiencyScoreCardProps = {
  metrics: SovereignEfficiency | null;
  locale: string;
  currency: string;
};

export default function SovereignEfficiencyScoreCard({ metrics, locale, currency }: SovereignEfficiencyScoreCardProps) {
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  if (!metrics) {
    return (
      <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="smallcaps-label text-zinc-400">Sovereign Efficiency Score</p>
        <p className="mt-2 text-xs text-zinc-500">Awaiting efficiency telemetry.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.6rem] border border-sky-400/25 bg-sky-500/5 p-4">
      <p className="smallcaps-label text-sky-300">Sovereign Efficiency Score</p>
      <div className="mt-2 flex items-end gap-2">
        <p className="text-4xl font-light text-white">{metrics.score}</p>
        <p className="pb-1 text-xs uppercase tracking-[0.2em] text-sky-200">{metrics.label}</p>
      </div>
      <p className="mt-2 text-xs text-zinc-400">Efficiency tracking monitors idle drag versus working capital velocity.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Idle Cash</p>
          <p className="mt-1 text-sm font-semibold text-white">{currencyFormatter.format(metrics.idleCash)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Efficiency Drag</p>
          <p className="mt-1 text-sm font-semibold text-amber-200">{metrics.efficiencyDragPct.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Working Ratio</p>
          <p className="mt-1 text-sm font-semibold text-emerald-300">{(metrics.workingCapitalRatio * 100).toFixed(0)}%</p>
        </div>
      </div>
    </section>
  );
}
