"use client";

import { useMemo } from "react";
import type { UserProfile } from "@/lib/wealthEngine";
import { triggerHaptic } from "@/lib/interactionUtils";

type QuickWinChallengesProps = {
  profile: UserProfile;
  onCompleteChallenge: (challengeId: string) => void;
};

const CHALLENGES = [
  { id: "watchlist-review", label: "Review one watchlist asset", reward: 20 },
  { id: "grok-quiz", label: "Run Grok 30-second prompt", reward: 20 },
  { id: "projection-check", label: "Open 30-year projection", reward: 20 },
];

export default function QuickWinChallenges({ profile, onCompleteChallenge }: QuickWinChallengesProps) {
  const pending = useMemo(() => {
    return CHALLENGES.filter((challenge) => !profile.challengeHistory.includes(challenge.id));
  }, [profile.challengeHistory]);

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4" aria-labelledby="quick-win-heading">
      <div className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">Quick Wins</p>
        <h3 id="quick-win-heading" className="mt-1 text-lg font-light text-white">Daily Micro-Challenges</h3>
      </div>

      <div className="space-y-2">
        {CHALLENGES.map((challenge) => {
          const completed = !pending.some((entry) => entry.id === challenge.id);
          return (
            <div key={challenge.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/25 px-3 py-2">
              <div>
                <p className="text-sm text-white">{challenge.label}</p>
                <p className="text-[11px] text-zinc-500">Reward: +{challenge.reward} points</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(60);
                  onCompleteChallenge(challenge.id);
                }}
                disabled={completed}
                className="rounded-lg border border-amber-300/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200 disabled:opacity-50"
              >
                {completed ? "Done" : "Complete"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
