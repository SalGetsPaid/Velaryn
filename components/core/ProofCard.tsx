export default function ProofCard({ proof }: any) {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
      <p className="text-xs text-emerald-300">Your Progress</p>

      <p className="mt-2 font-bold">${proof.total.toLocaleString()} saved</p>

      <p className="text-sm text-zinc-400">+${proof.weekly}/week</p>

      <p className="text-emerald-300 mt-2">+${proof.delta.toLocaleString()} vs baseline</p>
    </div>
  );
}
