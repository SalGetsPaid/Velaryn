import { formatCurrency } from "@/lib/localization";
import type { Currency, Locale } from "@/lib/localization";

type TrustValueProps = {
  real: number;
  projected: number;
  locale: Locale;
  currency: Currency;
};

export default function TrustValue({ real, projected, locale, currency }: TrustValueProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs text-zinc-400">Real Net Worth</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(real, locale, currency)}</p>
      </div>

      <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-4">
        <p className="text-xs text-blue-300">Projected (30Y)</p>
        <p className="text-2xl font-bold text-blue-200">{formatCurrency(projected, locale, currency)}</p>
      </div>
    </div>
  );
}