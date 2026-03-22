"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, Landmark, Coins, Globe } from "lucide-react";
import { useSovereign } from "@/components/SovereignProvider";
import { formatCurrency } from "@/lib/localization";

interface MacroData {
  gold: number;
  silver: number;
  dxy: {
    eur: number;
    gbp: number;
    jpy: number;
  };
  usdTrend: number;
}

export default function HedgeStrategyPage() {
  const { pref } = useSovereign();
  const [macro, setMacro] = useState<MacroData | null>(null);

  useEffect(() => {
    const loadMacro = async () => {
      try {
        const response = await fetch("/api/macro", { cache: "no-store" });
        if (!response.ok) return;
        const json = (await response.json()) as MacroData;
        setMacro(json);
      } catch (error) {
        console.error("Failed to load hedge strategy macro feed", error);
      }
    };

    loadMacro();
  }, []);

  const profile = useMemo(() => {
    const gold = macro?.gold ?? 2154;
    const usdTrend = macro?.usdTrend ?? -0.4;
    const fx = macro?.dxy ?? { eur: 0.92, gbp: 0.78, jpy: 150 };

    const status = usdTrend < 0 ? "Defense posture advised" : "Neutral posture";
    const statusColor = usdTrend < 0 ? "text-amber-400" : "text-amber-300";

    return { gold, usdTrend, fx, status, statusColor };
  }, [macro]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 pb-32 text-white space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Back to Command Center
        </Link>
        <span className="smallcaps-label">Relative Purchasing Power</span>
      </div>

      <section className="glass-card p-8 rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center gap-3 text-amber-400 mb-4">
          <ShieldAlert size={18} />
          <h1 className="text-xl md:text-3xl brand-title text-metallic-gold">WEALTH DEFENSE STRATEGY</h1>
        </div>
        <p className="text-zinc-300 text-sm leading-6">
          Velaryn tracks hard assets and global currency strength to protect purchasing power when fiat momentum weakens.
        </p>
        <p className={`mt-4 text-sm font-black uppercase tracking-widest ${profile.statusColor}`}>{profile.status}</p>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <p className="smallcaps-label">Gold Spot</p>
          <p className="text-2xl font-black mt-2">${profile.gold.toFixed(0)}/oz</p>
          <p className="text-zinc-500 text-xs mt-1">Hard asset reference anchor</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <p className="smallcaps-label">USD Trend</p>
          <p className={`text-2xl font-black mt-2 ${profile.usdTrend < 0 ? "text-red-400" : "text-amber-300"}`}>
            {profile.usdTrend >= 0 ? "+" : ""}{profile.usdTrend.toFixed(2)}%
          </p>
          <p className="text-zinc-500 text-xs mt-1">Basket-weighted FX impulse</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <p className="smallcaps-label">FX Snapshot</p>
          <p className="text-sm font-mono mt-2">EUR {profile.fx.eur.toFixed(3)}</p>
          <p className="text-sm font-mono">GBP {profile.fx.gbp.toFixed(3)} | JPY {profile.fx.jpy.toFixed(2)}</p>
        </div>
      </section>

      <section className="glass-card rounded-[2rem] p-6 border border-white/5 space-y-4">
        <h2 className="smallcaps-label">Hedge Playbook</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
            <div className="flex items-center gap-2 text-zinc-300 mb-2"><Coins size={14} /> Hard Asset Sleeve</div>
            <p className="text-xs text-zinc-400">Redirect a defined cash sleeve to gold-backed exposure when USD trend remains negative.</p>
          </div>
          <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
            <div className="flex items-center gap-2 text-zinc-300 mb-2"><Globe size={14} /> FX Diversification</div>
            <p className="text-xs text-zinc-400">Allocate reserve cash across stronger currency rails when local purchasing power decays.</p>
          </div>
          <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
            <div className="flex items-center gap-2 text-zinc-300 mb-2"><Landmark size={14} /> Yield Shield</div>
            <p className="text-xs text-zinc-400">Compare local APY versus treasury and high-yield alternatives before leaving cash idle.</p>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-[2rem] p-6 border border-white/5">
        <h3 className="smallcaps-label mb-3">Suggested First Move</h3>
        <p className="text-zinc-300 text-sm">
          Protect 15% of idle cash this week. If your reserve pool is {formatCurrency(12000, pref.locale, pref.currency)}, move {formatCurrency(1800, pref.locale, pref.currency)} into your selected hedge sleeve.
        </p>
      </section>
    </main>
  );
}
