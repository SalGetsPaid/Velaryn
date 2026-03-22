"use client";

import { usePlaidLink } from "react-plaid-link";

type LedgerPlaidAssetLinkProps = {
  token: string;
  onAssetTracked: () => Promise<void> | void;
};

export default function LedgerPlaidAssetLink({ token, onAssetTracked }: LedgerPlaidAssetLinkProps) {
  const { open, ready } = usePlaidLink({
    token,
    onSuccess: async (publicToken) => {
      try {
        const response = await fetch("/api/plaid/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token: publicToken }),
        });

        const data = (await response.json()) as { success?: boolean };
        if (data.success) {
          await Promise.resolve(onAssetTracked());
        }
      } catch (error) {
        console.error("Plaid asset tracking flow failed", error);
      }
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-sky-300 disabled:opacity-50"
    >
      Plaid Asset Track
    </button>
  );
}
