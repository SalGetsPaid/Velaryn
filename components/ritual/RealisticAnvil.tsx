'use client';

import { motion } from "framer-motion";

export default function RealisticAnvil({ onStrike }: { onStrike: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.985 }}
      onClick={onStrike}
      className="relative w-full rounded-[1.5rem] border border-amber-300/35 bg-black/40 px-5 py-5 shadow-[0_0_24px_rgba(212,175,55,0.25)]"
      aria-label="Strike the anvil"
    >
      <div className="absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_15%,rgba(212,175,55,0.18),transparent_60%)]" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <img src="/anvil-upgrade.svg" alt="Realistic anvil" className="h-20 w-auto" />
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-200">
          Strike the Anvil
        </p>
      </div>
    </motion.button>
  );
}
