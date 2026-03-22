"use client";

import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function SuccessCelebration({
  show,
  onComplete,
}: {
  show: boolean;
  onComplete: () => void;
}) {
  useEffect(() => {
    if (show) {
      // 1. Trigger Haptic (Vibration)
      if ("vibrate" in navigator) {
        navigator.vibrate([100, 30, 200]); // Short thud, pause, heavy strike
      }

      // 2. Trigger Confetti (Gilded palette)
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#ffd700", "#d4af37", "#b8860b"],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#ffd700", "#d4af37", "#b8860b"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Auto-close after 4 seconds
      setTimeout(onComplete, 4000);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-center"
          >
            {/* THE ANVIL STRIKE VISUAL */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 0.4, repeat: 1 }}
              className="text-8xl mb-6"
            >
              🔨
            </motion.div>

            <h2 className="text-4xl font-black italic text-metallic-gold tracking-tighter">
              WEALTH FORGED
            </h2>
            <p className="text-zinc-400 mt-2 font-mono uppercase tracking-[0.3em]">
              Trajectory Optimized
            </p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-1 bg-amber-300 mt-6 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
