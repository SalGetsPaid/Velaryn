import type { CoachInsight } from "@/app/ledger/types";

type CoachCardProps = {
  insight: CoachInsight;
};

export default function CoachCard({ insight }: CoachCardProps) {
  const color =
    insight.priority === "high"
      ? "border-red-400/30 bg-red-400/10"
      : insight.priority === "medium"
        ? "border-yellow-400/30 bg-yellow-400/10"
        : "border-blue-400/30 bg-blue-400/10";

  return (
    <section className={`rounded-xl border p-4 ${color}`}>
      <p className="text-xs uppercase text-zinc-400">AI Coach</p>
      <p className="mt-1 text-sm text-white">{insight.message}</p>
    </section>
  );
}