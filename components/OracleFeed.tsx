"use client";

import { useEffect, useState } from "react";
import { i18n } from "@/lib/localization";
import { useSovereign } from "@/components/SovereignProvider";

interface Signal {
  asset: string;
  price: string;
  trend: "Accumulate" | "Extract" | "Observe";
  reason: string;
}

export function OracleFeed() {
  const { pref } = useSovereign();
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) return;
        const json = (await response.json()) as { signals?: Signal[] };
        setSignals(json.signals ?? []);
      } catch (error) {
        console.error("Oracle feed load failed", error);
      }
    };

    loadSignals();
  }, []);

  return (
    <div className="glass-card p-6 rounded-[2.5rem]">
      <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 mb-4">{i18n[pref.locale].oracle}</h3>
      <div className="space-y-3">
        {signals.slice(0, 3).map((signal) => (
          <div key={signal.asset} className="rounded-xl border border-white/5 p-3 bg-black/30">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{signal.asset}</span>
              <span className="text-zinc-400 text-xs">{signal.price}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">{signal.reason}</p>
          </div>
        ))}
        {signals.length === 0 ? <p className="text-xs text-zinc-500">Syncing market oracle...</p> : null}
      </div>
    </div>
  );
}
