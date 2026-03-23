"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ForgeCard from "@/components/ForgeCard";

export default function UpgradeCard() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail — user stays on page
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgeCard title="Upgrade" className="rounded-[2rem] velaryn-focus-layer p-6">
      <p className="font-[Playfair_Display] text-2xl text-white">Unlock full wealth automation</p>
      <p className="mt-3 text-sm leading-6 text-zinc-400">Premium projections, guided execution, and deeper command intelligence.</p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={handleUpgrade}
        disabled={loading}
        className="mt-6 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:shadow-[0_0_30px_rgba(232,197,71,0.2)] disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Upgrade to Pro"}
      </motion.button>
    </ForgeCard>
  );
}
