"use client";

import { useId, useState } from "react";
import html2canvas from "html2canvas";
import type { ForgeEvent } from "@/app/ledger/types";

type ForgeMomentShareProps = {
  event: ForgeEvent | null;
  projectedValue: number;
  referralCode: string;
};

export default function ForgeMomentShare({ event, projectedValue, referralCode }: ForgeMomentShareProps) {
  const [status, setStatus] = useState("");
  const nodeId = useId().replace(/:/g, "_");

  const shareMoment = async () => {
    if (!event) return;
    const node = document.getElementById(nodeId);
    if (!node) return;

    const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) {
      setStatus("Unable to generate moment card.");
      return;
    }

    const file = new File([blob], "forge-moment.png", { type: "image/png" });
    const invite = `${window.location.origin}/?ref=${referralCode}`;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "Velaryn Forge Moment",
        text: `I forged ${event.title}. Join my squad: ${invite}`,
        files: [file],
      });
      setStatus("Forge Moment shared.");
      return;
    }

    await navigator.clipboard.writeText(invite);
    setStatus("Invite link copied. Forge moment image ready.");
  };

  if (!event) return null;

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4" aria-labelledby="forge-moment-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">Forge Moments</p>
          <h3 id="forge-moment-heading" className="mt-1 text-lg font-light text-white">Short-Form Share Card</h3>
        </div>
        <button
          type="button"
          onClick={shareMoment}
          className="rounded-lg border border-amber-300/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200"
        >
          Share Moment
        </button>
      </div>

      <div id={nodeId} className="rounded-xl border border-white/8 bg-black/25 p-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Velaryn</p>
        <p className="mt-2 text-xl text-white">{event.title}</p>
        <p className="mt-1 text-xs text-zinc-300">{event.grokInsight ?? event.impact}</p>
        <p className="mt-3 text-sm text-amber-200">Projected Arc: ${Math.round(projectedValue).toLocaleString()}</p>
        <p className="mt-1 font-mono text-[10px] text-zinc-500">{event.txHash ? `TX ${event.txHash}` : "TX pending"}</p>
      </div>

      <p className="mt-2 text-xs text-zinc-500" aria-live="polite">{status}</p>
    </section>
  );
}
