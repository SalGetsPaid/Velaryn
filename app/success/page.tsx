"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import SuccessCelebration from "@/components/SuccessCelebration";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setSessionData(data);
          setShowCelebration(true);
        }
      } catch (err) {
        console.error("Verification failed:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black text-white">
      <SuccessCelebration
        show={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
        }}
      />

      {!loading && (
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full space-y-8 text-center"
          >
            {sessionData ? (
              <>
                <div>
                  <h1 className="text-4xl md:text-5xl brand-title italic text-metallic-gold mb-2">
                    WELCOME TO OBSIDIAN
                  </h1>
                  <p className="text-zinc-400 text-sm">
                    Your premium wealth coaching is now unlocked
                  </p>
                </div>

                <div className="bg-zinc-900/50 border border-amber-300/20 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-amber-300/20 flex items-center justify-center text-amber-300">
                      ⚡
                    </div>
                    <div className="flex-1">
                      <p className="smallcaps-label">
                        Advanced Insights
                      </p>
                      <p className="text-sm font-bold">Real-time Market Analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-amber-300/20 flex items-center justify-center text-amber-300">
                      ⚡
                    </div>
                    <div className="flex-1">
                      <p className="smallcaps-label">
                        AI Coaching
                      </p>
                      <p className="text-sm font-bold">24/7 Wealth Velocity Coach</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-amber-300/20 flex items-center justify-center text-amber-300">
                      ⚡
                    </div>
                    <div className="flex-1">
                      <p className="smallcaps-label">
                        Auto-Pilot Mode
                      </p>
                      <p className="text-sm font-bold">Automatic Wealth Optimization</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/")}
                  className="w-full flex items-center justify-center gap-2 bg-amber-300 hover:bg-amber-200 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                >
                  Return to Dashboard
                  <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-zinc-500">Verifying payment...</p>
                <div className="w-2 h-2 bg-amber-300 rounded-full mx-auto animate-pulse" />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SuccessContent />
    </Suspense>
  );
}
