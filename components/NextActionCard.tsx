export default function NextActionCard({ command, onExecute }: any) {
  return (
    <div className="p-4 rounded-xl bg-amber-300/10 border border-amber-300/20">
      <p className="text-xs text-amber-300">Next Action</p>

      <p className="mt-2 text-lg font-bold">{command.label}</p>

      <button
        onClick={onExecute}
        className="mt-4 w-full bg-amber-400 text-black py-2 rounded-lg"
      >
        Execute
      </button>
    </div>
  );
}