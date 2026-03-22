"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

export interface MonteCarloPoint {
  month: string;
  low: number;
  high: number;
}

export function MonteCarloChart({ data }: { data: MonteCarloPoint[] }) {
  return (
    <div className="h-48 w-full opacity-70">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="high" stroke="#10b981" fillOpacity={1} fill="url(#colorWealth)" strokeWidth={0.8} />
          <Area type="monotone" dataKey="low" stroke="#064e3b" fillOpacity={0} strokeWidth={0.8} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
