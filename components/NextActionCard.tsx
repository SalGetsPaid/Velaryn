export function NextActionCard({ action, command, onExecute }: any) {
  const nextAction = action ?? command;
  if (!nextAction) return null;

  return (
    <div className="p-4 rounded-xl bg-amber-300/10 border border-amber-300/20">
      <p className="text-xs text-amber-300">Next Action</p>

      <p className="mt-2 text-lg font-bold">{nextAction.label}</p>

      <button
        onClick={() => {
          if (action) {
            onExecute?.(nextAction);
            return;
          }
          onExecute?.();
        }}
        className="mt-4 w-full bg-amber-400 text-black py-2 rounded-lg"
      >
        Execute
      </button>
    </div>
  );
}

export default NextActionCard;