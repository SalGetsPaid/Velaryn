"use client";

import { useState } from "react";
import { Cloud, RefreshCcw, Users } from "lucide-react";
import { syncEncryptedVault } from "@/lib/cloudVault";
import { appendForgeLogEntry } from "@/lib/forgeLog";
import type { UserProfile } from "@/lib/wealthEngine";

type EncryptedSyncPanelProps = {
  profile: UserProfile;
};

export default function EncryptedSyncPanel({ profile }: EncryptedSyncPanelProps) {
  const [status, setStatus] = useState("Sync is user-initiated and encrypted before upload.");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (typeof window === "undefined") return;

    const secret = localStorage.getItem("velaryn_vault_key_material") || "velaryn-cloud-bootstrap";
    setIsSyncing(true);
    try {
      await syncEncryptedVault(
        {
          profile,
          familySharingEnabled: false,
          syncedAt: new Date().toISOString(),
        },
        secret,
        null
      );
      setStatus("Encrypted vault synced successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      setStatus(message);
      await appendForgeLogEntry({
        category: "cloud",
        level: "warning",
        message: `Encrypted sync panel failed: ${message}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <section className="gilded-card p-6" aria-labelledby="encrypted-sync-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">Cloud Vault</p>
          <h3 id="encrypted-sync-heading" className="mt-2 text-xl font-light text-white">Encrypted Multi-Device Sync</h3>
          <p className="mt-2 text-sm text-zinc-500">
            Device sync is opt-in, encrypted client-side with AES-GCM, and suitable for family vault expansion once your Supabase tables are configured.
          </p>
        </div>
        <Cloud className="text-sky-400" size={20} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
          <div className="flex items-center gap-2 text-sm text-white">
            <RefreshCcw size={16} className="text-amber-300" />
            Differential sync on reconnect
          </div>
          <p className="mt-2 text-xs text-zinc-500">Realtime subscription hooks are ready to merge encrypted vault updates after login.</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
          <div className="flex items-center gap-2 text-sm text-white">
            <Users size={16} className="text-emerald-400" />
            Family sharing scaffold
          </div>
          <p className="mt-2 text-xs text-zinc-500">Family vaults remain explicit, revocable, and encrypted before they leave the device.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400" aria-live="polite">{status}</p>
        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200 disabled:opacity-60"
        >
          {isSyncing ? "Syncing" : "Sync Encrypted Vault"}
        </button>
      </div>
    </section>
  );
}
