export default function RecoveryCard({ recovery }: any) {
  if (!recovery) return null;

  return (
    <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
      <p className="text-xs text-red-300">Recovery Mode</p>

      <p className="mt-2">Behind by ${recovery.deficit}</p>

      <p className="text-red-300">Add ${recovery.recoveryPerDay}/day</p>
    </div>
  );
}
