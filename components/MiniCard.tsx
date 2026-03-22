import { ReactNode } from "react";

interface MiniCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export default function MiniCard({ icon, label, value }: MiniCardProps) {
  return (
    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm text-white font-semibold mt-2">{value}</p>
    </div>
  );
}
