type StreakCardProps = {
  streak: number;
};

export default function StreakCard({ streak }: StreakCardProps) {
  return (
    <section className="rounded-xl border border-orange-400/20 bg-orange-500/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-200">Streak</p>
      <p className="mt-2 text-2xl font-bold text-white">{Math.max(0, streak)} day{streak === 1 ? "" : "s"}</p>
      <p className="mt-1 text-xs text-zinc-300">Consistency compounds trust and decision quality.</p>
    </section>
  );
}