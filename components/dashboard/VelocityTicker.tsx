"use client";

import { useEffect, useMemo, useState } from "react";

type VelocityTickerProps = {
  annualGrowth: number;
};

export default function VelocityTicker({ annualGrowth }: VelocityTickerProps) {
  const [currentWealth, setCurrentWealth] = useState(0);

  const msRate = useMemo(
    () => Math.max(0, annualGrowth) / (365 * 24 * 60 * 60 * 1000),
    [annualGrowth]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentWealth((prev) => prev + msRate * 50);
    }, 50);

    return () => window.clearInterval(timer);
  }, [msRate]);

  return (
    <div className="text-center py-4">
      <p className="text-[10px] text-amber-300/50 uppercase tracking-[0.4em] mb-1">
        Real-Time Forge Yield
      </p>
      <div className="text-2xl font-mono text-white tracking-tighter">
        +${currentWealth.toFixed(6)}
      </div>
    </div>
  );
}
