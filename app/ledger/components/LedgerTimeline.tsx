import { motion } from "framer-motion";
import { BriefcaseBusiness, Coins, Hammer, Link2, ShieldCheck, TrendingUp, Trophy, Zap } from "lucide-react";
import { formatLedgerAmount, type ForgeEvent } from "@/app/ledger/types";
import EmptyForgeState from "@/components/EmptyForgeState";

type LedgerTimelineProps = {
  events: ForgeEvent[];
  locale: string;
  currency: string;
};

export default function LedgerTimeline({ events, locale, currency }: LedgerTimelineProps) {
  if (events.length === 0) {
    return (
      <section className="rounded-[2rem] border border-white/6 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-7">
        <EmptyForgeState />
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/6 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-7">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="smallcaps-label text-amber-200/80">2026 Compliance Log</p>
          <h2 className="mt-2 font-brand text-3xl font-light tracking-tight text-white">Immutable Yield Archive</h2>
        </div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Permanent record of capital deployment and shield execution</p>
      </div>

      <div className="relative space-y-6">
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-zinc-800/80" />

        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative pl-16"
          >
            <div className="absolute left-0 z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-black/60 backdrop-blur-xl">
              {event.type === "STRIKE" && <Hammer className="text-amber-300" size={20} />}
              {event.type === "SHIELD" && <ShieldCheck className="text-emerald-500" size={20} />}
              {event.type === "UPGRADE" && <Trophy className="text-zinc-400" size={20} />}
              {event.type === "INCOME_BOOST" && <BriefcaseBusiness className="text-sky-400" size={20} />}
              {event.type === "TAX_SHIELD" && <ShieldCheck className="text-amber-400" size={20} />}
              {event.type === "ASSET_TRACK" && <Link2 className="text-sky-300" size={20} />}
              {event.type === "GROK_STRIKE" && <Zap className="text-amber-300" size={20} />}
              {event.type === "ON_CHAIN" && <Link2 className="text-emerald-400" size={20} />}
              {event.type === "MEME_MULTIPLIER" && <TrendingUp className="text-fuchsia-300" size={20} />}
              {event.type === "MICRO_STRIKE" && <Coins className="text-emerald-300" size={20} />}
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-black/30 p-6 transition-all hover:border-amber-300/28 hover:bg-black/40">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white">{event.title}</h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-zinc-500">{event.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-white">
                    {formatLedgerAmount(event.amount, locale, currency)}
                  </p>
                  {event.syncStatus === "pending" ? (
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Pending Sync</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4 text-[10px] font-black italic text-emerald-500">
                <TrendingUp size={12} />
                IMPACT: {event.impact}
              </div>

              {event.grokInsight ? (
                <p className="mt-3 text-[11px] text-sky-300">GROK: {event.grokInsight}</p>
              ) : null}

              {event.txHash ? (
                <p className="mt-2 font-mono text-[10px] text-zinc-500">TX: {event.txHash}</p>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
