"use client";

import { useEffect, useMemo, useState } from "react";
import { useCommandCenter } from "@/hooks/useCommandCenter";
import { getDefaultUserProfile } from "@/lib/wealthEngine";
import { usePlaidData } from "@/hooks/usePlaidData";
import { useSocialProof } from "@/hooks/useSocialProof";
import { getNextAction } from "@/lib/nextActionEngine";
import type { ForgeEvent } from "@/app/ledger/types";

// Core UI
import NextActionCard from "@/components/NextActionCard";
import ProofCard from "@/components/ProofCard";
import RecoveryCard from "@/components/RecoveryCard";
import HomeCommandCenter from "@/components/HomeCommandCenter";

// Your original system
import AlphaYieldDashboard from "@/components/apex/AlphaYieldDashboard";
import DailyForgeBuild from "@/components/DailyForgeBuild";
import ForgeStrike from "@/components/ForgeStrike";
import AlphaPulse from "@/components/AlphaPulse";
import SovereignAvatarCard from "@/components/social/SovereignAvatarCard";
import LedgerTimeline from "@/app/ledger/components/LedgerTimeline";
import ToggleMemeMultiplier from "@/components/ToggleMemeMultiplier";
import { useAICoach } from "@/hooks/useAICoach";
import AICoachCard from "@/components/AICoachCard";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeCard from "@/components/UpgradeCard";
import ForgeCard from "@/components/ForgeCard";
import { triggerHaptic } from "@/lib/triggerHaptic";

const DEFAULT_PROFILE = getDefaultUserProfile();

export default function SovereignLedger() {
  const [decision, setDecision] = useState<any>(null);
  const [events, setEvents] = useState<Array<{ amount: number; date: string }>>([]);
  const [memeMultiplier, setMemeMultiplier] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  const plaid = usePlaidData();

  // ✅ Feed Plaid data into decision engine; fall back to GET on first load
  useEffect(() => {
    if (!plaid) {
      fetch("/api/decisions")
        .then((res) => res.json())
        .then((data) => setDecision(data.decision));
      return;
    }

    fetch("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cash: plaid.accounts?.[1]?.balance ?? 0,
        income: 6000,
        categoryMap: Object.fromEntries(
          (plaid.transactions ?? []).map((t: { category: string; amount: number }) => [t.category, t.amount]),
        ),
      }),
    })
      .then((res) => res.json())
      .then((data) => setDecision(data.decision));
  }, [plaid]);

  // ✅ Derived metrics (safe) - Calculate early for use in getNextAction
  const monthToDate = useMemo(() => events.reduce((sum, e) => sum + e.amount, 0), [events]);

  // ✅ Stable command system
  const { command, recovery, proof } = useCommandCenter(events, decision);
  const coachMessage = useAICoach(command, proof);
  const { isPro } = useSubscription();
  
  // ✅ Home command center data
  const count = useSocialProof();
  const action = getNextAction({
    cash: monthToDate,
    spending: 500,
    income: 6000,
  });

  const executeReal = async (effectiveAmount: number) => {
    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command: {
          ...command,
          amount: effectiveAmount,
        },
      }),
    });

    const data = await res.json();
    console.log("Execution:", data);
  };

  // ✅ Execute action
  const handleExecute = () => {
    triggerHaptic(200);

    const boostedAmount = Math.round(command.amount * multiplier * (memeMultiplier ? 1.5 : 1));
    setEvents((prev) => [{ amount: boostedAmount, date: new Date().toISOString() }, ...prev]);
    executeReal(boostedAmount).catch((error) => {
      console.error("Execute API failed:", error);
    });
  };

  // Map simple events → ForgeEvent shape for LedgerTimeline
  const forgeEvents = useMemo<ForgeEvent[]>(
    () =>
      events.map((e, i) => ({
        id: i,
        type: memeMultiplier ? "MEME_MULTIPLIER" : "STRIKE",
        title: `Command Executed · $${e.amount}`,
        amount: e.amount,
        impact: `+$${e.amount} deployed`,
        date: new Date(e.date).toLocaleDateString("en-US"),
        syncStatus: "synced" as const,
      })),
    [events, memeMultiplier],
  );

  return (
    <div className="min-h-screen px-4 py-6 pb-32 text-white space-y-8">

      {/* 🔥 HEADER */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.32em] text-amber-300">Premium Ledger</p>
        <h1 className="font-[Playfair_Display] text-3xl text-amber-200 tracking-wide md:text-4xl">
          Velaryn Sovereign Ledger
        </h1>
        <p className="text-zinc-400">Wealth Command System</p>
      </div>

      {/* 🔥 ALPHA DASHBOARD */}
      <AlphaYieldDashboard
        monthToDateValue={monthToDate}
        monthOverMonthDelta={12}
        chartData={[]}
        sources={[]}
        auditHash={`hash-${monthToDate}`}
      />

      {/* 🔥 CORE LOOP */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 rounded-2xl border border-amber-300/30 bg-gradient-to-b from-white/[0.08] to-black/[0.4] p-4 backdrop-blur-xl gold-glow">
          <NextActionCard command={command} onExecute={handleExecute} />
        </div>
        <ForgeCard title="Proof Layer">
          <ProofCard proof={proof} />
        </ForgeCard>
        <ForgeCard title="Recovery Path">
          <RecoveryCard recovery={recovery} />
        </ForgeCard>
      </div>

      {/* 🔥 HOME COMMAND CENTER (10-Second Engine) */}
      <HomeCommandCenter
        action={action}
        messages={coachMessage ? [coachMessage] : []}
        count={count}
        streak={DEFAULT_PROFILE.streakCount}
        onExecute={handleExecute}
      />

      {/* 🔥 INTERACTION LAYER */}
      <div className="grid gap-4 md:grid-cols-2">
        <DailyForgeBuild
          referralCode="VEL-ALPHA"
          onStreakBonusChange={(val: number) => setMultiplier(val)}
        />
        <ToggleMemeMultiplier enabled={memeMultiplier} onChange={setMemeMultiplier} />
      </div>

      {/* 🔥 AI COACH */}
      <AICoachCard message={coachMessage} />

      {/* 🔥 UPGRADE GATE */}
      {!isPro && <UpgradeCard />}

      {/* 🔥 AI INSIGHT */}
      <ForgeCard title="AI Insight">
        <p className="mt-2 text-sm text-zinc-300">
          {decision?.explanation || "Analyzing your financial behavior..."}
        </p>
      </ForgeCard>

      {/* 🔥 PULSE */}
      <ForgeCard title="Pulse Feed">
        <AlphaPulse />
      </ForgeCard>

      {/* 🔥 AVATAR / IDENTITY */}
      <SovereignAvatarCard profile={DEFAULT_PROFILE} />

      {/* 🔥 TIMELINE */}
      <LedgerTimeline events={forgeEvents} locale="en-US" currency="USD" />

      {/* 🔥 STRIKE BUTTON (CORE ACTION) */}
      <div className="fixed bottom-20 left-0 right-0 px-6">
        <ForgeStrike
          label={`EXECUTE $${command.amount}`}
          hint="Your next wealth move"
          onStrike={handleExecute}
        />
      </div>
    </div>
  );
}
