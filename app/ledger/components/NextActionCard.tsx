import type { NextBestAction } from "@/app/ledger/types";

type NextActionCardProps = {
  action: NextBestAction;
};

const priorityStyles: Record<NextBestAction["priority"], string> = {
  high: "border-rose-300/25 bg-rose-500/10 text-rose-200",
  medium: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  low: "border-emerald-300/25 bg-emerald-500/10 text-emerald-200",
};

export default function NextActionCard({ action }: NextActionCardProps) {
  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_16px_55px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <p className="smallcaps-label text-zinc-300">Next Best Action</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">{action.title}</h2>
      <p className="mt-2 text-sm text-zinc-400">{action.detail}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${priorityStyles[action.priority]}`}>
          {action.priority} priority
        </span>
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
          {action.cta}
        </span>
      </div>
    </section>
  );
}