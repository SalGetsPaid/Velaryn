import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PathOfSovereign } from "@/components/AscensionNode";
import { getLabel } from "@/app/ledger/types";

type AscensionNode = {
  stage: string;
  status: string;
  impact: string;
};

type LedgerProjectionPanelsProps = {
  ascensionNodes: AscensionNode[];
  projectedForge: Array<{ label: string; projected: number }>;
  currentArchiveValue?: number;
  useSimplifiedMode?: boolean;
};

export default function LedgerProjectionPanels({
  ascensionNodes,
  projectedForge,
  currentArchiveValue = 0,
  useSimplifiedMode = false,
}: LedgerProjectionPanelsProps) {
  const projectionLabel = getLabel("projectedForge30Y", useSimplifiedMode);
  const projectedValue = projectedForge.at(-1)?.projected ?? currentArchiveValue;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
      <section className="rounded-[2rem] border border-white/6 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-7">
        <p className="smallcaps-label mb-4 text-amber-200/80">Path of the Sovereign</p>
        <PathOfSovereign nodes={ascensionNodes} />
      </section>

      <section className="rounded-[2rem] border border-white/6 bg-white/[0.035] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-7">
        <p className="smallcaps-label mb-4 text-amber-200/80">{projectionLabel.label}</p>
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500">Real Archive Value</p>
            <p className="mt-1 text-sm font-semibold text-white">${Math.round(currentArchiveValue).toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-amber-300/18 bg-amber-300/8 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">Projected Arc (Model)</p>
            <p className="mt-1 text-sm font-semibold text-amber-100">${Math.round(projectedValue).toLocaleString()}</p>
          </div>
        </div>
        <div className="h-52 rounded-[1.5rem] border border-white/6 bg-black/18 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectedForge}>
              <defs>
                <linearGradient id="forgeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#71717a" tickLine={false} axisLine={false} fontSize={10} />
              <YAxis stroke="#71717a" tickLine={false} axisLine={false} fontSize={10} tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} />
              <Tooltip
                contentStyle={{ background: "#09090b", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 16 }}
                formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Projected (Model)"]}
              />
              <Area type="monotone" dataKey="projected" stroke="#d4af37" strokeWidth={2} fill="url(#forgeFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
