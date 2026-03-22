"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, X } from "lucide-react";

export default function ForgeActionDrawer({
  isOpen,
  onClose,
  data,
  onExecute,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onExecute?: (institutionName: string) => void;
}) {
  const hasAcceptedOath = typeof window !== "undefined" && localStorage.getItem("velaryn_oath_accepted") === "true";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-zinc-900 w-full max-w-lg rounded-t-[3rem] border-t border-amber-300/30 p-8 shadow-[0_-20px_50px_rgba(212,175,55,0.15)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HANDLE */}
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8" />

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter text-amber-300">RECOVERY MISSION</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Target: ${data.cash.toLocaleString()} Idle Capital</p>
            </div>
            <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
              <X size={18} />
            </button>
          </div>

          {/* THE STEPS */}
          <div className="space-y-4 mb-8">
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border border-amber-300/10">
              <div className="w-12 h-12 bg-amber-300/10 rounded-xl flex items-center justify-center text-amber-300">
                <ShieldCheck size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-500 uppercase font-black">Step 1: Security</p>
                <p className="text-sm font-bold">Reserve $5,000 for Emergency</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border border-amber-300/20 bg-amber-300/5">
              <div className="w-12 h-12 bg-amber-300 rounded-xl flex items-center justify-center text-black">
                <Zap size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-zinc-900 uppercase font-black opacity-60">Step 2: Deployment</p>
                <p className="text-sm font-bold text-white">Transfer ${(data.cash - 5000).toLocaleString()} to Forge HYSA</p>
              </div>
              <ArrowRight className="text-amber-300" />
            </div>
          </div>

          {/* IMPACT PREVIEW */}
          <div className="bg-amber-300/10 p-4 rounded-2xl mb-8 border border-amber-300/20 text-center">
            <p className="text-amber-300 text-[10px] font-black uppercase tracking-widest">Instant Impact</p>
            <p className="text-xl font-mono">+${data.impactYearly.toLocaleString()} / YEAR</p>
          </div>

          <button 
            className={`w-full font-black py-5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${hasAcceptedOath ? "bg-amber-300 hover:bg-amber-200 text-black shadow-[0_0_30px_rgba(212,175,55,0.4)]" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
            onClick={() => {
              if (!hasAcceptedOath) {
                alert("Sign the Oath of Sovereignty in Shield Layer before executing Forge actions.");
                return;
              }

              if (onExecute) {
                onExecute(data.institutionName || "Chase");
              } else {
                alert("Forge Initiated: Open your Bank App to finalize transfer.");
              }
            }}
          >
            <Zap size={20} fill="black" />
            EXECUTE RECOVERY
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
