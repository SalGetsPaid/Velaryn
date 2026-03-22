"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface PaymentButtonProps {
  tier?: "obsidian" | "diamond";
  label?: string;
  className?: string;
}

export default function PaymentButton({
  tier = "obsidian",
  label = "Unlock Obsidian Tier",
  className = "",
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create checkout session on the server
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!res.ok) throw new Error("Checkout session creation failed");

      const { id: sessionId } = await res.json();

      // 2. Redirect to Stripe Checkout via URL
      // Modern Stripe uses the checkout session ID directly
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setError(msg);
      console.error("Payment error:", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full disabled:opacity-50 rounded-[1.75rem] border border-amber-300/30 bg-black/30 hover:bg-black/45 px-4 py-4 transition-all shadow-[0_0_28px_rgba(212,175,55,0.28)] ${className}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-full h-20 bg-center bg-contain bg-no-repeat"
            style={{ backgroundImage: "url('/anvil-upgrade.svg')" }}
            aria-hidden="true"
          />
          <div className="text-center">
            <p className="smallcaps-label text-amber-200">{loading ? "Processing..." : label}</p>
            <p className="text-[11px] text-zinc-300 mt-1">Tap the anvil to purchase your upgrade</p>
          </div>
        </div>
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2 bg-red-950/50 border border-red-500/40 rounded-lg text-red-300 text-xs"
        >
          {error}
        </motion.div>
      )}
    </>
  );
}
