type DailyCheckInProps = {
  onCheckIn: () => void;
  checkedIn?: boolean;
};

export default function DailyCheckIn({ onCheckIn, checkedIn = false }: DailyCheckInProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-300">Daily Action</p>
      <p className="mt-2 text-sm text-zinc-300">Complete your daily check-in to maintain momentum.</p>
      <button
        onClick={onCheckIn}
        disabled={checkedIn}
        className="mt-3 rounded-lg border border-amber-300/25 bg-amber-300/12 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {checkedIn ? "Checked In Today" : "Check In"}
      </button>
    </section>
  );
}