"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserProfile } from "@/lib/wealthEngine";
import {
  broadcastDuelProgress,
  buildDuelId,
  createDuelInviteLink,
  joinDuelChannel,
  type DuelProgressPayload,
} from "@/lib/socialDuel";

type ForgeDuelPanelProps = {
  profile: UserProfile;
};

export default function ForgeDuelPanel({ profile }: ForgeDuelPanelProps) {
  const [duelId, setDuelId] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [peerProgress, setPeerProgress] = useState<DuelProgressPayload | null>(null);
  const [status, setStatus] = useState("Start a private duel with a friend.");
  const [channel, setChannel] = useState<Awaited<ReturnType<typeof joinDuelChannel>>>(null);

  const localPayload = useMemo<DuelProgressPayload>(() => {
    return {
      duelId,
      alias: `Sovereign-${profile.referralCode.slice(-4)}`,
      streakCount: profile.streakCount,
      challengeCompletions: profile.challengeHistory.length,
      targetStreak: 7,
    };
  }, [duelId, profile.challengeHistory.length, profile.referralCode, profile.streakCount]);

  const startDuel = () => {
    const next = buildDuelId();
    setDuelId(next);
    setInviteLink(createDuelInviteLink(next));
    setStatus("Duel room created. Share invite with your squad.");
  };

  const joinDuel = async () => {
    if (!duelId) return;
    const nextChannel = await joinDuelChannel(duelId, (payload) => {
      setPeerProgress(payload);
      setStatus(`${payload.alias} updated progress to ${payload.streakCount}/7 days.`);
    });
    setChannel(nextChannel);
  };

  const syncProgress = async () => {
    await broadcastDuelProgress(channel, localPayload);
    setStatus("Progress broadcast to duel room.");
  };

  const shareInvite = async () => {
    if (!inviteLink) return;
    if (navigator.share) {
      await navigator.share({
        title: "Velaryn Forge Duel",
        text: "Join my Forge Duel and hit a 7-day streak with me.",
        url: inviteLink,
      });
      return;
    }
    await navigator.clipboard.writeText(inviteLink);
    setStatus("Invite link copied.");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("duel") ?? "";
    if (fromUrl) {
      setDuelId(fromUrl);
      setInviteLink(createDuelInviteLink(fromUrl));
      setStatus("Duel invite detected. Tap Join Duel.");
    }
  }, []);

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4" aria-labelledby="duel-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">Forge Duels</p>
          <h3 id="duel-heading" className="mt-1 text-lg font-light text-white">Co-Op Streak Challenge</h3>
        </div>
        <p className="text-xs text-zinc-500">Target: 7 days</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={startDuel} className="rounded-lg border border-amber-300/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
          New Duel
        </button>
        <button type="button" onClick={joinDuel} disabled={!duelId} className="rounded-lg border border-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-200 disabled:opacity-50">
          Join Duel
        </button>
        <button type="button" onClick={syncProgress} disabled={!channel} className="rounded-lg border border-emerald-400/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 disabled:opacity-50">
          Sync Progress
        </button>
        <button type="button" onClick={shareInvite} disabled={!inviteLink} className="rounded-lg border border-sky-400/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-300 disabled:opacity-50">
          Invite
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-white/8 bg-black/25 p-3 text-sm text-zinc-300">
        <p>{status}</p>
        {peerProgress ? (
          <p className="mt-2 text-xs text-zinc-400">Peer {peerProgress.alias}: {peerProgress.streakCount}/7 streak days • {peerProgress.challengeCompletions} quick wins</p>
        ) : null}
      </div>
    </section>
  );
}
