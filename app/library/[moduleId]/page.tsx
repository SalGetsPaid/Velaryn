"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const MODULE_COPY: Record<string, { title: string; desc: string; winLogic: string; architectPrompt: string }> = {
  "tax-shield": {
    title: "The Tax Shield",
    desc: "Structuring assets to minimize capital gains and estate taxes so your wealth compounds inside tax-free vehicles from day one.",
    winLogic: "Move from tax-deferred to tax-free compounding and preserve more of every gain.",
    architectPrompt: "Build me a Roth conversion and tax-shield plan using the Tax Shield module.",
  },
  velocity: {
    title: "Capital Velocity",
    desc: "Recycling idle equity into high-yield environments without increasing net portfolio risk.",
    winLogic: "Raise CAGR by moving trapped cash into productive capital loops.",
    architectPrompt: "Use Capital Velocity to deploy idle cash and raise my CAGR without increasing risk.",
  },
  jurisdiction: {
    title: "Sovereign Jurisdiction",
    desc: "Understanding multi-state and international asset protection structures that separate your identity from your equity entirely.",
    winLogic: "Build legal separation layers before wealth scales.",
    architectPrompt: "Explain Sovereign Jurisdiction as a practical protection plan for my current assets.",
  },
  "debt-alchemy": {
    title: "Debt Alchemy",
    desc: "Using low-cost leverage strategically to acquire productive assets while keeping personal liability at zero.",
    winLogic: "Turn cheap debt into cash-flowing capital instead of lifestyle drag.",
    architectPrompt: "Design a Debt Alchemy system for low-cost leverage and productive cash flow.",
  },
};

export default function StrategyModuleDetailPage() {
  const params = useParams<{ moduleId: string }>();
  const module = MODULE_COPY[params.moduleId] ?? null;

  if (!module) {
    return (
      <div className="min-h-screen bg-black text-white p-8 pb-32">
        <h1 className="brand-title text-metallic-gold text-3xl italic">Module Not Found</h1>
        <Link href="/library" className="inline-block mt-6 text-amber-300">Return to Library</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-32 max-w-3xl mx-auto">
      <Link href="/library" className="inline-block text-zinc-500 hover:text-zinc-300 mb-8">← Back to Library</Link>
      <h1 className="brand-title text-metallic-gold text-4xl italic">{module.title}</h1>
      <p className="text-zinc-400 text-base mt-5 leading-relaxed">{module.desc}</p>
      <div className="gilded-card p-6 mt-8">
        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Winning Strategy</p>
        <p className="text-sm text-zinc-300 mt-3">{module.winLogic}</p>
      </div>
      <Link
        href={`/strategist?prompt=${encodeURIComponent(module.architectPrompt)}`}
        className="inline-flex mt-8 px-5 py-3 rounded-2xl border border-amber-300/25 text-amber-300 font-black uppercase tracking-widest hover:border-amber-300/50"
      >
        Ask Architect About This
      </Link>
    </div>
  );
}