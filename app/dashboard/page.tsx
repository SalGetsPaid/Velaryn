"use client";

import { useMemo, useState } from "react";
import { generateStrategy, type StrategyDossier } from "@/app/actions/oracle";
import ForgeLoader from "@/components/ForgeLoader";
import TheFoundationSeal from "@/components/ritual/TheFoundationSeal";
import { useSovereign } from "@/components/SovereignProvider";

function AlertItem({ title, impact }: { title: string; impact: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black/40 px-3 py-2">
      <span className="text-sm text-zinc-300">{title}</span>
      <span className="text-xs font-black text-emerald-400">{impact}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { profile } = useSovereign();
  const [command, setCommand] = useState("How do I reach $1M in 5 years?");
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<StrategyDossier | null>(null);

  const headlineWorth = useMemo(() => {
    const value = profile?.currentNetWorth ?? 1240492;
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [profile]);

  const handleOracleStrike = async () => {
    if (!command.trim()) return;

    setLoading(true);
    try {
      const result = await generateStrategy(command, profile);
      setDossier(result);
    } catch (error) {
      console.error("Oracle strike failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-6 bg-black min-h-screen text-white pb-32">
      <div className="col-span-12 md:col-span-8 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">The Ledger</h2>
        <div className="text-5xl font-mono text-amber-400">${headlineWorth}</div>
        <p className="text-zinc-600 mt-2">+12.4% Velocity this month</p>
      </div>

      <div className="col-span-12 md:col-span-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">High-Velocity Alerts</h2>
        <div className="space-y-3">
          <AlertItem title="Tax Shield Opportunity" impact="+$4.2k" />
          <AlertItem title="Equity Strike" impact="+22%" />
        </div>
      </div>

      <div className="col-span-12 bg-zinc-900 border border-amber-900/50 p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20 font-black text-8xl">V</div>
        <h1 className="text-2xl font-bold mb-6">Ask the Oracle</h1>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="How do I reach $1M in 5 years?"
          className="w-full bg-black border border-zinc-800 p-4 rounded-lg focus:border-amber-500 outline-none min-h-28"
        />

        <div className="mt-5">
          <TheFoundationSeal onExecute={handleOracleStrike} />
        </div>

        {loading ? (
          <div className="mt-4">
            <ForgeLoader />
            <p className="text-center text-xs text-zinc-500">Forging dossier...</p>
          </div>
        ) : null}

        {dossier ? (
          <div className="mt-6 rounded-xl border border-zinc-700 bg-black/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-amber-300">{dossier.title}</h3>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">{dossier.tier}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Win certainty: {dossier.win_certainty}</p>

            <ul className="mt-4 space-y-2">
              {dossier.steps.map((step, index) => (
                <li key={`${step}-${index}`} className="text-sm text-zinc-300">
                  {index + 1}. {step}
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="rounded-lg border border-zinc-800 p-3 text-center">
                <p className="text-[10px] text-zinc-600 uppercase">12m</p>
                <p className="text-sm font-black text-white">${dossier.projected_net_worth.m12.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 p-3 text-center">
                <p className="text-[10px] text-zinc-600 uppercase">36m</p>
                <p className="text-sm font-black text-white">${dossier.projected_net_worth.m36.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 p-3 text-center">
                <p className="text-[10px] text-zinc-600 uppercase">120m</p>
                <p className="text-sm font-black text-white">${dossier.projected_net_worth.m120.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
