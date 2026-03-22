"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import Link from "next/link";

export function ArchitectPriority({
  title,
  action,
  impact,
}: {
  title: string;
  action: string;
  impact: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="gilded-card p-5 flex items-center justify-between gap-4 border-amber-400/25 bg-amber-400/5 hover:border-amber-300/50 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Pulsing priority indicator */}
        <span className="relative flex-shrink-0">
          <span className="absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-300" />
        </span>

        <div className="min-w-0">
          <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-0.5">
            Architect Priority
          </p>
          <p className="text-sm font-black text-white truncate">{title}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">{action}</p>
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <p className="text-xs font-black text-emerald-400">{impact}</p>
        <Link
          href="/strategist"
          className="text-[9px] font-black uppercase tracking-widest text-amber-300/60 group-hover:text-amber-300 transition-colors flex items-center gap-1 justify-end mt-1"
        >
          Deploy <Zap size={9} />
        </Link>
      </div>
    </motion.div>
  );
}
