"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useSovereign } from "@/components/SovereignProvider";

type StrategyModuleCardProps = {
  module: {
    id: string;
    title: string;
    icon: ReactNode;
    tag: string;
    tagColor: string;
    desc: string;
    winLogic: string;
  };
  isPremium?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
};

export function StrategyModuleCard({ module, isPremium = false, children, actions }: StrategyModuleCardProps) {
  const { profile } = useSovereign();
  const isUnlocked = !isPremium || profile.forgeScore >= 50;

  if (!isUnlocked) {
    return (
      <motion.div
        className="gilded-card p-8 relative overflow-hidden opacity-70 border-zinc-800/50"
        whileHover={{ scale: 1.01 }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <div className="text-center px-6">
            <Lock size={32} className="mx-auto text-amber-400 mb-3" />
            <h4 className="text-lg font-black text-amber-300">Sovereign Tier Required</h4>
            <p className="text-xs text-zinc-400 mt-2 mb-4">
              Unlock advanced modules and accelerate your ascension.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-5 py-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-sm font-black text-amber-300 hover:bg-amber-500/30 transition"
            >
              Upgrade Now
            </Link>
          </div>
        </div>

        <div className="blur-sm pointer-events-none">
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              {module.icon}
            </div>
            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${module.tagColor}`}>
              {module.tag}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">{module.title}</h3>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{module.desc}</p>
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
            <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">Winning Strategy:</p>
            <p className="text-xs italic text-zinc-400">{module.winLogic}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="gilded-card p-8 group hover:border-amber-300/50 transition-all relative"
      whileHover={{ scale: 1.015 }}
    >
      {profile.completedModules.includes(module.id) && (
        <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-full">
          Completed
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-amber-400/10 transition-colors">
          {module.icon}
        </div>
        <span className={`text-[9px] font-black tracking-widest px-3 py-1 rounded-full uppercase ${module.tagColor}`}>
          {module.tag}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-2 group-hover:text-metallic-gold transition-colors">{module.title}</h3>
      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{module.desc}</p>
      <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
        <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">Winning Strategy:</p>
        <p className="text-xs italic text-zinc-300">{module.winLogic}</p>
      </div>

      {children ? <div className="mt-5">{children}</div> : null}

      <div className="mt-5 flex flex-wrap gap-3 items-center">
        <Link href={`/library/${module.id}`} className="rounded-full border border-amber-300/25 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-amber-300 hover:border-amber-300/50">
          Open Playbook
        </Link>
        {actions}
      </div>
    </motion.div>
  );
}
