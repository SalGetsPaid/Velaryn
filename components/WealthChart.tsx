'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrajectoryPoint {
  month: string;
  current: number;
  optimized: number;
}

interface WealthChartProps {
  data?: TrajectoryPoint[];
}

type DotProps = {
  cx?: number;
  cy?: number;
  index?: number;
  value?: number;
};

export default function WealthChart({ data = [] }: WealthChartProps) {
  const lastIndex = data.length - 1;

  const currentEndDot = (props: DotProps) => {
    const { cx = 0, cy = 0, index, value } = props;
    if (index !== lastIndex) return <g key={`cd-${index}`} />;
    return (
      <g key={`cd-${index}`}>
        <circle cx={cx} cy={cy} r={4} fill="#ef4444" />
        <text x={cx} y={cy + 18} fill="#ef4444" fontSize={11} fontWeight="bold" textAnchor="middle">
          ${((value ?? 0) / 1000).toFixed(0)}K
        </text>
      </g>
    );
  };

  const optimizedEndDot = (props: DotProps) => {
    const { cx = 0, cy = 0, index, value } = props;
    if (index !== lastIndex) return <g key={`od-${index}`} />;
    return (
      <g key={`od-${index}`}>
        <circle cx={cx} cy={cy} r={6} fill="#E6C36A" filter="url(#goldGlow)" />
        <text x={cx} y={cy - 12} fill="#E6C36A" fontSize={12} fontWeight="bold" textAnchor="middle">
          ${((value ?? 0) / 1000).toFixed(0)}K
        </text>
      </g>
    );
  };

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 55, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#E6C36A" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#E6C36A" stopOpacity={0} />
            </linearGradient>
            <filter id="goldGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <XAxis
            dataKey="month"
            stroke="#3f3f46"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: '#71717a' }}
          />
          <YAxis
            stroke="#3f3f46"
            tickLine={false}
            axisLine={false}
            width={74}
            fontSize={11}
            tick={{ fill: '#71717a' }}
            tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(9,9,11,0.96)',
              border: '1px solid rgba(230,195,106,0.25)',
              borderRadius: '14px',
              color: '#fafafa',
              backdropFilter: 'blur(16px)',
              fontSize: 13,
            }}
            formatter={(value, name) => [`$${Number(value ?? 0).toLocaleString()}`, name]}
          />
          <Legend wrapperStyle={{ color: '#71717a', paddingTop: 14, fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="current"
            stroke="#ef4444"
            strokeDasharray="5 4"
            strokeWidth={2.5}
            fillOpacity={0}
            dot={currentEndDot}
            name="Current Path"
          />
          <Area
            type="monotone"
            dataKey="optimized"
            stroke="#E6C36A"
            strokeWidth={3.5}
            fill="url(#goldGradient)"
            dot={optimizedEndDot}
            activeDot={{ r: 6, fill: '#E6C36A', filter: 'url(#goldGlow)' }}
            name="Velaryn Optimized"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


