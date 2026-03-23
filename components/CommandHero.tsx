"use client";

import { motion } from "framer-motion";

type CommandHeroData = {
  title: string;
  description: string;
  impact: string;
};

type CommandHeroProps = {
  command: CommandHeroData;
  progressPercent?: number;
  onExecute: () => void;
};

export default function CommandHero({ command, progressPercent = 12, onExecute }: CommandHeroProps) {
  const safePercent = Math.max(0, Math.min(100, progressPercent));

  return (
    <div className="relative rounded-[2rem] border border-amber-300/20 bg-gradient-to-br from-black via-[#0a0a0a] to-black p-6 shadow-[0_0_60px_rgba(212,175,55,0.12)]">
      <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.15),transparent_60%)]" />

      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70">Current Command</p>

        <h1 className="mt-2 font-[Playfair_Display] text-3xl font-semibold text-white">{command.title}</h1>

        <p className="mt-1 text-sm text-zinc-400">{command.description}</p>

        <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-zinc-500">2 taps. 30 seconds.</p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onExecute}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 py-3 font-bold text-black shadow-lg transition hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(232,197,71,0.2)]"
        >
          Execute Command
        </motion.button>

        <div className="mt-4 text-sm font-semibold text-emerald-300">+ {command.impact}</div>

        <div className="mt-5 space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300"
              style={{ width: `${safePercent}%` }}
            />
          </div>
          <p className="text-sm text-zinc-400">You are {safePercent}% ahead of plan this week</p>
        </div>
      </div>
    </div>
  );
}