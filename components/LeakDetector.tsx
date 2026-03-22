"use client";

import { AlertCircle } from "lucide-react";
import { formatCurrency, Locale, Currency, i18n } from "@/lib/localization";

export function LeakDetector({
  idleCash,
  locale,
  currency,
  onDeploy,
}: {
  idleCash: number;
  locale: Locale;
  currency: Currency;
  onDeploy?: () => void;
}) {
  const monthlyLoss = (idleCash * 0.045) / 12;

  return (
    <div className="glass-card p-6 rounded-[2.5rem] border-red-500/20 bg-red-500/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-500/20 rounded-full text-red-500">
          <AlertCircle size={18} />
        </div>
        <h3 className="text-[10px] font-black tracking-widest uppercase text-red-500">{i18n[locale].leak}</h3>
      </div>

      <p className="text-sm text-zinc-300 mb-4">
        You are losing <span className="font-bold text-white">{formatCurrency(monthlyLoss, locale, currency)}</span> per month in potential interest by holding idle cash in a low-yield account.
      </p>

      <button
        className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-colors"
        onClick={onDeploy}
      >
        {i18n[locale].deploy}
      </button>
    </div>
  );
}
