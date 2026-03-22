"use client";

import { Globe, ShieldAlert } from "lucide-react";

export function WealthDefense({
  goldPrice,
  usdTrend,
  usdEurRate,
  onOpenStrategy,
}: {
  goldPrice: number;
  usdTrend: number;
  usdEurRate: number;
  onOpenStrategy?: () => void;
}) {
  const isWeakening = usdTrend < 0;
  const trendText = isWeakening ? "decreased" : "increased";
  const trendColor = isWeakening ? "text-red-400" : "text-emerald-500";

  return (
    <div className="glass-card p-6 rounded-[2.5rem] border-amber-500/20 bg-amber-500/5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-amber-500">
          <ShieldAlert size={18} />
          <h3 className="text-[10px] font-black tracking-[0.2em] uppercase">Wealth Defense</h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">GOLD: ${goldPrice.toFixed(0)}/oz</span>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-zinc-400">
          Purchasing power in <span className="text-white font-bold">USD</span> has {trendText} by <span className={trendColor}>{Math.abs(usdTrend).toFixed(2)}%</span> this week relative to hard assets.
        </p>

        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-zinc-500" />
            <span className="text-[10px] font-black">FOREX STRENGTH</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-black">USD/EUR: {usdEurRate.toFixed(3)}</span>
        </div>
      </div>

      <button
        className="w-full mt-4 py-3 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-black transition-all"
        onClick={onOpenStrategy}
      >
        View Hedge Strategy →
      </button>
    </div>
  );
}
