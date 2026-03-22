import { Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/localization";
import type { Currency, Locale } from "@/lib/localization";
import { ascensionTitle, getLabel, type LedgerSyncResponse } from "@/app/ledger/types";

type LedgerOverviewPanelsProps = {
  totalForged: number;
  locale: Locale;
  currency: Currency;
  forgeScore: number;
  modulesToSovereign: number;
  sync: LedgerSyncResponse | null;
  useSimplifiedMode?: boolean;
};

export default function LedgerOverviewPanels({
  totalForged,
  locale,
  currency,
  forgeScore,
  modulesToSovereign,
  sync,
  useSimplifiedMode = false,
}: LedgerOverviewPanelsProps) {
  const autoStrikeLabel = getLabel("autoStrikeRouting", useSimplifiedMode);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
      <section className="rounded-[2rem] border border-white/6 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="smallcaps-label text-amber-200/80">Archive Value</p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-white md:text-4xl">
              {formatCurrency(totalForged, locale, currency)}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">Every strike is preserved as immediate cash impact and long-duration compounding capacity.</p>
          </div>
          <div className="rounded-2xl border border-amber-300/10 bg-amber-300/10 p-3">
            <Trophy className="text-amber-300" size={26} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[0.45fr,1fr]">
          <div className="rounded-[1.5rem] border border-white/6 bg-black/20 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">Forge Score</p>
            <p className="mt-3 text-5xl font-light tracking-tight text-white">{forgeScore}</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/6 bg-black/20 p-5">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-400" style={{ width: `${forgeScore}%` }} />
            </div>
            <p className="mt-3 text-sm text-zinc-300">{ascensionTitle(forgeScore)}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-zinc-500">{modulesToSovereign} modules from sovereign tier</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/6 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-7">
        <p className="smallcaps-label text-amber-200/80">Alpha Continuity</p>
        <div className="mt-4 space-y-4">
          <div className="rounded-[1.5rem] border border-emerald-500/15 bg-emerald-500/6 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">Monthly Surplus</p>
            <p className="mt-2 text-3xl font-light tracking-tight text-white">${(sync?.netCashFlow ?? 0).toLocaleString()}/mo</p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-300/12 bg-black/18 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">{autoStrikeLabel.label}</p>
            <p className="mt-2 text-2xl font-light tracking-tight text-white">${(sync?.autoStrikeAmount ?? 0).toLocaleString()}/mo</p>
            <p className="mt-3 text-sm text-zinc-400">{sync?.suggestion ?? autoStrikeLabel.helper}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
