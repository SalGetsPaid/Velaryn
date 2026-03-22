"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Landmark, Percent, Scale, Sparkles, Bot } from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MANUAL_STRIKES_KEY, getStoredUserProfile, saveUserProfile } from "@/lib/wealthEngine";
import { useSovereign } from "@/components/SovereignProvider";
import { StrategyModuleCard } from "@/components/StrategyModuleCard";
import { UpgradeROICTA } from "@/components/UpgradeROICTA";
import { TOP_INCOME_STRIKES_2026 } from "@/lib/surplusBridge";

type StrategyModule = {
  id: string;
  title: string;
  icon: ReactNode;
  tag: string;
  tagColor: string;
  desc: string;
  winLogic: string;
  architectPrompt: string;
};

const strategyModules: StrategyModule[] = [
  {
    id: "tax-shield",
    title: "The Tax Shield",
    icon: <Scale size={22} className="text-amber-300" />,
    tag: "LEGACY",
    tagColor: "text-amber-400 bg-amber-400/10 border border-amber-400/20",
    desc: "Structuring assets to minimize capital gains and estate taxes so your wealth compounds inside tax-free vehicles from day one.",
    winLogic: "Move from 'Tax-Deferred' to 'Tax-Free' compounding.",
    architectPrompt: "Build me a Roth conversion and tax-shield plan using the Tax Shield module.",
  },
  {
    id: "velocity",
    title: "Capital Velocity",
    icon: <Percent size={22} className="text-emerald-500" />,
    tag: "GROWTH",
    tagColor: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
    desc: "Recycling idle equity into high-yield environments without increasing net portfolio risk. The principle every top fund uses.",
    winLogic: "Achieve 15% combined CAGR via disciplined Arbitrage cycles.",
    architectPrompt: "Use Capital Velocity to deploy idle cash and raise my CAGR without increasing risk.",
  },
  {
    id: "income-forge",
    title: "Income Forge",
    icon: <Bot size={22} className="text-amber-300" />,
    tag: "VELOCITY",
    tagColor: "text-amber-300 bg-amber-300/10 border border-amber-300/20",
    desc: "Skill-stack three AI-first income strikes to boost surplus and enter Velocity Stage within 12 months.",
    winLogic: "Compounding starts with monthly surplus. Increase income before optimizing allocations.",
    architectPrompt: "Architect, build me an Income Forge execution plan for +$850 monthly surplus.",
  },
  {
    id: "jurisdiction",
    title: "Sovereign Jurisdiction",
    icon: <Landmark size={22} className="text-zinc-300" />,
    tag: "PROTECTION",
    tagColor: "text-zinc-400 bg-zinc-400/10 border border-zinc-600/30",
    desc: "Understanding multi-state and international asset protection structures that separate your identity from your equity entirely.",
    winLogic: "Separate your identity from your equity for total legal safety.",
    architectPrompt: "Explain Sovereign Jurisdiction as a practical protection plan for my current assets.",
  },
  {
    id: "debt-alchemy",
    title: "Debt Alchemy",
    icon: <BookOpen size={22} className="text-sky-400" />,
    tag: "ADVANCED",
    tagColor: "text-sky-400 bg-sky-400/10 border border-sky-400/20",
    desc: "Using low-cost leverage strategically to acquire productive assets while keeping personal liability at zero.",
    winLogic: "Turn 0% promo debt and HELOC capital into 8%+ yield.",
    architectPrompt: "Design a Debt Alchemy system for low-cost leverage and productive cash flow.",
  },
];

function futureValue(principal: number, years: number, annualRate: number) {
  return Math.round(principal * Math.pow(1 + annualRate, years));
}

export default function WealthLibrary() {
  const router = useRouter();
  const { profile, updateProfile, completeModule: markModuleComplete } = useSovereign();
  const [taxShieldAmount, setTaxShieldAmount] = useState(10000);
  const [velocityCapital, setVelocityCapital] = useState(4200);

  const taxShieldSavings = useMemo(() => {
    const taxFree = futureValue(taxShieldAmount, 20, 0.07);
    const taxable = futureValue(taxShieldAmount, 20, 0.0525);
    return taxFree - taxable;
  }, [taxShieldAmount]);

  const velocityGain = useMemo(() => {
    const parked = futureValue(velocityCapital, 20, 0.02);
    const deployed = futureValue(velocityCapital, 20, 0.08);
    return deployed - parked;
  }, [velocityCapital]);

  const handleCompleteModule = (moduleId: string, title: string) => {
    if (profile.completedModules.includes(moduleId)) return;

    const storedProfile = getStoredUserProfile();
    const nextProfile = {
      ...storedProfile,
      completedModules: [...storedProfile.completedModules, moduleId],
      totalForged: storedProfile.totalForged + 500,
      currentNetWorth: Math.max(storedProfile.currentNetWorth, storedProfile.totalForged + 500),
    };
    saveUserProfile(nextProfile);
    markModuleComplete(moduleId);
    updateProfile(nextProfile);

    const rawEvents = localStorage.getItem(MANUAL_STRIKES_KEY);
    const existingEvents = rawEvents ? (JSON.parse(rawEvents) as Array<Record<string, unknown>>) : [];
    const completionEvent = {
      id: Date.now(),
      type: moduleId === "tax-shield" ? "TAX_SHIELD" : "UPGRADE",
      title: `Module Completed: ${title}`,
      amount: 500,
      impact: "Playbook mastery unlocked",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase(),
    };
    localStorage.setItem(MANUAL_STRIKES_KEY, JSON.stringify([completionEvent, ...existingEvents].slice(0, 20)));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-32">
      <header className="mb-12">
        <h1 className="brand-title text-metallic-gold text-4xl italic">Wealth Library</h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] mt-2">
          Institutional Knowledge for the Sovereign
        </p>
      </header>

      <div className="grid gap-6">
        {strategyModules.map((module, i) => (
          <StrategyModuleCard
            key={module.id}
            module={module}
            isPremium={module.tag === "LEGACY"}
            actions={(
              <>
                <button
                  onClick={() => router.push(`/strategist?prompt=${encodeURIComponent(module.architectPrompt)}`)}
                  className="rounded-full border border-amber-300/25 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-amber-300 hover:border-amber-300/50"
                >
                  Ask Architect
                </button>
                <button
                  onClick={() => handleCompleteModule(module.id, module.title)}
                  disabled={profile.completedModules.includes(module.id) || (i > 0 && !profile.completedModules.includes(strategyModules[i - 1].id))}
                  className="rounded-full border border-emerald-500/25 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-emerald-400 disabled:opacity-40 flex items-center gap-2"
                >
                  <CheckCircle2 size={12} />
                  {profile.completedModules.includes(module.id) ? "Completed" : "Mark Complete"}
                </button>
                {i > 0 && !profile.completedModules.includes(strategyModules[i - 1].id) && (
                  <span className="rounded-full border border-zinc-700 px-4 py-2 text-[10px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-2">
                    <Sparkles size={12} /> Unlock previous module first
                  </span>
                )}
              </>
            )}
          >
            {(module.id === "tax-shield" || module.id === "velocity" || module.id === "income-forge") && (
              <div className="mt-5 rounded-2xl border border-white/5 bg-black/25 p-4 space-y-3">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Interactive Playbook</p>

                {module.id === "tax-shield" && (
                  <>
                    <label className="text-xs text-zinc-400 block">Move amount into Roth / tax-free account</label>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="500"
                      value={taxShieldAmount}
                      onChange={(e) => setTaxShieldAmount(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-zinc-300">
                      Move <span className="text-metallic-gold font-black">${taxShieldAmount.toLocaleString()}</span> and save about <span className="text-emerald-400 font-black">${taxShieldSavings.toLocaleString()}</span> over 20 years.
                    </p>
                  </>
                )}

                {module.id === "velocity" && (
                  <>
                    <label className="text-xs text-zinc-400 block">Idle capital to redeploy</label>
                    <input
                      type="range"
                      min="1000"
                      max="25000"
                      step="100"
                      value={velocityCapital}
                      onChange={(e) => setVelocityCapital(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-zinc-300">
                      Recycle <span className="text-metallic-gold font-black">${velocityCapital.toLocaleString()}</span> from 2% cash into 8% growth and gain about <span className="text-emerald-400 font-black">${velocityGain.toLocaleString()}</span> extra over 20 years.
                    </p>
                  </>
                )}

                {module.id === "income-forge" && (
                  <div className="space-y-3">
                    {TOP_INCOME_STRIKES_2026.map((strike) => (
                      <div key={strike.id} className="rounded-xl border border-zinc-700/60 bg-black/40 p-3">
                        <p className="text-xs font-black text-metallic-gold">{strike.title}</p>
                        <p className="text-[11px] text-zinc-400 mt-1">{strike.description}</p>
                        <p className="text-[11px] text-emerald-400 font-black mt-2">Target: {strike.target}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </StrategyModuleCard>
        ))}
      </div>

      <div className="mt-12">
        <UpgradeROICTA />
      </div>
    </div>
  );
}
