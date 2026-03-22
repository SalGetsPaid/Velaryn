"use client";

import type { UserProfile } from "@/lib/wealthEngine";

type SquadBoostCardProps = {
  profile: UserProfile;
  onMockReferral: () => void;
};

export default function SquadBoostCard({ profile, onMockReferral }: SquadBoostCardProps) {
  const remaining = Math.max(0, 3 - profile.referredFriends);
  const boostActive = Boolean(profile.squadBoostUntil && new Date(profile.squadBoostUntil).getTime() > Date.now());

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4" aria-labelledby="squad-heading">
      <div className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">Referral Squad</p>
        <h3 id="squad-heading" className="mt-1 text-lg font-light text-white">Squad Boost Multiplier</h3>
      </div>

      <p className="text-sm text-zinc-300">
        {boostActive
          ? "Squad boost active: +15% projection visual uplift for your crew."
          : remaining > 0
          ? `Refer ${remaining} more friend${remaining === 1 ? "" : "s"} to unlock +15% squad boost.`
          : "Referral goal complete. Activate your next squad loop."}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onMockReferral}
          className="rounded-lg border border-amber-300/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200"
        >
          Register Referral
        </button>
        <p className="text-xs text-zinc-500">Code: {profile.referralCode}</p>
      </div>
    </section>
  );
}
