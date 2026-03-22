"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import AnvilForge from "@/components/AnvilForge";
import UpgradeForge from "@/components/UpgradeForge";
import { UpgradeROICTA } from "@/components/UpgradeROICTA";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PricingPage() {
  const router = useRouter();
  const [forgeOpen, setForgeOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"obsidian" | "diamond">("obsidian");

  const tiers = [
    {
      name: "Obsidian",
      price: "$19",
      period: "one-time",
      description: "Advanced wealth coaching essentials",
      features: [
        "Real-time market analysis",
        "AI wealth velocity coach",
        "Advanced decision insights",
        "Custom trajectory modeling",
        "Priority support",
      ],
      cta: "Unlock Obsidian",
      action: "obsidian",
      highlighted: true,
    },
    {
      name: "Diamond",
      price: "$49",
      period: "one-time",
      description: "Premium lifetime access + automation",
      features: [
        "Everything in Obsidian",
        "Auto-pilot wealth optimization",
        "AI wealth strategy sessions",
        "Advanced tax optimization",
        "Lifetime updates",
        "White-glove onboarding",
      ],
      cta: "Unlock Diamond",
      action: "diamond",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-zinc-800/50 px-4 py-4"
      >
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white mb-3">
          ← Back
        </button>
        <h1 className="text-3xl md:text-4xl brand-title italic text-metallic-gold">UNLOCK VELARYN PREMIUM</h1>
        <p className="smallcaps-label mt-1">
          Elevate your wealth coaching with premium tiers
        </p>
      </motion.div>

      {/* PRICING CARDS */}
      <div className="px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {tiers.map((tier, idx) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-[2rem] p-8 space-y-6 relative ${
              tier.highlighted
                ? "bg-amber-400/10 border-2 border-amber-300/50"
                : "bg-zinc-900/50 border border-zinc-800/50"
            }`}
          >
            {tier.highlighted && (
              <div className="absolute top-0 left-0 right-0 flex justify-center">
                <div className="bg-amber-300 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase">
                  Most Popular
                </div>
              </div>
            )}

            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {tier.name === "Diamond" && <Crown size={20} className="text-amber-300" />}
                <h3 className="text-2xl font-black">{tier.name}</h3>
              </div>
              <p className="text-zinc-500 text-sm">{tier.description}</p>
            </div>

            <div>
              <p className="text-4xl font-black text-amber-300">{tier.price}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">{tier.period}</p>
            </div>

            <div className="space-y-3">
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check size={16} className="text-amber-300 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <AnvilForge
              label={tier.cta}
              onStrike={() => {
                setSelectedTier(tier.action as "obsidian" | "diamond");
                setForgeOpen(true);
              }}
            />
          </motion.div>
        ))}
      </div>

      <UpgradeForge
        open={forgeOpen}
        onClose={() => setForgeOpen(false)}
        defaultTier={selectedTier}
      />

      <div className="px-4 max-w-5xl mx-auto">
        <UpgradeROICTA />
      </div>

      {/* FAQ */}
      <div className="px-4 py-12 max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl md:text-3xl font-brand font-bold text-center mb-8 text-metallic-gold">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {[
            {
              q: "Do I need to pay a monthly subscription?",
              a: "No. Both tiers are one-time payments. Pay once, use forever.",
            },
            {
              q: "Can I upgrade from Obsidian to Diamond?",
              a: "Yes. The difference is credited toward your Diamond tier.",
            },
            {
              q: "Is my data encrypted?",
              a: "Yes. All Plaid tokens are encrypted server-side and never shared with third parties.",
            },
            {
              q: "What about refunds?",
              a: "30-day money-back guarantee. No questions asked.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="bg-zinc-900/30 p-4 rounded-xl space-y-2"
            >
              <p className="font-bold text-sm">{item.q}</p>
              <p className="text-xs text-zinc-400">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
