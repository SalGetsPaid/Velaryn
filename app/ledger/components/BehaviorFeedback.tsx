import { generateWeeklySummary, type ForgeEvent } from "@/app/ledger/types";

type BehaviorFeedbackProps = {
  events: ForgeEvent[];
};

export default function BehaviorFeedback({ events }: BehaviorFeedbackProps) {
  const summary = generateWeeklySummary(events);

  return (
    <section className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
      <p className="text-sm text-emerald-200">{summary.message}</p>
    </section>
  );
}