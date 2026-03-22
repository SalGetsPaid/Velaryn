import { formatCurrency, type Currency, type Locale } from "@/lib/localization";

type ImpactFlashProps = {
  impact: number;
  locale: Locale;
  currency: Currency;
};

export default function ImpactFlash({ impact, locale, currency }: ImpactFlashProps) {
  return (
    <section className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Impact Confirmed</p>
      <p className="mt-1 text-lg font-semibold text-white">+ {formatCurrency(impact, locale, currency)} projected momentum</p>
    </section>
  );
}