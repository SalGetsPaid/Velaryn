"use client";

import Image from "next/image";
import CommandHero from "@/components/CommandHero";
import ForgeCard from "@/components/ForgeCard";
import ProofCard from "@/components/ProofCard";
import RecoveryCard from "@/components/RecoveryCard";
import VelarynHeader from "@/components/VelarynHeader";

interface SovereignHomeProps {
  action?: {
    title?: string;
    explanation?: string;
    impactYearly?: number;
    urgencyDaily?: number;
  };
  command?: {
    label?: string;
    amount?: number;
  };
  proof?: {
    total: number;
    projected: number;
    delta: number;
  };
  recovery?: {
    deficit: number;
    recoveryPerDay: number;
  } | null;
  onExecute: () => void;
  coachMessages?: string[];
  socialCount?: number;
  streak?: number;
}

export default function SovereignHome({
  action,
  command,
  proof,
  recovery,
  onExecute,
  coachMessages,
  socialCount,
  streak,
}: SovereignHomeProps) {
  const heroCommand = {
    title: recovery
      ? `Recover $${recovery.recoveryPerDay} Today`
      : action?.title || command?.label || "Recover $50 Today",
    description: recovery
      ? `Reallocate $${recovery.recoveryPerDay}/day for 3 days to restore your trajectory.`
      : action?.explanation || "2 taps. 30 seconds.",
    impact: `$${Math.max(proof?.projected ?? 18240, 18240).toLocaleString()} (30Y projection)`,
  };

  const progressPercent = proof ? Math.max(12, Math.min(100, Math.round((proof.delta / 50000) * 100))) : 12;

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.08),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(212,175,55,0.06),transparent_40%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-8 px-6 pb-32 pt-24">
        <VelarynHeader />

        <div className="mx-auto flex justify-center">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20">
            <Image
              src="/gold-v-logo.svg"
              alt="Velaryn crest"
              fill
              className="object-contain drop-shadow-[0_0_24px_rgba(232,197,71,0.35)]"
              priority
            />
          </div>
        </div>

        <CommandHero command={heroCommand} progressPercent={progressPercent} onExecute={onExecute} />

        {proof ? <ProofCard proof={proof} /> : null}

        {recovery ? <RecoveryCard recovery={recovery} /> : null}

        <div className="velaryn-divider" />

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <ForgeCard title="Advisory Feed" className="rounded-[2rem] p-6">
            <div className="space-y-4">
              {coachMessages && coachMessages.length > 0 ? (
                coachMessages.map((msg, i) => (
                  <div key={i} className="rounded-2xl bg-white/[0.02] px-5 py-4 backdrop-blur-xl">
                    <p className="text-sm leading-6 text-white">{msg}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white/[0.02] px-5 py-4 backdrop-blur-xl">
                  <p className="text-sm leading-6 text-white">
                    Stay consistent. You are building a capital identity, not just checking a balance.
                  </p>
                </div>
              )}
            </div>
          </ForgeCard>

          <div className="grid gap-5">
            <ForgeCard title="Market Confidence" className="rounded-[2rem] p-6">
              <p className="text-3xl font-[Playfair_Display] text-white">
                {socialCount?.toLocaleString() || "1,204"}
              </p>
              <p className="mt-2 text-sm text-emerald-300">principals acted today</p>
            </ForgeCard>

            <ForgeCard title="Discipline" className="rounded-[2rem] p-6">
              <p className="text-3xl font-[Playfair_Display] text-white">{streak || 5} days</p>
              <p className="mt-2 text-sm text-zinc-400">consistent execution streak</p>
            </ForgeCard>
          </div>
        </section>
      </div>
    </div>
  );
}
