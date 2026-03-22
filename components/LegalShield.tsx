"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function LegalShield({ onAccept }: { onAccept: () => void }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="glass-card p-8 rounded-[3rem] border-emerald-500/30 bg-black/80 backdrop-blur-2xl">
      <h3 className="text-emerald-500 font-black tracking-widest text-xs mb-4 uppercase">
        OATH OF SOVEREIGNTY
      </h3>
      <p className="text-[11px] text-zinc-500 leading-relaxed font-mono mb-8">
        I acknowledge that Velaryn is a mathematical engine, not a financial advisor.
        I accept full responsibility for all capital deployment and market risks.
        My data is mine alone; my losses and gains are the result of my own execution.
      </p>

      <button
        onClick={() => {
          setAccepted(true);
          onAccept();
        }}
        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 font-black text-xs tracking-[0.2em]
          ${accepted ? "bg-emerald-500 text-black" : "border border-zinc-800 text-zinc-500 hover:border-emerald-500/50"}`}
      >
        {accepted ? <Check size={16} /> : null}
        {accepted ? "OATH SIGNED" : "I ACCEPT THE RISK"}
      </button>
    </div>
  );
}
