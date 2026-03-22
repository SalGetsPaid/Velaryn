"use client";

import { TrendingUp } from "lucide-react";
import { useSovereign } from "@/components/SovereignProvider";
import { formatCurrency } from "@/lib/localization";

export function TrajectoryMeter({
  netWorth = 18240,
  delta = 4.2,
  compact = false,
}: {
  netWorth?: number;
  delta?: number;
  compact?: boolean;
}) {
  const { pref } = useSovereign();

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-baseline mb-1">
          <p className="smallcaps-label">Sovereign Net Worth</p>
          <span className="text-amber-300 font-mono text-xs font-bold flex items-center gap-1">
            <TrendingUp size={12} /> {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
          </span>
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-metallic-gold font-brand">
          {formatCurrency(netWorth, pref.locale, pref.currency)}
        </h2>
        {/* Progress bar — visual wealth mountain */}
        <div className="mt-3 h-1 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-300 to-yellow-200"
            style={{ width: `${Math.min(100, Math.round((netWorth / 1_000_000) * 100))}%` }}
          />
        </div>
        <p className="text-[9px] text-zinc-600 mt-1">
          {Math.round((netWorth / 1_000_000) * 100)}% to first million
        </p>
      </div>
    );
  }

  return (
    <div className="gilded-card p-10 rounded-[3rem] relative overflow-hidden w-full">
      <p className="smallcaps-label mb-2">Optimized Trajectory</p>
      <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:gap-4">
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-metallic-gold font-brand">
          {formatCurrency(netWorth, pref.locale, pref.currency)}
        </h2>
        <span className="text-amber-300 font-mono font-bold flex items-center gap-1">
          <TrendingUp size={16} /> {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
