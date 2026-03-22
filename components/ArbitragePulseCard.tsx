"use client";

type ArbitragePulse = {
  rail: "FedNow/RTP";
  captureRateBps: number;
  annualizedYieldCapture: number;
  status: "active" | "warming";
  spreadCapturedToday: number;
  nextSettlementWindow: string;
};

type ArbitragePulseCardProps = {
  pulse: ArbitragePulse | null;
  locale: string;
  currency: string;
};

export default function ArbitragePulseCard({ pulse, locale, currency }: ArbitragePulseCardProps) {
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <section className="rounded-[1.6rem] border border-emerald-400/25 bg-emerald-500/5 p-4">
      <p className="smallcaps-label text-emerald-300">Arbitrage Pulse</p>
      <p className="mt-1 text-xs text-zinc-400">FedNow/RTP float capture engine routing micro-yield in real time.</p>

      {pulse ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-white">{pulse.status.toUpperCase()} • {pulse.rail}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Capture Rate</p>
            <p className="mt-1 text-sm font-semibold text-emerald-300">{pulse.captureRateBps} bps</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Captured Today</p>
            <p className="mt-1 text-sm font-semibold text-white">{currencyFormatter.format(pulse.spreadCapturedToday)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Annualized Capture</p>
            <p className="mt-1 text-sm font-semibold text-emerald-300">{currencyFormatter.format(pulse.annualizedYieldCapture)}</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-zinc-500">Pulse warming up.</p>
      )}
    </section>
  );
}
