import ForgeCard from "@/components/ForgeCard";

interface CardProps {
  title: string;
  value: string | number;
  highlight?: boolean;
}

export default function Card({ title, value, highlight }: CardProps) {
  return (
    <ForgeCard title={title} className={highlight ? "border-emerald-400/50 bg-emerald-400/5 gold-glow" : ""}>
      <p className={`mt-1 text-lg font-semibold ${highlight ? "text-emerald-300" : "text-white"}`}>
        {value}
      </p>
    </ForgeCard>
  );
}
