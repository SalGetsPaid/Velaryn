"use client";

import type { UserProfile } from "@/lib/wealthEngine";

type SovereignAvatarCardProps = {
  profile: UserProfile;
};

function avatarClass(base: UserProfile["avatar"]["base"]) {
  if (base === "legacy-builder") return "from-amber-300/30 via-amber-200/10 to-emerald-400/30";
  if (base === "knight") return "from-sky-400/30 via-zinc-300/10 to-amber-300/20";
  return "from-orange-400/25 via-zinc-300/10 to-zinc-500/20";
}

export default function SovereignAvatarCard({ profile }: SovereignAvatarCardProps) {
  const avatar = profile.avatar;

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4" aria-labelledby="avatar-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">Forge Persona</p>
          <h3 id="avatar-heading" className="mt-1 text-lg font-light text-white">Sovereign Avatar</h3>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Lvl {avatar.level}</p>
      </div>

      <div className={`mt-4 rounded-2xl border border-white/8 bg-gradient-to-br p-4 ${avatarClass(avatar.base)}`}>
        <p className="text-sm text-white">{avatar.base.replace("-", " ")}</p>
        <p className="mt-1 text-xs text-zinc-200">Skin: {avatar.cosmetics.skin}</p>
        <p className="text-xs text-zinc-200">Tool: {avatar.cosmetics.tool}</p>
        <p className="text-xs text-zinc-200">Background: {avatar.cosmetics.background}</p>
      </div>

      <p className="mt-3 text-xs text-zinc-500">Forge Points: {profile.forgePoints.toLocaleString()} • Streak: {profile.streakCount} days</p>
    </section>
  );
}
