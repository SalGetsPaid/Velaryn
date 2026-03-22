type LedgerAccessStateProps = {
  mode: "checking" | "blocked";
  onRetry?: () => void;
};

export default function LedgerAccessState({ mode, onRetry }: LedgerAccessStateProps) {
  if (mode === "checking") {
    return (
      <div className="min-h-screen px-6 py-12 pb-32 flex items-center justify-center">
        <div className="gilded-card max-w-md w-full p-8 text-center">
          <p className="smallcaps-label">Security Layer</p>
          <h2 className="brand-title text-metallic-gold text-2xl mt-3">Verifying Ledger Access</h2>
          <p className="text-zinc-400 text-sm mt-2">Running biometric challenge before rendering sensitive financial history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 pb-32 flex items-center justify-center">
      <div className="gilded-card max-w-md w-full p-8 text-center border border-red-500/35">
        <p className="smallcaps-label text-red-400">Access Blocked</p>
        <h2 className="brand-title text-2xl mt-3">Ledger Locked</h2>
        <p className="text-zinc-400 text-sm mt-2">Biometric verification failed. Retry to reveal your sovereign archive.</p>
        <button
          onClick={onRetry}
          className="mt-6 px-5 py-3 rounded-xl border border-amber-300/35 bg-black/30 text-sm font-black hover:bg-black/55 transition-colors"
        >
          Retry Verification
        </button>
      </div>
    </div>
  );
}
