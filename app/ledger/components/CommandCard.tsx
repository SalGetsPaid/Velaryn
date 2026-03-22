import { formatCurrency, type Currency, type Locale } from "@/lib/localization";
import type { LoopCommand } from "@/app/ledger/types";

type CommandCardProps = {
  command: LoopCommand;
  onExecute: () => void;
  locale: Locale;
  currency: Currency;
};

const priorityTone: Record<LoopCommand["priority"], string> = {
  high: "border-red-400/30 bg-red-500/10",
  medium: "border-yellow-400/30 bg-yellow-500/10",
  low: "border-blue-400/30 bg-blue-500/10",
};

export default function CommandCard({ command, onExecute, locale, currency }: CommandCardProps) {
  return (
    <section className={`rounded-xl border p-4 ${priorityTone[command.priority]}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Command</p>
      <p className="mt-2 text-lg font-semibold text-white">{command.title}</p>
      <p className="mt-1 text-sm text-zinc-300">{command.reason}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Execute Amount</p>
          <p className="text-xl font-bold text-white">{formatCurrency(command.amount, locale, currency)}</p>
        </div>
        <button
          onClick={onExecute}
          className="rounded-lg border border-amber-300/30 bg-amber-300/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-amber-200"
        >
          Execute
        </button>
      </div>
    </section>
  );
}