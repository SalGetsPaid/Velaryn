"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Velaryn</h1>
          <p className="text-xs text-zinc-500">Your Sovereign Wealth System</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-2xl mx-auto px-6 py-24 pb-32 space-y-6">

        {/* NEXT ACTION (PRIMARY) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-2xl border border-amber-300/20 bg-gradient-to-b from-white/10 to-white/[0.02] p-5 shadow-[0_0_40px_rgba(212,175,55,0.15)]"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300">Next Action</p>

          <h2 className="mt-2 text-lg font-semibold text-white">
            {action?.title || "Optimize your cash flow"}
          </h2>

          <p className="mt-1 text-xs text-zinc-400">
            {action?.explanation || "Small actions create massive long-term gains."}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-emerald-300 font-semibold">
              +${action?.impactYearly || 1200}/yr
            </div>

            <button
              onClick={onExecute}
              className="rounded-xl bg-amber-300 text-black px-4 py-2 text-xs font-bold hover:bg-amber-200 transition"
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
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
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
        </div>

        {/* PROGRESS + IDENTITY */}
        <div className="grid grid-cols-2 gap-4">

          {/* STREAK */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Streak</p>
            <p className="text-xl font-bold text-amber-200">{streak || 5} days</p>
          </div>

          {/* IDENTITY */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Status</p>
            <p className="text-sm text-emerald-300 font-semibold">Wealth Builder</p>
          </div>
        </div>

        {/* SECONDARY INSIGHTS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <TrendingUp size={14} /> Growth
            </div>
            <p className="text-sm text-white mt-1">+12% this month</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Shield size={14} /> Protection
            </div>
            <p className="text-sm text-white mt-1">$2,100 saved</p>
          </div>
        </div>

      </div>
    </div>
  );
}
