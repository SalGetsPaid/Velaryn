import type { ReactNode } from "react";

interface ForgeCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function ForgeCard({ title, children, className = "" }: ForgeCardProps) {
  return (
    <div className={`forge-card shadow-[0_0_40px_rgba(255,215,0,0.08)] transition hover:scale-[1.01] ${className}`.trim()}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}