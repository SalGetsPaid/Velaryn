"use client";

type ToggleMemeMultiplierProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export default function ToggleMemeMultiplier({ enabled, onChange }: ToggleMemeMultiplierProps) {
  return (
    <div className="rounded-[1.5rem] border border-amber-300/18 bg-amber-400/5 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">DOGE VELOCITY MULTIPLIER</p>
          <p className="mt-2 text-sm text-zinc-300">Apply 1.8x projection boost to speculative velocity track.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          className={`h-7 w-14 rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-zinc-700"}`}
          aria-pressed={enabled}
          aria-label="Toggle Doge velocity multiplier"
        >
          <span className={`block h-6 w-6 rounded-full bg-white transition-transform ${enabled ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>
    </div>
  );
}
