"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

const OATH_ACCEPTED_KEY = "velaryn_oath_accepted";

interface DeepSignal {
  asset: string;
  alpha: number;
  sentiment: string;
  logic: string;
  target: string;
  winScenarios: string[];
}

const DEEP_SIGNALS: DeepSignal[] = [
  {
    asset: "NVDA",
    alpha: 88,
    sentiment: "Institutional Heavy Buying",
    logic: "Breaking 50-Day MA with 2× Volume",
    target: "$1,150",
    winScenarios: ["Hold for 12% gain over 6–8 weeks", "Hedge downside with OTM Puts at –8%"],
  },
  {
    asset: "BTC",
    alpha: 74,
    sentiment: "Whale Accumulation Phase",
    logic: "On-chain supply shock — exchange reserves at 3Y low",
    target: "$115,000",
    winScenarios: ["Scale in via DCA over 30 days", "Exit 50% at target, let 50% compound"],
  },
  {
    asset: "GOLD",
    alpha: 91,
    sentiment: "Central Bank Accumulation",
    logic: "Real yields contracting, dollar index declining",
    target: "$3,200 / oz",
    winScenarios: ["Rotate 10% of portfolio into physical or GLD", "Correlated hedge for equity volatility"],
  },
];

interface Signal {
  asset: string;
  price: string;
  trend: "Accumulate" | "Extract" | "Observe";
  color: string;
  reason: string;
}

export default function OraclePage() {
  const [ready, setReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const accepted = localStorage.getItem(OATH_ACCEPTED_KEY) === "true";
    setIsAuthorized(accepted);
    setReady(true);

    if (!accepted) {
      return;
    }

    const loadSignals = async () => {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) throw new Error(`Market fetch failed: ${response.status}`);
        const json = (await response.json()) as { signals?: Signal[] };
        setSignals(json.signals ?? []);
      } catch (error) {
        console.error("Failed to load market signals", error);
      }
    };

    loadSignals();
  }, []);

  if (!ready) {
    return <div className="p-6 pb-32 text-zinc-500 text-sm">Initializing Oracle...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="p-6 pb-32">
        <div className="glass-card p-8 rounded-[2rem] border border-amber-500/30">
          <h1 className="text-2xl brand-title italic text-metallic-gold">ORACLE LOCKED</h1>
          <p className="text-zinc-400 text-sm mt-3">
            The Oath of Sovereignty must be signed before Oracle access is granted.
          </p>
          <Link
            href="/"
            className="inline-flex mt-6 px-4 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-amber-300/50 hover:text-white transition-colors"
          >
            Return to Shield Layer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 pb-32">
      <header>
        <h1 className="text-3xl md:text-4xl brand-title italic text-metallic-gold">THE ORACLE</h1>
        <p className="smallcaps-label">AI-Driven Market Intelligence</p>
      </header>

      {/* ── DEEP ANALYSIS SIGNALS ─────────────────────────────────────── */}
      <section className="space-y-4">
        <p className="smallcaps-label border-b border-white/5 pb-3">Deep Alpha Analysis</p>
        {DEEP_SIGNALS.map((s, i) => (
          <motion.div
            key={s.asset}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="gilded-card p-8 bg-black/60 border border-amber-300/30"
          >
            {/* Header row */}
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <h3 className="text-3xl font-black italic text-metallic-gold">{s.asset}</h3>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Alpha Score</p>
                <p className="text-2xl font-black text-emerald-500">{s.alpha}/100</p>
              </div>
            </div>

            {/* Data grid */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="space-y-1">
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Whale Flow</p>
                <p className="text-xs font-bold text-white">{s.sentiment}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Target Strike</p>
                <p className="text-xs font-bold text-white">{s.target}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Signal Logic</p>
                <p className="text-xs text-zinc-300">{s.logic}</p>
              </div>
            </div>

            {/* Win-only execution path */}
            <div className="mt-5 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-[10px] text-emerald-500 font-black uppercase mb-2 flex items-center gap-1">
                <TrendingUp size={10} /> Win-Only Execution Path:
              </p>
              <ul className="text-xs text-zinc-300 space-y-1">
                {s.winScenarios.map((path) => (
                  <li key={path}>→ {path}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── LIVE MARKET PULSE ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <p className="smallcaps-label border-b border-white/5 pb-3">Live Market Pulse</p>
        {signals.length === 0 ? (
          <div className="glass-card p-6 rounded-[2rem] text-zinc-400 text-sm">Syncing market pulse...</div>
        ) : null}
        {signals.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-[2rem] flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl">{s.asset}</span>
                <span className="text-zinc-500 text-sm">{s.price}</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">{s.reason}</p>
            </div>

            <div className="text-right">
              <p className={`font-black uppercase tracking-tighter text-lg ${s.color}`}>
                {s.trend}
              </p>
              <div className="flex justify-end mt-1">
                {s.trend === "Accumulate" && <CheckCircle2 size={14} className="text-amber-300" />}
                {s.trend === "Extract" && <AlertTriangle size={14} className="text-red-500" />}
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
