import ForgeCard from "@/components/ForgeCard";

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
        <ForgeCard key={e.id} title="Ledger Event">
          <p className="text-sm text-white">{e.title}</p>
          <p className="text-xs text-zinc-400">{e.date}</p>
          <p className="text-emerald-300 font-semibold">+${e.amount}</p>
        </ForgeCard>
      ))}
    </div>
  );
}
