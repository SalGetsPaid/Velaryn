export default function RecoveryCard({ recovery }: any) {
  if (!recovery) return null;

  return (
    <div className="p-4 rounded-xl bg-red-300/10 border border-red-300/20">
      <p className="text-xs text-red-300">Recovery</p>

      <p className="mt-2">
        Behind by ${recovery.deficit}
      </p>

      <p className="text-red-300">
        Add ${recovery.recoveryPerDay}/day
      </p>
    </div>
  );
}