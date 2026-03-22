"use client";

import { useState } from "react";

export default function UpgradeCard() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // silently fail — user stays on page
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-4">
      <p className="text-xs text-amber-300">Upgrade</p>
      <p className="mt-2 text-sm text-white">Unlock full wealth automation + projections</p>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className="mt-3 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Upgrade to Pro"}
      </button>
    </div>
  );
}
