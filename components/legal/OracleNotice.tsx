"use client";

import { useState } from "react";

export function OracleNotice({ onAccept }: { onAccept: (acceptedAt: string) => void }) {
  const [isSigned, setIsSigned] = useState(false);

  const authorizeOracle = () => {
    if (!isSigned) return;
    const acceptedAt = new Date().toISOString();
    onAccept(acceptedAt);
  };

  return (
    <div className="max-w-lg w-full bg-zinc-900 border border-amber-700/30 p-8 rounded-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-metallic-gold">AI Oracle Disclosure</h2>
      <div className="text-sm text-zinc-400 space-y-4 font-light leading-relaxed">
        <p>
          Velaryn uses <strong className="text-white">Automated Decision-Making Technology</strong> to analyze your financial data. This logic replaces manual accounting to identify wealth-accelerating &quot;Strikes.&quot;
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Purpose:</strong> To maximize capital velocity and identify wealth leaks.</li>
          <li><strong>Logic:</strong> Uses GPT-4o-mini and backtested proprietary financial models.</li>
          <li><strong>Human Review:</strong> You retain the final right to strike or ignore any AI suggestion.</li>
        </ul>
        <p className="text-xs italic">
          By continuing, you acknowledge your right to opt-out or appeal decisions to our support team.
        </p>
      </div>

      <label className="mt-6 flex items-start gap-3 rounded-xl border border-zinc-800 bg-black/20 p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={isSigned}
          onChange={(e) => setIsSigned(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-amber-400"
        />
        <span className="text-xs text-zinc-300 leading-relaxed">
          I sign and acknowledge this Oracle disclosure, and consent to automated financial profiling for strategy recommendations.
        </span>
      </label>

      <div className="mt-8 flex gap-4">
        <button
          onClick={authorizeOracle}
          disabled={!isSigned}
          className="flex-1 bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
        >
          I AUTHORIZE THE ORACLE
        </button>
      </div>
    </div>
  );
}
