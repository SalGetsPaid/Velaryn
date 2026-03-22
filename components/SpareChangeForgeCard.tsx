"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { useSpareChangeForge } from "@/hooks/useSpareChangeForge";
import { getForgeCTA } from "@/lib/forgeCopy";

export default function SpareChangeForgeCard() {
  const { totalCapturedToday, enableRoundUps, deployNow, ready, isDeploying } = useSpareChangeForge();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-[2rem] border border-emerald-400/30 bg-emerald-500/5 p-6"
    >
      <div className="flex items-center gap-4">
        <Coins className="text-emerald-400" size={28} />
        <div>
          <p className="smallcaps-label text-emerald-400">SPARE CHANGE FORGE</p>
          <p className="text-3xl font-light tracking-tighter text-white">
            ${totalCapturedToday.toFixed(2)} captured today
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => enableRoundUps()}
          disabled={!ready}
          className="flex-1 rounded-2xl bg-emerald-600 py-4 text-sm font-semibold disabled:opacity-40"
        >
          {getForgeCTA("connect")}
        </button>
        <button
          onClick={deployNow}
          disabled={totalCapturedToday === 0 || isDeploying}
          className="flex-1 rounded-2xl border border-emerald-400/50 py-4 text-sm font-semibold disabled:opacity-40"
        >
          {isDeploying ? "Deploying..." : getForgeCTA("deploy")}
        </button>
      </div>

      <p className="mt-4 text-[10px] text-zinc-500">
        Every penny compounds. No dollar left behind.
      </p>
    </motion.div>
  );
}
