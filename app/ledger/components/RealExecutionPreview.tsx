import type { Command, LinkedAccount } from "@/app/ledger/types";

type RealExecutionPreviewProps = {
  command: Command;
  account: LinkedAccount | null;
};

export default function RealExecutionPreview({ command, account }: RealExecutionPreviewProps) {
  if (!account) return null;

  return (
    <section className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
      <p className="text-xs text-amber-300">Upcoming Execution</p>
      <p className="mt-1 text-sm text-white">
        {account.name}: -${Math.round(command.amount).toLocaleString()}
      </p>
    </section>
  );
}