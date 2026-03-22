export default function NextActionCard({ command, onExecute }: any) {
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
      <p className="text-xs text-amber-300 uppercase">Next Action</p>

      <p className="mt-2 text-lg font-bold">{command.label}</p>

      <button
        onClick={onExecute}
        className="mt-4 w-full py-3 rounded-xl bg-amber-400 text-black font-bold"
      >
        Execute
      </button>
    </div>
  );
}
