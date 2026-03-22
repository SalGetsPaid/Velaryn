interface CardProps {
  title: string;
  value: string | number;
  highlight?: boolean;
}

export default function Card({ title, value, highlight }: CardProps) {
  return (
    <div
      className={`p-4 rounded-2xl border ${
        highlight ? "border-emerald-400 bg-emerald-400/5" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{title}</p>
      <p className={`text-lg font-semibold mt-2 ${highlight ? "text-emerald-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
