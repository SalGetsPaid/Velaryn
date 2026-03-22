"use client";

import { useId, useState } from "react";
import html2canvas from "html2canvas";
import type { ForgeEvent } from "@/app/ledger/types";
import { appendForgeLogEntry } from "@/lib/forgeLog";

type LegacyProofCardProps = {
  event: ForgeEvent | null;
  projectedValue: number;
};

function buildCurvePath(projectedValue: number) {
  const points = [0.12, 0.18, 0.29, 0.46, 0.7, 1].map((ratio, index) => {
    const x = 12 + index * 52;
    const y = 92 - ratio * 62;
    return `${index === 0 ? "M" : "L"}${x} ${y}`;
  });
  return `${points.join(" ")} L 272 96 L 12 96 Z`;
}

export default function LegacyProofCard({ event, projectedValue }: LegacyProofCardProps) {
  const [status, setStatus] = useState("");
  const proofId = useId().replace(/:/g, "_");

  const generateCard = async () => {
    const target = document.getElementById(proofId);
    if (!target || !event) return;

    try {
      const canvas = await html2canvas(target, { backgroundColor: null, scale: 2 });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) {
        throw new Error("Unable to create image blob");
      }

      const file = new File([blob], "legacy-proof.png", { type: "image/png" });
      const shareUrl = window.location.href;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Velaryn Legacy Proof",
          text: "Proof of compounding progress from Velaryn.",
          files: [file],
          url: shareUrl,
        });
        setStatus("Legacy Proof shared.");
        return;
      }

      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = "legacy-proof.png";
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
      setStatus("Legacy Proof downloaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Share failed";
      setStatus(message);
      await appendForgeLogEntry({
        category: "share",
        level: "warning",
        message: `Legacy Proof generation failed: ${message}`,
      });
    }
  };

  if (!event) return null;

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4" aria-labelledby="legacy-proof-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">Legacy Proof</p>
          <h3 id="legacy-proof-heading" className="mt-2 text-lg font-light text-white">Shareable compounding receipt</h3>
        </div>
        <button
          type="button"
          onClick={generateCard}
          className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200"
          aria-label="Generate and share legacy proof card"
        >
          Share Card
        </button>
      </div>

      <div id={proofId} className="rounded-[1.5rem] border border-amber-300/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.35))] p-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">Velaryn Legacy Proof</p>
        <h4 className="mt-3 text-2xl font-light text-white">{event.title}</h4>
        <p className="mt-2 text-sm text-zinc-300">{event.grokInsight ?? event.impact}</p>
        <div className="mt-5 rounded-2xl border border-white/8 bg-black/25 p-4">
          <svg viewBox="0 0 284 104" className="h-28 w-full" role="img" aria-label="Projected curve snapshot for shared proof card">
            <path d={buildCurvePath(projectedValue)} fill="rgba(212,175,55,0.18)" stroke="rgba(212,175,55,0.9)" strokeWidth="2" />
          </svg>
          <p className="mt-3 text-sm text-white">30Y projection: ${Math.round(projectedValue).toLocaleString()}</p>
          <p className="mt-1 font-mono text-[10px] text-zinc-500">{event.txHash ? `TX ${event.txHash}` : "TX pending sync"}</p>
        </div>
        <p className="mt-4 text-[11px] text-zinc-500">Referral: velaryn.app/invite?proof={event.id}</p>
      </div>

      <p className="mt-3 text-sm text-zinc-500" aria-live="polite">{status}</p>
    </section>
  );
}
