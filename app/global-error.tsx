"use client";

import { useEffect } from "react";
import { appendForgeLogEntry } from "@/lib/forgeLog";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    appendForgeLogEntry({
      category: "runtime",
      level: "error",
      message: `App router global error: ${error.message}`,
    }).catch(() => undefined);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-6 py-16">
          <section className="gilded-card max-w-lg p-8 text-center" aria-live="assertive">
            <p className="smallcaps-label text-red-400">Forge Interrupted</p>
            <h1 className="mt-4 font-brand text-3xl text-white">The command surface encountered a fault.</h1>
            <p className="mt-3 text-sm text-zinc-400">Your state remains local. Retry when ready.</p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 rounded-xl border border-amber-300/35 bg-black/30 px-5 py-3 text-sm font-black transition-colors hover:bg-black/55"
            >
              Retry Forge
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
