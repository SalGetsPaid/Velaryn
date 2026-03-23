import type { ReactNode } from "react";

interface ForgeCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function ForgeCard({ title, children, className = "" }: ForgeCardProps) {
  return (
    <div className={`forge-card ${className}`.trim()}>
      <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}