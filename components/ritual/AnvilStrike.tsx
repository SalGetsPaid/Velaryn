'use client';

import { motion, useAnimation } from "framer-motion";
import { useState } from "react";

export default function AnvilStrike({ onStrike }: { onStrike: () => void | Promise<void> }) {
  const [isStriking, setIsStriking] = useState(false);
  const controls = useAnimation();

  const handleStrike = async () => {
    if (isStriking) return;

    setIsStriking(true);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([10, 30, 100]);
    }

    await controls.start({
      scale: [1, 0.8, 1.2, 1],
      transition: { duration: 0.3, ease: "easeOut" },
    });

    await Promise.resolve(onStrike());
    setIsStriking(false);
  };

  return (
    <motion.button
      animate={controls}
      onClick={handleStrike}
      className="relative group px-8 py-4 bg-zinc-950 border border-amber-600 rounded-xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors" />
      <span className="relative z-10 text-amber-400 font-black tracking-tight uppercase text-sm">
        {isStriking ? "FORGING..." : "STRIKE THE ANVIL"}
      </span>
      {isStriking ? (
        <motion.div
          className="absolute inset-0 bg-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
        />
      ) : null}
    </motion.button>
  );
}
