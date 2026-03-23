"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Shield } from "lucide-react";
import ForgeCard from "@/components/ForgeCard";

interface SovereignHomeProps {
  action?: {
    title?: string;
    explanation?: string;
    impactYearly?: number;
  };
  onExecute: () => void;
  coachMessages?: string[];
  socialCount?: number;
  streak?: number;
}

export default function SovereignHome({
  action,
  onExecute,
  coachMessages,
  socialCount,
  streak,
}: SovereignHomeProps) {
  return (
    <div className="relative min-h-screen text-white">
      <img
        src="/anvil-upgrade.svg"
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-[420px] max-w-[70vw] opacity-10 pointer-events-none select-none"
      />

      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="font-[Playfair_Display] text-3xl text-amber-200 tracking-wide">Velaryn</h1>
          <p className="text-xs text-zinc-500">Your Sovereign Wealth System</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-2xl mx-auto px-6 py-24 pb-32 space-y-6">
        {/* NEXT ACTION (PRIMARY) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-2xl border border-amber-300/30 bg-gradient-to-b from-white/[0.08] to-black/[0.4] p-6 backdrop-blur-xl gold-glow"
        >
          <p className="text-[10px] tracking-[0.3em] text-amber-300 uppercase">Immediate Command</p>

          <h2 className="mt-2 font-[Playfair_Display] text-xl font-semibold text-white">
            {action?.title || "Optimize your cash flow"}
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            {action?.explanation || "Small actions create massive long-term gains."}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="text-emerald-300 font-medium">+${action?.impactYearly || 1200} long-term</span>

            <button
              onClick={onExecute}
              className="execute-button rounded-xl bg-amber-300 text-black px-5 py-2 font-bold transition hover:scale-105 hover:bg-amber-200"
            >
              Execute
            </button>
          </div>
        </motion.div>

        {/* SOCIAL PROOF */}
        <div className="text-center text-xs text-emerald-400">
          {socialCount?.toLocaleString() || "1,204"} users took action today
        </div>

        {/* AI COACH FEED */}
        <ForgeCard title="AI Coach">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles size={14} /> AI Coach
          </div>

          {coachMessages && coachMessages.length > 0 ? (
            coachMessages.map((msg, i) => (
              <div key={i} className="text-sm text-white">
                {msg}
              </div>
            ))
          ) : (
            <div className="text-sm text-white">Stay consistent. You're building real momentum.</div>
          )}
        </ForgeCard>

        {/* PROGRESS + IDENTITY */}
        <div className="grid grid-cols-2 gap-4">
          {/* STREAK */}
          <ForgeCard title="Streak" className="text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Streak</p>
            <p className="text-xl font-bold text-amber-200">{streak || 5} days</p>
          </ForgeCard>

          {/* IDENTITY */}
          <ForgeCard title="Status" className="text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Status</p>
            <p className="text-sm text-emerald-300 font-semibold">Wealth Builder</p>
          </ForgeCard>
        </div>

        {/* SECONDARY INSIGHTS */}
        <div className="grid grid-cols-2 gap-4">
          <ForgeCard title="Growth">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <TrendingUp size={14} /> Growth
            </div>
            <p className="text-sm text-white mt-1">+12% this month</p>
          </ForgeCard>

          <ForgeCard title="Protection">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Shield size={14} /> Protection
            </div>
            <p className="text-sm text-white mt-1">$2,100 saved</p>
          </ForgeCard>
        </div>
      </div>
    </div>
  );
}
