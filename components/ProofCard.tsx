export default function ProofCard({ proof }: any) {
  return (
    <div className="p-4 rounded-xl bg-emerald-300/10 border border-emerald-300/20">
      <p className="text-xs text-emerald-300">Progress</p>

      <p className="mt-2 font-bold">
        ${proof.total.toLocaleString()} saved
      </p>

      <p className="text-sm text-zinc-400">
        ${proof.projected.toLocaleString()} projected
      </p>

      <p className="text-emerald-300">
        +${proof.delta.toLocaleString()}
      </p>
    </div>
  );
}