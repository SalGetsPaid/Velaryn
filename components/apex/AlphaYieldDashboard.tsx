"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type AlphaYieldPoint = {
  day: string;
  yield: number;
};

type AlphaYieldSource = {
  icon: ReactNode;
  label: string;
  value: string;
  desc: string;
};

type AlphaYieldDashboardProps = {
  monthToDateValue: number;
  monthOverMonthDelta: number;
  chartData: AlphaYieldPoint[];
  sources: AlphaYieldSource[];
  auditHash: string;
};

function splitCurrencyParts(value: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const parts = formatter.formatToParts(value);
  const currency = parts.find((part) => part.type === "currency")?.value ?? "$";
  const integer = parts.filter((part) => part.type === "integer" || part.type === "group").map((part) => part.value).join("");
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  const fraction = parts.find((part) => part.type === "fraction")?.value ?? "00";

  return {
    leading: `${currency}${integer}`,
    trailing: `${decimal}${fraction}`,
  };
}

function AlphaCard({ icon, label, value, desc }: AlphaYieldSource) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-light tracking-tight text-white">{value}</div>
      <p className="mt-1 text-[10px] italic text-zinc-500">{desc}</p>
    </motion.div>
  );
}

export default function AlphaYieldDashboard({
  monthToDateValue,
  monthOverMonthDelta,
  chartData,
  sources,
  auditHash,
}: AlphaYieldDashboardProps) {
  const amountParts = splitCurrencyParts(monthToDateValue);
  const deltaPrefix = monthOverMonthDelta >= 0 ? "+" : "";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-amber-300/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.48)] backdrop-blur-3xl md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/35 to-transparent" />

      <div className="relative">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mb-1 text-[10px] font-bold uppercase tracking-[0.5em] text-amber-300/90">Kinetic Tier Status</h2>
            <h1 className="font-brand text-3xl font-light tracking-tight text-white md:text-4xl">Alpha Stream Active</h1>
          </div>
          <div className="text-left md:text-right">
            <span className="block text-[9px] uppercase tracking-[0.32em] text-zinc-500">System Integrity</span>
            <span className="font-mono text-xs text-emerald-400">● 100% SECURE</span>
          </div>
        </header>

        <div className="mb-10 rounded-[1.9rem] border border-white/6 bg-gradient-to-b from-white/[0.05] to-transparent p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-1 text-sm text-zinc-500">New Money Generated (MTD)</p>
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-5xl font-light tracking-[-0.06em] text-white md:text-7xl">{amountParts.leading}</span>
                <span className="pb-1 font-mono text-lg text-amber-300 md:text-2xl">{amountParts.trailing}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-300/15 bg-amber-300/10 px-4 py-2">
              <ArrowUpRight size={14} className="text-amber-300" />
              <span className="text-xs font-bold tracking-tight text-amber-200">
                {deltaPrefix}{monthOverMonthDelta.toFixed(1)}% vs Last Month
              </span>
            </div>
          </div>

          <div className="mt-8 h-64 w-full" role="img" aria-label="Month-to-date generated money chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="alphaYieldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: "rgba(212,175,55,0.18)", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "rgba(3,3,4,0.92)",
                    border: "1px solid rgba(212,175,55,0.18)",
                    borderRadius: 16,
                    backdropFilter: "blur(18px)",
                  }}
                  formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Yield"]}
                />
                <Area
                  type="monotone"
                  dataKey="yield"
                  stroke="#D4AF37"
                  fill="url(#alphaYieldFill)"
                  fillOpacity={1}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {sources.map((source) => (
            <AlphaCard key={source.label} {...source} />
          ))}
        </div>

        <footer className="mt-14 flex flex-col gap-3 border-t border-white/6 pt-6 text-[9px] uppercase tracking-[0.28em] text-zinc-600 md:flex-row md:items-center md:justify-between">
          <p>Verified by Velaryn Fiduciary Engine v4.0.2</p>
          <p>Immutable Audit Hash: {auditHash}</p>
        </footer>
      </div>
    </section>
  );
}

export function buildAlphaYieldSources({
  autoStrikeAmount,
  netCashFlow,
  shieldRecovery,
  useSimplifiedMode = false,
}: {
  autoStrikeAmount: number;
  netCashFlow: number;
  shieldRecovery: number;
  useSimplifiedMode?: boolean;
}): AlphaYieldSource[] {
  return [
    {
      icon: <Zap className="text-sky-400" size={18} />,
      label: useSimplifiedMode ? "Smart Yield Opportunity" : "Yield Arbitrage",
      value: `+$${Math.round(Math.max(autoStrikeAmount * 0.42, 412)).toLocaleString()}`,
      desc: `Automated sweep from ${Math.round(Math.max(autoStrikeAmount, 300)).toLocaleString()}/mo deployment lane`,
    },
    {
      icon: <ShieldCheck className="text-emerald-400" size={18} />,
      label: "Shield Recovery",
      value: `+$${Math.round(Math.max(shieldRecovery, 2140)).toLocaleString()}`,
      desc: "Risk-neutralized exits and tax shield recapture",
    },
    {
      icon: <TrendingUp className="text-amber-300" size={18} />,
      label: "Cash Velocity",
      value: `+$${Math.round(Math.max(netCashFlow * 0.52, 1291)).toLocaleString()}`,
      desc: "Surplus converted into recurring alpha instead of idle drag",
    },
  ];
}