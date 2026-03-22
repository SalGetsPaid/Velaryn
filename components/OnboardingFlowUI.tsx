"use client";

interface OnboardingFlowProps {
  onConnect: () => void;
}

export default function OnboardingFlow({ onConnect }: OnboardingFlowProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-black">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold text-amber-200">Build Wealth Automatically</h1>
        <p className="text-sm text-zinc-400 mt-3">
          Connect your accounts to get your first action in seconds.
        </p>

        <button
          onClick={onConnect}
          className="mt-8 w-full bg-amber-300 text-black px-6 py-3 rounded-xl font-bold hover:bg-amber-200 transition"
        >
          Connect Bank
        </button>

        <p className="text-xs text-zinc-500 mt-6">
          🔒 Secure • No fees • 10 seconds to setup
        </p>
      </div>
    </div>
  );
}
