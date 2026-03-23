import { ReactNode } from "react";
import ForgeCard from "@/components/ForgeCard";

interface MiniCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

export default function MiniCard({ icon, label, value }: MiniCardProps) {
  return (
    <ForgeCard title={label} className="p-3">
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm text-white font-semibold mt-2">{value}</p>
    </ForgeCard>
  );
}
