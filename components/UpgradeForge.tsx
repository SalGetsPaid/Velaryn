"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Gem, X } from "lucide-react";
import { usePayment } from "@/lib/usePayment";

const ENTITLEMENT_MAP = {
  obsidian: "velaryn_obsidian",
  diamond: "velaryn_diamond",
} as const;

export default function UpgradeForge({
  open,
  onClose,
  defaultTier = "obsidian",
}: {
  open: boolean;
  onClose: () => void;
  defaultTier?: "obsidian" | "diamond";
}) {
  const { loading, error, upgradeToTier, isPlatformNative } = usePayment();

  const options: Array<{
    tier: "obsidian" | "diamond";
    name: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      tier: "obsidian",
      name: "Obsidian",
      desc: "Precision wealth command + advanced signal depth.",
      icon: <Gem size={18} className="text-amber-300" />,
    },
    {
      tier: "diamond",
      name: "Diamond",
      desc: "Full auto-pilot forge with strategic mastery modules.",
      icon: <Crown size={18} className="text-amber-300" />,
    },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md flex items-end md:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 210 }}
            className="w-full max-w-2xl rounded-[2rem] border border-amber-300/30 bg-black/70 p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="brand-title text-metallic-gold text-2xl md:text-3xl">Upgrade Forge</h2>
                <p className="smallcaps-label mt-1">Strike a tier to deploy premium access</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-900 border border-amber-300/20 hover:border-amber-300/40"
                aria-label="Close upgrade forge"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {options.map((option) => {
                const isDefault = option.tier === defaultTier;

                return (
                  <button
                    key={option.tier}
                    onClick={() => upgradeToTier(option.tier)}
                    disabled={loading}
                    className={`text-left rounded-2xl p-5 border transition-all ${isDefault ? "border-amber-300/60 bg-amber-300/10" : "border-white/10 bg-black/30 hover:border-amber-300/45"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {option.icon}
                      <p className="font-brand text-xl text-metallic-gold">{option.name}</p>
                    </div>
                    <p className="text-sm text-zinc-300">{option.desc}</p>
                    <p className="text-[11px] text-zinc-500 mt-3">
                      Entitlement: <span className="text-amber-200">{ENTITLEMENT_MAP[option.tier]}</span>
                    </p>
                  </button>
                );
              })}
            </div>

            {loading ? <p className="text-sm text-zinc-400 mt-4">Processing transaction...</p> : null}
            {isPlatformNative ? (
              <p className="text-xs text-zinc-500 mt-2">Native purchase path active (RevenueCat entitlements).</p>
            ) : (
              <p className="text-xs text-zinc-500 mt-2">Web purchase path active (Stripe checkout).</p>
            )}
            {error ? <p className="text-sm text-red-300 mt-3">{error}</p> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
