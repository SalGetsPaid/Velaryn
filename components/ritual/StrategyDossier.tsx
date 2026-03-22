"use client";

export function StrategyDossier({ logicSource }: { logicSource: string }) {
  return (
    <div className="border-t border-zinc-800 mt-4 pt-2">
      <button
        className="text-[10px] text-zinc-600 hover:text-amber-300 underline"
        onClick={() => alert(`Logic Base: ${logicSource}`)}
      >
        View Oracle Logic Source
      </button>
    </div>
  );
}
