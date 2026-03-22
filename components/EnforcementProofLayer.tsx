"use client";

import { useMemo } from "react";
import type { ForgeEvent } from "@/app/ledger/types";

type Profile = {
  monthlySurplus: number;
};

type EnforcementProofLayerProps = {
  events: ForgeEvent[];
  profile: Profile;
};

export function calculateProof(events: ForgeEvent[], profile: Profile) {
  const positiveEvents = events.filter((event) => Number.isFinite(event.amount) && event.amount > 0);
  const totalSaved = positiveEvents.reduce((sum, event) => sum + Math.max(event.amount, 0), 0);

  const uniqueDays = new Set(
    positiveEvents
      .map((event) => {
        const parsed = new Date(event.date);
        return Number.isNaN(parsed.getTime()) ? event.date : parsed.toISOString().slice(0, 10);
      })
      .filter(Boolean)
  );

  const days = Math.max(uniqueDays.size, 1);
  const avgDaily = totalSaved / days;

  const projected30Y = Math.round(avgDaily * 365 * 30);
  const baseline30Y = Math.round((profile.monthlySurplus || 0) * 12 * 30 * 0.4);
  const delta = projected30Y - baseline30Y;

  return {
    totalSaved,
    avgDaily,
    projected30Y,
    baseline30Y,
    delta,
  };
}

export function getRecoveryPlan(events: ForgeEvent[], targetDaily: number) {
  const recentPositiveEvents = events
    .filter((event) => Number.isFinite(event.amount) && event.amount > 0)
    .slice(0, 3);

  const recent = recentPositiveEvents.reduce((sum, event) => sum + Math.max(event.amount, 0), 0);
  const expected = targetDaily * 3;
  const deficit = Math.max(0, expected - recent);

  if (deficit <= 0) {
    return null;
  }

  return {
    deficit,
    recoveryPerDay: Math.ceil(deficit / 3),
  };
}

export function ProofCard({ events, profile }: EnforcementProofLayerProps) {
  const proof = useMemo(() => calculateProof(events, profile), [events, profile]);

  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Your Progress</p>

      <p className="mt-2 text-lg font-bold text-white">
        ${proof.totalSaved.toLocaleString()} saved
      </p>

      <p className="text-sm text-zinc-400">
        On track for ${proof.projected30Y.toLocaleString()}
      </p>

      <p className="mt-2 text-sm text-emerald-300">
        +${proof.delta.toLocaleString()} vs baseline
      </p>
    </div>
  );
}

export function RecoveryCard({ events }: Pick<EnforcementProofLayerProps, "events">) {
  const recovery = useMemo(() => getRecoveryPlan(events, 20), [events]);

  if (!recovery) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-red-300">Recovery Mode</p>

      <p className="mt-2 text-sm text-white">
        You are behind by ${recovery.deficit.toLocaleString()}
      </p>

      <p className="text-sm text-red-300">
        Add ${recovery.recoveryPerDay.toLocaleString()}/day for 3 days
      </p>
    </div>
  );
}

export default function EnforcementProofLayer({ events, profile }: EnforcementProofLayerProps) {
  return (
    <div className="space-y-4">
      <ProofCard events={events} profile={profile} />
      <RecoveryCard events={events} />
    </div>
  );
}