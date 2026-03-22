import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export type DuelProgressPayload = {
  duelId: string;
  alias: string;
  streakCount: number;
  challengeCompletions: number;
  targetStreak: number;
};

export function createDuelInviteLink(duelId: string) {
  if (typeof window === "undefined") return duelId;
  const url = new URL(window.location.href);
  url.searchParams.set("duel", duelId);
  return url.toString();
}

export function buildDuelId() {
  return `duel-${Math.random().toString(36).slice(2, 10)}`;
}

export async function joinDuelChannel(
  duelId: string,
  onProgress: (payload: DuelProgressPayload) => void
) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return null;
  }

  const channel = supabase
    .channel(`velaryn-duel-${duelId}`)
    .on("broadcast", { event: "progress" }, ({ payload }) => {
      onProgress(payload as DuelProgressPayload);
    });

  await channel.subscribe();
  return channel;
}

export async function broadcastDuelProgress(
  channel: {
    send: (payload: {
      type: "broadcast";
      event: "progress";
      payload: DuelProgressPayload;
    }) => Promise<unknown>;
  } | null,
  payload: DuelProgressPayload
) {
  if (!channel) return;

  await channel.send({
    type: "broadcast",
    event: "progress",
    payload,
  });
}
