export function StreakCard({ streak }: any) {
  return (
    <div className="p-4 border rounded-xl bg-white/5">
      <p className="text-xs text-zinc-400">Streak</p>
      <p className="text-2xl">{streak} days</p>
    </div>
  );
}
