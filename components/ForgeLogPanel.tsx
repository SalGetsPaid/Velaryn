"use client";

import { useEffect, useState } from "react";
import type { ForgeLogEntry } from "@/lib/forgeLog";
import { readForgeLogEntries } from "@/lib/forgeLog";

export default function ForgeLogPanel() {
  const [entries, setEntries] = useState<ForgeLogEntry[]>([]);

  useEffect(() => {
    readForgeLogEntries().then(setEntries).catch(() => undefined);
  }, []);

  return (
    <section className="gilded-card p-6" aria-labelledby="forge-log-heading">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400">Local Diagnostics</p>
        <h3 id="forge-log-heading" className="mt-2 text-xl font-light text-white">Forge Log</h3>
        <p className="mt-2 text-sm text-zinc-500">Encrypted, local-only runtime and sync notes. Raw stack traces stay hidden.</p>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-zinc-500">No local issues recorded.</p>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">{entry.category}</p>
                <p className="text-[10px] text-zinc-500">{new Date(entry.timestamp).toLocaleString()}</p>
              </div>
              <p className="mt-2 text-sm text-white">{entry.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
