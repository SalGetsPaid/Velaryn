type ProgressSignalProps = {
  total: number;
};

export default function ProgressSignal({ total }: ProgressSignalProps) {
  return (
    <section className="rounded-xl bg-white/5 p-3 text-center">
      <p className="text-xs text-zinc-400">Total Built</p>
      <p className="text-lg font-semibold text-white">${Math.round(total).toLocaleString()}</p>
    </section>
  );
}