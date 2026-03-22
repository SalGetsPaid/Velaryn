"use client";

import { motion } from "framer-motion";

type GlyphType = "hammer" | "shield";

const glyphs: Record<GlyphType, React.ReactNode> = {
  hammer: (
    <svg viewBox="0 0 100 100" className="w-10 h-10" aria-hidden="true">
      <defs>
        <linearGradient id="gold-hammer" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <path d="M15 26 L45 10 L57 31 L27 47 Z" fill="url(#gold-hammer)" />
      <path d="M53 30 L89 66 L76 79 L40 43 Z" fill="url(#gold-hammer)" />
      <path d="M67 59 L82 74 L67 89 L52 74 Z" fill="url(#gold-hammer)" opacity="0.85" />
      <path d="M20 50 L46 24" stroke="#332300" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 100 100" className="w-10 h-10" aria-hidden="true">
      <defs>
        <linearGradient id="gold-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <path d="M50 10 L83 22 V45 C83 66 68 83 50 91 C32 83 17 66 17 45 V22 Z" fill="url(#gold-shield)" />
      <path d="M50 23 L70 30 V45 C70 59 61 71 50 77 C39 71 30 59 30 45 V30 Z" fill="#1b1504" opacity="0.4" />
      <path d="M50 30 V68 M38 44 H62" stroke="#f6dc7a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
};

export function GildedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="gilded-card p-6">
      <p className="smallcaps-label">{label}</p>
      <p className="text-2xl font-black mt-2 text-metallic-gold font-brand">{value}</p>
    </div>
  );
}

export function GildedActionCard({
  title,
  desc,
  iconType,
  action,
  onClick,
}: {
  title: string;
  desc: string;
  iconType: GlyphType;
  action: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="gilded-card p-8 group cursor-pointer flex items-center gap-6"
      onClick={onClick}
    >
      <div className="w-20 h-20 flex items-center justify-center bg-black/50 border border-amber-300/15 rounded-full shadow-inner">
        {glyphs[iconType]}
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="smallcaps-label group-hover:text-amber-300 transition-colors">
          {title}
        </h3>
        <p className="text-zinc-300 text-sm leading-relaxed">{desc}</p>
        <button className="text-[10px] font-black uppercase tracking-widest text-amber-300 group-hover:translate-x-2 transition-transform">
          {action} →
        </button>
      </div>
    </motion.div>
  );
}
