"use client";

type SimpleEvent = {
  amount: number;
  date: string;
};

type LedgerTimelineProps = {
  events: SimpleEvent[];
  locale?: string;
  currency?: string;
};

export default function LedgerTimeline({ events, locale = "en-US", currency = "USD" }: LedgerTimelineProps) {
  if (events.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500">No executions yet — run your first command</p>
      </section>
    );
  }

  const fmt = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 });

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="mb-4 text-xs uppercase tracking-widest text-zinc-400">Execution Timeline</p>
      <div className="relative space-y-3">
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-zinc-800" />
        {events.map((event, i) => (
          <div key={i} className="relative flex items-start gap-4 pl-8">
            <div className="absolute left-0 mt-1 h-[22px] w-[22px] rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 rounded-xl border border-white/8 bg-black/25 px-4 py-3 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                {new Date(event.date).toLocaleString(locale)}
              </p>
              <p className="font-mono text-sm font-bold text-emerald-400">+{fmt.format(event.amount)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
