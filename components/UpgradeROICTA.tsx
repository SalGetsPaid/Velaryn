"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/localization";
import { useSovereign } from "@/components/SovereignProvider";
import Link from "next/link";

export function UpgradeROICTA() {
  const { profile, pref } = useSovereign();
  const [surplusMultiplier, setSurplusMultiplier] = useState(1);

  const baseSurplus = profile.monthlySurplus || 1420;
  const annualSurplus = baseSurplus * 12;
  const years = 20;
  const rate = 0.07;

  const freeProjected = annualSurplus * years;
  const premiumProjected = annualSurplus * surplusMultiplier * Math.pow(1 + rate, years);
  const extraValue = premiumProjected - freeProjected;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gilded-card p-8 border-amber-400/30 bg-gradient-to-b from-amber-400/5 to-black/60 mb-12"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <h3 className="text-2xl font-black italic text-metallic-gold mb-3">
            See Your 20-Year Forge Potential
          </h3>
          <p className="text-zinc-300 mb-6">
            Sovereign Tier users average <span className="text-emerald-400 font-black">2-3.4x more strikes</span> per year through auto-rules and unlocked modules.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm text-zinc-400">Strike Multiplier:</label>
              <input
                type="range"
                min={1}
                max={3.5}
                step={0.1}
                value={surplusMultiplier}
                onChange={(e) => setSurplusMultiplier(Number(e.target.value))}
                className="w-48 accent-amber-400"
              />
              <span className="text-sm font-black text-amber-300">{surplusMultiplier.toFixed(1)}x</span>
            </div>

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">Free Tier (20y)</p>
                <p className="text-xl font-black text-zinc-400">
                  {formatCurrency(freeProjected, pref.locale, pref.currency)}
                </p>
              </div>
              <div className="border-l border-amber-400/20 pl-6">
                <p className="text-[10px] uppercase tracking-widest text-emerald-400">Sovereign Tier (20y)</p>
                <p className="text-2xl font-black text-emerald-400">
                  {formatCurrency(premiumProjected, pref.locale, pref.currency)}
                </p>
              </div>
            </div>

            <p className="text-center text-sm text-emerald-300 font-black mt-4">
              +{formatCurrency(extraValue, pref.locale, pref.currency)} potential upside
            </p>
          </div>
        </div>

        <div className="text-center md:text-right">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-black font-black text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)]"
          >
            Unlock Sovereign Tier <ArrowRight size={20} />
          </Link>
          <p className="text-[10px] text-zinc-500 mt-3">
            Start your ascension • Cancel anytime
          </p>
        </div>
      </div>
    </motion.div>
  );
}
