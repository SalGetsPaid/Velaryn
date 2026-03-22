interface SovereignLedgerUIProps {
  events: Array<{
    id: string | number;
    title: string;
    date: string;
    amount: number;
  }>;
}

export default function SovereignLedgerUI({ events }: SovereignLedgerUIProps) {
  return (
    <div className="space-y-4">
      {events.map((e) => (
        <div key={e.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <p className="text-sm text-white">{e.title}</p>
          <p className="text-xs text-zinc-400">{e.date}</p>
          <p className="text-emerald-300 font-semibold">+${e.amount}</p>
        </div>
      ))}
    </div>
  );
}
