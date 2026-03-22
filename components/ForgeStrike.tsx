"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Hammer } from "lucide-react";
import { animateHammerStrike, triggerHaptic } from "@/lib/interactionUtils";

type ForgeStrikeProps = {
  label: string;
  hint?: string;
  onStrike?: () => void | Promise<void>;
  className?: string;
  auditActionId?: string;
  disabled?: boolean;
};

export default function ForgeStrike({
  label,
  hint = "Tap the anvil to deploy capital",
  onStrike,
  className = "",
  auditActionId,
  disabled = false,
}: ForgeStrikeProps) {
  const [isStriking, setIsStriking] = useState(false);
  const [isFlashVisible, setIsFlashVisible] = useState(false);
  const hammerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const fireSparks = useCallback(async () => {
    try {
      const { default: confetti } = await import("canvas-confetti");
      const origin = { x: 0.5, y: 0.82 };
      confetti({
        particleCount: 50,
        spread: 60,
        startVelocity: 45,
        scalar: 0.9,
        ticks: 120,
        origin,
        colors: ["#FFD700", "#E6C34A", "#B8860B", "#FFF3BF"],
      });
      confetti({
        particleCount: 30,
        spread: 42,
        angle: 55,
        startVelocity: 40,
        scalar: 0.8,
        origin,
        colors: ["#FFD700", "#D4AF37", "#C3922E"],
      });
      confetti({
        particleCount: 30,
        spread: 42,
        angle: 125,
        startVelocity: 40,
        scalar: 0.8,
        origin,
        colors: ["#FFD700", "#D4AF37", "#C3922E"],
      });
    } catch (error) {
      console.error("Failed to trigger forge sparks", error);
    }
  }, []);

  const handleStrike = useCallback(async () => {
    if (isStriking || disabled) return;

    setIsStriking(true);
    setIsFlashVisible(true);
    animateHammerStrike(hammerRef.current);
    triggerHaptic(100);
    window.setTimeout(() => setIsFlashVisible(false), 100);

    try {
      const profileRaw = localStorage.getItem("velaryn_sovereign_profile");
      const profile = profileRaw ? (JSON.parse(profileRaw) as { userId?: string } | null) : null;
      const userId = profile?.userId || "velaryn-user";
      const actionId = auditActionId || `forge-strike:${label.toLowerCase().replace(/\s+/g, "-")}`;

      fetch("/api/audit/strike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, actionId }),
      }).catch((error) => {
        console.error("Strike audit request failed", error);
      });
    } catch (error) {
      console.error("Strike audit payload creation failed", error);
    }

    await Promise.all([
      fireSparks(),
      Promise.resolve(onStrike?.()),
    ]);

    window.setTimeout(() => setIsStriking(false), 320);
  }, [auditActionId, disabled, fireSparks, isStriking, label, onStrike]);

  return (
    <>
      {isFlashVisible && (
        <div className="fixed inset-0 z-[90] pointer-events-none bg-amber-50/70 mix-blend-screen" aria-hidden="true" />
      )}

      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        onClick={handleStrike}
        disabled={disabled}
        aria-label={label}
        aria-busy={isStriking}
        className={`group relative w-full cursor-pointer rounded-[1.75rem] border border-amber-300/25 bg-gradient-to-b from-zinc-900/95 to-black px-4 py-6 shadow-[0_0_60px_-20px_rgba(212,175,55,0.8)] transition-all hover:shadow-[0_0_90px_-12px_rgba(212,175,55,0.9)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.24),transparent_45%)]" />
        <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
          <motion.div
            ref={hammerRef}
            animate={prefersReducedMotion ? { rotate: 0 } : isStriking ? { rotate: [-15, 25, -10, 0] } : { rotate: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute -top-7 left-1/2 z-20 -translate-x-1/2"
          >
            <Hammer className="text-amber-300 drop-shadow-[0_10px_20px_rgb(212,175,55)]" size={92} />
          </motion.div>

          <div className="relative mt-10 h-44 w-44 rounded-3xl border border-amber-300/30 bg-gradient-to-b from-zinc-900 to-black md:h-48 md:w-48">
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.22),transparent_52%)]" />
            <motion.div
              animate={prefersReducedMotion ? { scale: 0.95 } : isStriking ? { scale: [0.95, 0.88, 0.95] } : { scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 rounded-3xl border-2 border-amber-300/40"
            />

            <div className="absolute bottom-5 left-0 right-0 px-3 text-center">
              <p className="text-[clamp(0.85rem,2.3vw,1.1rem)] font-black uppercase tracking-[0.2em] text-amber-100">{label}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-amber-300/70">{hint}</p>
            </div>
          </div>
        </div>
      </motion.button>
    </>
  );
}
